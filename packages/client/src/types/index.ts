export type Status = 'pending' | 'design' | 'develop' | 'test' | 'delivery' | 'done'

export interface WorkItem {
  id: number
  title: string
  content: string | null
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
  status?: Status
  startTime?: string
  endTime?: string
  parentId?: number
}

export interface UpdateWorkItemDto {
  title?: string
  content?: string
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

export const STATUS_CONFIG: Record<Status, { label: string; color: string; bgColor: string }> = {
  pending: { label: '待处理', color: '#6b7280', bgColor: 'rgba(156, 163, 175, 0.15)' },
  design: { label: '设计中', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  develop: { label: '开发中', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  test: { label: '测试中', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  delivery: { label: '交付中', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.15)' },
  done: { label: '已完成', color: '#16a34a', bgColor: 'rgba(34, 197, 94, 0.15)' }
}
