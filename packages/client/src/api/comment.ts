import api from './index'
import type { Comment } from '@/types'

export function addComment(workItemId: number, content: string) {
  return api.post<any, Comment>(`/work-items/${workItemId}/comments`, { content })
}

export function updateComment(id: number, content: string) {
  return api.put<any, Comment>(`/comments/${id}`, { content })
}

export function deleteComment(id: number) {
  return api.delete(`/comments/${id}`)
}
