export const STATUS_VALUES = ['pending', 'design', 'develop', 'paused', 'test', 'delivery', 'done'] as const

export type Status = typeof STATUS_VALUES[number]

type StatusConfig = {
  label: string
  color: string
  bgColor: string
}

export const IN_PROGRESS_STATUSES: Status[] = ['design', 'develop', 'paused', 'test', 'delivery']

export const STATUS_OPTIONS: Array<{ value: Status } & StatusConfig> = [
  { value: 'pending', label: '待处理', color: '#6b7280', bgColor: 'rgba(156, 163, 175, 0.15)' },
  { value: 'design', label: '设计中', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  { value: 'develop', label: '开发中', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  { value: 'paused', label: '暂停中', color: '#a16207', bgColor: 'rgba(202, 138, 4, 0.16)' },
  { value: 'test', label: '测试中', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  { value: 'delivery', label: '交付中', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.15)' },
  { value: 'done', label: '已完成', color: '#16a34a', bgColor: 'rgba(34, 197, 94, 0.15)' }
]

export interface WorkItem {
  id: number
  title: string
  content: string | null
  project?: string | null
  tag?: string | null
  type?: 'FEATURE' | 'BUG' | 'SUPPORT' | null
  status: Status
  startTime: string | null
  endTime: string | null
  createdAt: string | null
  updatedAt: string | null
  deletedAt: string | null
  parentId: number | null
  children?: WorkItem[]
  comments?: Comment[]
  _count?: {
    children: number
    comments: number
  }
  childStats?: {
    total: number
    done: number
    percentage: number
  } | null
}

export interface Comment {
  id: number
  content: string
  createdAt: string
  updatedAt: string
  workItemId: number
}

export interface ActivityLog {
  id: number
  type: string
  description: string
  oldValue: string | null
  newValue: string | null
  createdAt: string
  workItemId: number
  workItem?: {
    id: number
    title: string
  }
}

export interface CreateWorkItemDto {
  title: string
  content?: string
  project?: string
  tag?: string
  type?: 'FEATURE' | 'BUG' | 'SUPPORT'
  status?: Status
  startTime?: string
  endTime?: string
  parentId?: number
}

export interface UpdateWorkItemDto {
  title?: string
  content?: string
  project?: string | null
  tag?: string | null
  type?: 'FEATURE' | 'BUG' | 'SUPPORT' | null
  status?: Status
  startTime?: string
  endTime?: string
}

export interface Stats {
  total: number
  pending: number
  inProgress: number
  done: number
  recycled: number
}

export interface AISummaryResponse {
  summary: string
  period: {
    type: 'week' | 'month'
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

export interface UpdateAIModelConfigPayload {
  baseUrl?: string
  apiKey?: string
  model?: string
  temperature?: number
  maxTokens?: number | null
  timeoutMs?: number
  systemPrompt?: string
}

export const STATUS_CONFIG: Record<Status, StatusConfig> = STATUS_OPTIONS.reduce((config, { value, ...statusConfig }) => {
  config[value] = statusConfig
  return config
}, {} as Record<Status, StatusConfig>)
