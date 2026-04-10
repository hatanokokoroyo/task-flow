import { Router, type IRouter } from 'express'
import { IN_PROGRESS_STATUSES } from '../types/index.js'
import { success } from '../utils/response.js'

const router: IRouter = Router()

// 获取工作项统计
router.get('/', async (req, res, next) => {
  try {
    const [total, pending, done, recycled, inProgressCounts] = await Promise.all([
      req.prisma.workItem.count({ where: { deletedAt: null, parentId: null } }),
      req.prisma.workItem.count({ where: { deletedAt: null, parentId: null, status: 'pending' } }),
      req.prisma.workItem.count({ where: { deletedAt: null, parentId: null, status: 'done' } }),
      req.prisma.workItem.count({ where: { deletedAt: { not: null }, parentId: null } }),
      Promise.all(
        IN_PROGRESS_STATUSES.map(status =>
          req.prisma.workItem.count({ where: { deletedAt: null, parentId: null, status } })
        )
      )
    ])

    const inProgress = inProgressCounts.reduce((sum, count) => sum + count, 0)

    success(res, {
      total,
      pending,
      inProgress,
      done,
      recycled
    })
  } catch (err) {
    next(err)
  }
})

export default router
