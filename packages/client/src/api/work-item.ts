import api from './index'
import type { WorkItem, CreateWorkItemDto, UpdateWorkItemDto } from '@/types'

export function getWorkItems(params?: {
  status?: string
  search?: string
  sort?: string
  order?: string
}) {
  return api.get<any, WorkItem[]>('/work-items', { params })
}

export function getWorkItem(id: number) {
  return api.get<any, WorkItem>(`/work-items/${id}`)
}

export function createWorkItem(data: CreateWorkItemDto) {
  return api.post<any, WorkItem>('/work-items', data)
}

export function updateWorkItem(id: number, data: UpdateWorkItemDto) {
  return api.put<any, WorkItem>(`/work-items/${id}`, data)
}

export function deleteWorkItem(id: number) {
  return api.delete(`/work-items/${id}`)
}

export function restoreWorkItem(id: number) {
  return api.post(`/work-items/${id}/restore`)
}

export function permanentDeleteWorkItem(id: number) {
  return api.delete(`/work-items/${id}/permanent`)
}
