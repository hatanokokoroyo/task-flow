import { PrismaClient, Prisma } from '@prisma/client'

interface GetActivityLogsOptions {
  date?: string
  type?: string
  workItemId?: number
  order?: 'asc' | 'desc'
}

export async function getActivityLogs(prisma: PrismaClient, options: GetActivityLogsOptions) {
  const { date, type, workItemId, order = 'desc' } = options

  const where: Prisma.ActivityLogWhereInput = {}

  if (date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    where.createdAt = {
      gte: startOfDay,
      lte: endOfDay
    }
  }

  if (type) {
    where.type = type
  }

  if (workItemId) {
    where.workItemId = workItemId
  }

  return prisma.activityLog.findMany({
    where,
    orderBy: { createdAt: order },
    include: {
      workItem: {
        select: {
          id: true,
          title: true
        }
      }
    }
  })
}

export async function getCalendarData(prisma: PrismaClient, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)

  const logs = await prisma.activityLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      createdAt: true
    }
  })

  // 按日期分组计数
  const dateCount: Record<string, number> = {}
  logs.forEach(log => {
    const dateKey = log.createdAt.toISOString().split('T')[0]
    dateCount[dateKey] = (dateCount[dateKey] || 0) + 1
  })

  return dateCount
}
