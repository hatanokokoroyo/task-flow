import { Router, type IRouter } from 'express'
import { z } from 'zod'
import { success } from '../utils/response.js'
import * as aiService from '../services/ai.js'

const router: IRouter = Router()

const summarySchema = z.object({
  summaryType: z.enum(['week', 'month']),
  dateAnchor: z.string().optional(),
  model: z.string().min(1).max(128).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().max(16384).optional()
})

const configUpdateSchema = z.object({
  baseUrl: z.string().url('baseUrl 必须是合法 URL').optional(),
  apiKey: z.string().max(512).optional(),
  model: z.string().min(1).max(128).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().max(16384).nullable().optional(),
  timeoutMs: z.number().int().min(1000).max(120000).optional(),
  systemPrompt: z.string().min(1).max(4000).optional()
})

router.get('/config', async (req, res, next) => {
  try {
    const data = await aiService.getModelConfig(req.prisma)
    success(res, data)
  } catch (err) {
    next(err)
  }
})

router.put('/config', async (req, res, next) => {
  try {
    const payload = configUpdateSchema.parse(req.body)
    const data = await aiService.updateModelConfig(req.prisma, payload)
    success(res, data, '模型配置已保存')
  } catch (err) {
    next(err)
  }
})

router.post('/summaries', async (req, res, next) => {
  try {
    const payload = summarySchema.parse(req.body)
    const data = await aiService.generateSummary(req.prisma, payload)
    success(res, data, `${payload.summaryType === 'week' ? '本周' : '本月'}总结生成成功`)
  } catch (err) {
    next(err)
  }
})

export default router
