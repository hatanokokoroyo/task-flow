import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as workItemApi from '@/api/work-item'
import * as statsApi from '@/api/stats'
import type { WorkItem, Stats, CreateWorkItemDto, UpdateWorkItemDto } from '@/types'

export const useWorkItemStore = defineStore('workItem', () => {
  const items = ref<WorkItem[]>([])
  const currentItem = ref<WorkItem | null>(null)
  const loading = ref(false)
  const stats = ref<Stats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    done: 0,
    recycled: 0
  })

  // Getters
  const pendingItems = computed(() => items.value.filter(i => i.status === 'pending'))
  const inProgressItems = computed(() => 
    items.value.filter(i => ['design', 'develop', 'test', 'delivery'].includes(i.status))
  )
  const doneItems = computed(() => items.value.filter(i => i.status === 'done'))

  // Actions
  async function fetchWorkItems(params?: {
    status?: string
    search?: string
    sort?: string
    order?: string
  }) {
    loading.value = true
    try {
      items.value = await workItemApi.getWorkItems(params)
    } finally {
      loading.value = false
    }
  }

  async function fetchWorkItem(id: number) {
    loading.value = true
    try {
      currentItem.value = await workItemApi.getWorkItem(id)
    } finally {
      loading.value = false
    }
  }

  async function createWorkItem(data: CreateWorkItemDto) {
    const item = await workItemApi.createWorkItem(data)
    items.value.unshift(item)
    await fetchStats()
    return item
  }

  async function updateWorkItem(id: number, data: UpdateWorkItemDto) {
    const item = await workItemApi.updateWorkItem(id, data)
    const index = items.value.findIndex(i => i.id === id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...item }
    }
    if (currentItem.value?.id === id) {
      currentItem.value = { ...currentItem.value, ...item }
    }
    await fetchStats()
    return item
  }

  async function deleteWorkItem(id: number) {
    await workItemApi.deleteWorkItem(id)
    items.value = items.value.filter(i => i.id !== id)
    await fetchStats()
  }

  async function restoreWorkItem(id: number) {
    await workItemApi.restoreWorkItem(id)
    await fetchStats()
  }

  async function permanentDeleteWorkItem(id: number) {
    await workItemApi.permanentDeleteWorkItem(id)
    await fetchStats()
  }

  async function fetchStats() {
    stats.value = await statsApi.getStats()
  }

  return {
    items,
    currentItem,
    loading,
    stats,
    pendingItems,
    inProgressItems,
    doneItems,
    fetchWorkItems,
    fetchWorkItem,
    createWorkItem,
    updateWorkItem,
    deleteWorkItem,
    restoreWorkItem,
    permanentDeleteWorkItem,
    fetchStats
  }
})
