import { PrismaClient } from '@prisma/client'
import { ActivityLogType } from '../types/index.js'

export async function createComment(prisma: PrismaClient, workItemId: number, content: string) {
  const comment = await prisma.comment.create({
    data: {
      content,
      workItemId
    }
  })

  // 获取工作项标题用于日志
  const workItem = await prisma.workItem.findUnique({
    where: { id: workItemId },
    select: { title: true }
  })

  await prisma.activityLog.create({
    data: {
      type: ActivityLogType.COMMENT,
      description: `添加评论：${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
      workItemId
    }
  })

  return comment
}

export async function updateComment(prisma: PrismaClient, id: number, content: string) {
  return prisma.comment.update({
    where: { id },
    data: { content }
  })
}

export async function deleteComment(prisma: PrismaClient, id: number) {
  return prisma.comment.delete({ where: { id } })
}

export async function getCommentsByWorkItemId(prisma: PrismaClient, workItemId: number) {
  return prisma.comment.findMany({
    where: { workItemId },
    orderBy: { createdAt: 'desc' }
  })
}
