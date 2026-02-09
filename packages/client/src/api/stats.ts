import api from './index'
import type { Stats, WorkItem } from '@/types'

export function getStats() {
  return api.get<any, Stats>('/stats')
}

export function getRecycleBin() {
  return api.get<any, (WorkItem & { expiresAt: string })[]>('/recycle-bin')
}

export function clearRecycleBin() {
  return api.delete('/recycle-bin')
}
