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

  const statuses = status
    ? status.split(',').map(s => s.trim()).filter(Boolean)
    : []
  const keyword = (search || '').trim().toLowerCase()

  const rows = await prisma.workItem.findMany({
    where: {
      deletedAt: includeDeleted ? undefined : null
    },
    include: {
      _count: {
        select: {
          children: true,
          comments: true
        }
      }
    }
  })

  const byParent = new Map<number | null, any[]>()
  for (const row of rows) {
    const key = row.parentId
    if (!byParent.has(key)) {
      byParent.set(key, [])
    }
    byParent.get(key)!.push({ ...row })
  }

  const buildTree = (parentId: number | null): any[] => {
    const list = byParent.get(parentId) || []
    return list.map((node) => {
      const children = buildTree(node.id)
      return {
        ...node,
        children,
        childStats: buildChildStats(children)
      }
    })
  }

  const matchesSelf = (item: any): boolean => {
    const statusMatched = statuses.length === 0 || statuses.includes(item.status)
    const searchMatched = !keyword
      || item.title?.toLowerCase().includes(keyword)
      || item.content?.toLowerCase().includes(keyword)
    return statusMatched && searchMatched
  }

  const filterTree = (list: any[]): any[] => {
    return list
      .map((item) => {
        const filteredChildren = filterTree(item.children || [])
        if (matchesSelf(item) || filteredChildren.length > 0) {
          return {
            ...item,
            children: filteredChildren,
            childStats: buildChildStats(filteredChildren)
          }
        }
        return null
      })
      .filter(Boolean) as any[]
  }

  const compareBySort = (a: any, b: any): number => {
    const av = normalizeSortValue(a[sort as keyof typeof a])
    const bv = normalizeSortValue(b[sort as keyof typeof b])
    if (av < bv) {
      return order === 'asc' ? -1 : 1
    }
    if (av > bv) {
      return order === 'asc' ? 1 : -1
    }
    return 0
  }

  const sortTree = (list: any[]): any[] => {
    const sorted = [...list].sort(compareBySort)
    return sorted.map((item) => ({
      ...item,
      children: sortTree(item.children || [])
    }))
  }

  const tree = buildTree(null)
  return sortTree(filterTree(tree))
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

function buildChildStats(children: any[]) {
  if (!children || children.length === 0) {
    return null
  }

  const total = children.length
  const done = children.filter(c => c.status === 'done').length
  const percentage = Math.round((done / total) * 100)

  return { total, done, percentage }
}

function normalizeSortValue(value: unknown): string | number {
  if (value == null) {
    return ''
  }

  if (value instanceof Date) {
    return value.getTime()
  }

  if (typeof value === 'string') {
    const timestamp = Date.parse(value)
    if (!Number.isNaN(timestamp)) {
      return timestamp
    }
    return value
  }

  if (typeof value === 'number') {
    return value
  }

  return String(value)
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
