import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import workItemRoutes from './routes/work-item.js'
import commentRoutes from './routes/comment.js'
import activityLogRoutes from './routes/activity-log.js'
import recycleBinRoutes from './routes/recycle-bin.js'
import statsRoutes from './routes/stats.js'
import { errorHandler } from './middleware/error-handler.js'
import { z } from 'zod'
import { success, error } from './utils/response.js'
import * as commentService from './services/comment.js'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// 将 prisma 实例附加到请求对象
app.use((req, res, next) => {
  req.prisma = prisma
  next()
})

// 路由
app.use('/api/v1/work-items', workItemRoutes)
app.use('/api/v1/comments', commentRoutes)
app.use('/api/v1/activity-logs', activityLogRoutes)
app.use('/api/v1/recycle-bin', recycleBinRoutes)
app.use('/api/v1/stats', statsRoutes)

// 评论路由 - 添加评论（挂载在 work-items 下）
const commentSchema = z.object({
  content: z.string().min(1, '评论内容不能为空').max(2000, '评论内容最多2000字符')
})

app.post('/api/v1/work-items/:workItemId/comments', async (req, res, next) => {
  try {
    const workItemId = parseInt(req.params.workItemId)
    if (isNaN(workItemId)) {
      return error(res, '无效的工作项ID', 400, 400)
    }
    const data = commentSchema.parse(req.body)
    const comment = await commentService.createComment(req.prisma, workItemId, data.content)
    success(res, comment, '评论添加成功')
  } catch (err) {
    next(err)
  }
})

// 错误处理
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

// 优雅关闭
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
