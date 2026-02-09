import { Router, type IRouter } from 'express'
import { success } from '../utils/response.js'
import type { WorkItem } from '.prisma/client'

const router: IRouter = Router()

// 获取回收站列表
router.get('/', async (req, res, next) => {
  try {
    const items = await req.prisma.workItem.findMany({
      where: {
        deletedAt: { not: null },
        parentId: null // 只获取顶级工作项
      },
      orderBy: { deletedAt: 'desc' }
    })

    // 计算过期时间（7天后）
    const itemsWithExpiry = items.map((item: WorkItem) => {
      const deletedAt = item.deletedAt!
      const expiresAt = new Date(deletedAt.getTime() + 7 * 24 * 60 * 60 * 1000)
      return {
        ...item,
        expiresAt: expiresAt.toISOString()
      }
    })

    success(res, itemsWithExpiry)
  } catch (err) {
    next(err)
  }
})

// 清空回收站
router.delete('/', async (req, res, next) => {
  try {
    await req.prisma.workItem.deleteMany({
      where: {
        deletedAt: { not: null }
      }
    })
    success(res, null, '回收站已清空')
  } catch (err) {
    next(err)
  }
})

export default router
