"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivityLogs = getActivityLogs;
exports.getCalendarData = getCalendarData;
async function getActivityLogs(prisma, options) {
    const { date, type, workItemId, order = 'desc' } = options;
    const where = {};
    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        where.createdAt = {
            gte: startOfDay,
            lte: endOfDay
        };
    }
    if (type) {
        where.type = type;
    }
    if (workItemId) {
        where.workItemId = workItemId;
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
    });
}
async function getCalendarData(prisma, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
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
    });
    // 按日期分组计数
    const dateCount = {};
    logs.forEach(log => {
        const dateKey = log.createdAt.toISOString().split('T')[0];
        dateCount[dateKey] = (dateCount[dateKey] || 0) + 1;
    });
    return dateCount;
}
