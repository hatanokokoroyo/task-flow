import { Router, type IRouter } from 'express'
import { z } from 'zod'
import { success, error } from '../utils/response.js'
import * as workItemService from '../services/work-item.js'

const router: IRouter = Router()

// 获取工作项列表
router.get('/', async (req, res, next) => {
  try {
    const { status, search, sort = 'updatedAt', order = 'desc' } = req.query
    const items = await workItemService.getWorkItems(req.prisma, {
      status: status as string | undefined,
      search: search as string | undefined,
      sort: sort as string,
      order: order as 'asc' | 'desc'
    })
    success(res, items)
  } catch (err) {
    next(err)
  }
})

// 获取工作项详情
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return error(res, '无效的工作项ID', 400, 400)
    }
    const item = await workItemService.getWorkItemById(req.prisma, id)
    if (!item) {
      return error(res, '工作项不存在', 404, 404)
    }
    success(res, item)
  } catch (err) {
    next(err)
  }
})

// 创建工作项
const createSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题最多200字符'),
  content: z.string().max(5000, '内容最多5000字符').optional(),
  project: z.string().max(64).optional(),
  tag: z.string().max(64).optional(),
  type: z.enum(['FEATURE', 'BUG', 'SUPPORT']).optional(),
  status: z.enum(['pending', 'design', 'develop', 'test', 'delivery', 'done']).default('pending'),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  parentId: z.number().optional()
})

router.post('/', async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body)
    const item = await workItemService.createWorkItem(req.prisma, data)
    success(res, item, '创建成功')
  } catch (err) {
    next(err)
  }
})

// 更新工作项
const updateSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题最多200字符').optional(),
  content: z.string().max(5000, '内容最多5000字符').optional(),
  project: z.string().max(64).optional().nullable(),
  tag: z.string().max(64).optional().nullable(),
  type: z.enum(['FEATURE', 'BUG', 'SUPPORT']).optional().nullable(),
  status: z.enum(['pending', 'design', 'develop', 'test', 'delivery', 'done']).optional(),
  startTime: z.string().datetime().optional().nullable(),
  endTime: z.string().datetime().optional().nullable()
})

router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return error(res, '无效的工作项ID', 400, 400)
    }
    const data = updateSchema.parse(req.body)
    const item = await workItemService.updateWorkItem(req.prisma, id, {
      ...data,
      startTime: data.startTime ?? undefined,
      endTime: data.endTime ?? undefined,
      project: data.project === null ? null : data.project ?? undefined,
      tag: data.tag === null ? null : data.tag ?? undefined,
      type: data.type === null ? undefined : data.type ?? undefined
    })
    success(res, item, '更新成功')
  } catch (err) {
    next(err)
  }
})

// 删除工作项（软删除）
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return error(res, '无效的工作项ID', 400, 400)
    }
    await workItemService.softDeleteWorkItem(req.prisma, id)
    success(res, null, '已移至回收站')
  } catch (err) {
    next(err)
  }
})

// 恢复工作项
router.post('/:id/restore', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return error(res, '无效的工作项ID', 400, 400)
    }
    const item = await workItemService.restoreWorkItem(req.prisma, id)
    success(res, item, '恢复成功')
  } catch (err) {
    next(err)
  }
})

// 彻底删除
router.delete('/:id/permanent', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return error(res, '无效的工作项ID', 400, 400)
    }
    await workItemService.permanentDeleteWorkItem(req.prisma, id)
    success(res, null, '已彻底删除')
  } catch (err) {
    next(err)
  }
})

export default router
