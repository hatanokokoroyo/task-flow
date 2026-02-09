import { Router, type IRouter } from 'express'
import { success, error } from '../utils/response.js'
import * as activityLogService from '../services/activity-log.js'

const router: IRouter = Router()

// 获取活动日志列表
router.get('/', async (req, res, next) => {
  try {
    const { date, type, workItemId, order = 'desc' } = req.query
    const logs = await activityLogService.getActivityLogs(req.prisma, {
      date: date as string | undefined,
      type: type as string | undefined,
      workItemId: workItemId ? parseInt(workItemId as string) : undefined,
      order: order as 'asc' | 'desc'
    })
    success(res, logs)
  } catch (err) {
    next(err)
  }
})

// 获取日历数据
router.get('/calendar', async (req, res, next) => {
  try {
    const { year, month } = req.query
    if (!year || !month) {
      return error(res, '请提供年份和月份', 400, 400)
    }
    const data = await activityLogService.getCalendarData(
      req.prisma,
      parseInt(year as string),
      parseInt(month as string)
    )
    success(res, data)
  } catch (err) {
    next(err)
  }
})

export default router
