import { PrismaClient } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      prisma: PrismaClient
    }
  }
}

export interface ApiResponse<T = any> {
  code: number
  data?: T
  message: string
}

export const StatusEnum = {
  PENDING: 'pending',
  DESIGN: 'design',
  DEVELOP: 'develop',
  TEST: 'test',
  DELIVERY: 'delivery',
  DONE: 'done'
} as const

export type Status = typeof StatusEnum[keyof typeof StatusEnum]

export const ActivityLogType = {
  CREATE: 'create',
  UPDATE: 'update',
  STATUS: 'status',
  COMMENT: 'comment',
  DELETE: 'delete',
  RESTORE: 'restore'
} as const

export type ActivityType = typeof ActivityLogType[keyof typeof ActivityLogType]

export const WorkItemTypeEnum = {
  FEATURE: 'FEATURE',
  BUG: 'BUG',
  SUPPORT: 'SUPPORT'
} as const

export type WorkItemType = typeof WorkItemTypeEnum[keyof typeof WorkItemTypeEnum]

export type AISummaryType = 'week' | 'month'

export interface AISummaryRequest {
  summaryType: AISummaryType
  dateAnchor?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface AISummaryResponse {
  summary: string
  period: {
    type: AISummaryType
    startDate: string
    endDate: string
    anchorDate: string
  }
  meta: {
    model: string
    temperature: number
    maxTokens?: number
    providerBaseUrl: string
    fallback: boolean
    fallbackReason?: string
  }
}

export interface AIModelConfig {
  baseUrl: string
  apiKey: string
  model: string
  temperature: number
  maxTokens?: number
  timeoutMs: number
  systemPrompt: string
}

export interface UpdateAIModelConfigRequest {
  baseUrl?: string
  apiKey?: string
  model?: string
  temperature?: number
  maxTokens?: number | null
  timeoutMs?: number
  systemPrompt?: string
}
