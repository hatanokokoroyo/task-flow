import api from './index'
import type { ActivityLog } from '@/types'

export function getActivityLogs(params?: {
  date?: string
  type?: string
  workItemId?: number
  order?: string
}) {
  return api.get<any, ActivityLog[]>('/activity-logs', { params })
}

export function getCalendarData(year: number, month: number) {
  return api.get<any, Record<string, number>>('/activity-logs/calendar', { params: { year, month } })
}
