import { PrismaClient, Prisma } from '@prisma/client'
import { ActivityLogType } from '../types/index.js'

interface GetWorkItemsOptions {
  status?: string
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  includeDeleted?: boolean
}

export async function getWorkItems(prisma: PrismaClient, options: GetWorkItemsOptions) {
  const { status, search, sort = 'updatedAt', order = 'desc', includeDeleted = false } = options

  const where: Prisma.WorkItemWhereInput = {
    parentId: null, // 只获取顶级工作项
    deletedAt: includeDeleted ? undefined : null
  }

  if (status) {
    where.status = status
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } }
    ]
  }

  const orderBy: Prisma.WorkItemOrderByWithRelationInput = {
    [sort]: order
  }

  const items = await prisma.workItem.findMany({
    where,
    orderBy,
    include: {
      _count: {
        select: {
          children: true,
          comments: true
        }
      }
    }
  })

  // 计算子项统计
  return Promise.all(items.map(async (item) => {
    const childStats = await getChildStats(prisma, item.id)
    return { ...item, childStats }
  }))
}

export async function getWorkItemById(prisma: PrismaClient, id: number) {
  return prisma.workItem.findUnique({
    where: { id },
    include: {
      children: {
        where: { deletedAt: null },
        include: {
          children: {
            where: { deletedAt: null },
            include: {
              children: {
                where: { deletedAt: null }
              }
            }
          }
        }
      },
      comments: {
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          children: true,
          comments: true
        }
      }
    }
  })
}

export async function createWorkItem(prisma: PrismaClient, data: {
  title: string
  content?: string
  status?: string
  startTime?: string
  endTime?: string
  parentId?: number
  project?: string | null
  tag?: string | null
  type?: 'FEATURE' | 'BUG' | 'SUPPORT'
}) {
  const item = await prisma.workItem.create({
    data: {
      title: data.title,
      content: data.content,
      status: data.status || 'pending',
      startTime: data.startTime ? new Date(data.startTime) : null,
      endTime: data.endTime ? new Date(data.endTime) : null,
      parentId: data.parentId,
      project: data.project ?? null,
      tag: data.tag ?? null,
      type: data.type ?? undefined
    }
  })

  // 记录活动日志
  await prisma.activityLog.create({
    data: {
      type: ActivityLogType.CREATE,
      description: data.parentId ? `创建子工作项：${data.title}` : `创建工作项：${data.title}`,
      workItemId: item.id
    }
  })

  return item
}

export async function updateWorkItem(prisma: PrismaClient, id: number, data: {
  title?: string
  content?: string
  status?: string
  startTime?: string
  endTime?: string
  project?: string | null
  tag?: string | null
  type?: 'FEATURE' | 'BUG' | 'SUPPORT' | undefined
}) {
  const oldItem = await prisma.workItem.findUnique({ where: { id } })
  if (!oldItem) {
    throw new Error('工作项不存在')
  }

  const updateData: Prisma.WorkItemUpdateInput = {}
  const changes: string[] = []

  if (data.title !== undefined && data.title !== oldItem.title) {
    updateData.title = data.title
    changes.push('标题')
  }
  if (data.content !== undefined && data.content !== oldItem.content) {
    updateData.content = data.content
    changes.push('内容')
  }
  if (data.project !== undefined && data.project !== oldItem.project) {
    updateData.project = data.project
    changes.push('项目')
  }
  if (data.tag !== undefined && data.tag !== oldItem.tag) {
    updateData.tag = data.tag
    changes.push('标签')
  }
  if (data.type !== undefined && data.type !== oldItem.type) {
    updateData.type = data.type as any
    changes.push('类型')
  }
  if (data.startTime !== undefined) {
    updateData.startTime = data.startTime ? new Date(data.startTime) : null
    changes.push('开始时间')
  }
  if (data.endTime !== undefined) {
    updateData.endTime = data.endTime ? new Date(data.endTime) : null
    changes.push('结束时间')
  }

  // 状态变更单独记录
  if (data.status !== undefined && data.status !== oldItem.status) {
    updateData.status = data.status
    await prisma.activityLog.create({
      data: {
        type: ActivityLogType.STATUS,
        description: `状态从"${getStatusLabel(oldItem.status)}"变更为"${getStatusLabel(data.status)}"`,
        oldValue: oldItem.status,
        newValue: data.status,
        workItemId: id
      }
    })
  } else if (changes.length > 0) {
    await prisma.activityLog.create({
      data: {
        type: ActivityLogType.UPDATE,
        description: `更新了${changes.join('、')}`,
        workItemId: id
      }
    })
  }

  const item = await prisma.workItem.update({
    where: { id },
    data: updateData
  })

  return item
}

export async function softDeleteWorkItem(prisma: PrismaClient, id: number) {
  const item = await prisma.workItem.update({
    where: { id },
    data: { deletedAt: new Date() }
  })

  await prisma.activityLog.create({
    data: {
      type: ActivityLogType.DELETE,
      description: `删除工作项：${item.title}`,
      workItemId: id
    }
  })

  return item
}

export async function restoreWorkItem(prisma: PrismaClient, id: number) {
  const item = await prisma.workItem.update({
    where: { id },
    data: { deletedAt: null }
  })

  await prisma.activityLog.create({
    data: {
      type: ActivityLogType.RESTORE,
      description: `恢复工作项：${item.title}`,
      workItemId: id
    }
  })

  return item
}

export async function permanentDeleteWorkItem(prisma: PrismaClient, id: number) {
  return prisma.workItem.delete({ where: { id } })
}

async function getChildStats(prisma: PrismaClient, parentId: number) {
  const children = await prisma.workItem.findMany({
    where: { parentId, deletedAt: null },
    select: { status: true }
  })

  if (children.length === 0) return null

  const total = children.length
  const done = children.filter(c => c.status === 'done').length
  const percentage = Math.round((done / total) * 100)

  return { total, done, percentage }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '待处理',
    design: '设计中',
    develop: '开发中',
    test: '测试中',
    delivery: '交付中',
    done: '已完成'
  }
  return labels[status] || status
}
