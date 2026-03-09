import api from './index'
import type { AIModelConfig, AISummaryResponse, UpdateAIModelConfigPayload } from '@/types'

interface SummarizePayload {
  summaryType: 'week' | 'month'
  dateAnchor?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export function summarize(payload: SummarizePayload) {
  return api.post<any, AISummaryResponse>('/ai/summaries', payload)
}

export function summarizeWeek(dateAnchor?: string, model?: string) {
  return summarize({ summaryType: 'week', dateAnchor, model })
}

export function summarizeMonth(dateAnchor?: string, model?: string) {
  return summarize({ summaryType: 'month', dateAnchor, model })
}

export function getModelConfig() {
  return api.get<any, AIModelConfig>('/ai/config')
}

export function updateModelConfig(payload: UpdateAIModelConfigPayload) {
  return api.put<any, AIModelConfig>('/ai/config', payload)
}
