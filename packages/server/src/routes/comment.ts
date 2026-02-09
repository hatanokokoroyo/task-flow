import { Router, type IRouter } from 'express'
import { z } from 'zod'
import { success, error } from '../utils/response.js'
import * as commentService from '../services/comment.js'

const router: IRouter = Router()

// 添加评论（这个路由在 work-item 路由中处理）
// PUT /api/v1/comments/:id - 编辑评论
const updateSchema = z.object({
  content: z.string().min(1, '评论内容不能为空').max(2000, '评论内容最多2000字符')
})

router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return error(res, '无效的评论ID', 400, 400)
    }
    const data = updateSchema.parse(req.body)
    const comment = await commentService.updateComment(req.prisma, id, data.content)
    success(res, comment, '更新成功')
  } catch (err) {
    next(err)
  }
})

// DELETE /api/v1/comments/:id - 删除评论
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return error(res, '无效的评论ID', 400, 400)
    }
    await commentService.deleteComment(req.prisma, id)
    success(res, null, '删除成功')
  } catch (err) {
    next(err)
  }
})

export default router
