<template>
  <AppLayout title="工作项管理">
    <div class="max-w-7xl mx-auto">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <div class="text-2xl font-bold text-slate-800 dark:text-white">{{ stats.total }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400">全部工作项</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <div class="text-2xl font-bold text-slate-500 dark:text-slate-400">{{ stats.pending }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400">待处理</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <div class="text-2xl font-bold text-blue-500">{{ stats.inProgress }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400">进行中</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <div class="text-2xl font-bold text-green-500">{{ stats.done }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400">已完成</div>
        </div>
      </div>

      <!-- 工具栏 -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <input v-model="searchText" type="text" placeholder="搜索工作项..."
            class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 focus:ring-opacity-20 w-64 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            @input="debouncedSearch" />
          <div class="relative" ref="dropdownRef">
            <button type="button"
              class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 focus:ring-opacity-20 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 min-w-[160px] text-left flex items-center justify-between gap-2"
              @click="dropdownOpen = !dropdownOpen">
              <span class="truncate">{{ filterStatusLabel }}</span>
              <svg class="w-4 h-4 shrink-0 text-slate-400 transition-transform" :class="{ 'rotate-180': dropdownOpen }"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div v-if="dropdownOpen"
              class="absolute z-50 mt-1 w-52 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg py-1">
              <label v-for="(config, key) in STATUS_CONFIG" :key="key"
                class="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer text-sm text-slate-700 dark:text-slate-200">
                <input type="checkbox" :value="key" v-model="filterStatuses"
                  class="rounded border-slate-300 dark:border-slate-500 text-primary focus:ring-primary"
                  @change="onFilterStatusChange" />
                <span class="inline-block w-2 h-2 rounded-full" :style="{ backgroundColor: config.color }"></span>
                {{ config.label }}
              </label>
              <div class="border-t border-slate-200 dark:border-slate-600 mt-1 pt-1 px-3 py-1.5 flex justify-between">
                <button type="button" class="text-xs text-primary hover:underline" @click="selectAllStatuses">全选</button>
                <button type="button"
                  class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:underline"
                  @click="clearAllStatuses">清空</button>
              </div>
            </div>
          </div>
        </div>
        <BaseButton @click="openCreateModal">
          ➕ 新建工作项
        </BaseButton>
      </div>

      <!-- 工作项列表 -->
      <div v-if="loading" class="text-center py-12 text-slate-400 dark:text-slate-500">
        加载中...
      </div>
      <div v-else-if="flatItems.length === 0" class="text-center py-12 text-slate-400 dark:text-slate-500">
        暂无工作项
      </div>
      <div v-else class="space-y-3">
        <div v-for="entry in flatItems" :key="entry.item.id" class="flex items-stretch">
          <div v-if="entry.depth > 0" class="flex shrink-0 items-stretch pl-1 pr-2">
            <div v-for="level in entry.depth" :key="`${entry.item.id}-${level}`" class="w-4 relative">
              <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-dashed"
                :class="getLevelLineClass(level)"></div>
            </div>
          </div>
          <WorkItemCard
            class="flex-1"
            :item="entry.item"
            :depth="entry.depth"
            @click="goToDetail(entry.item.id)"
            @edit="openEditModal(entry.item)"
            @delete="handleDelete(entry.item)"
            @status-updated="handleStatusUpdated" />
        </div>
      </div>

      <!-- 新建/编辑模态框 -->
      <BaseModal :visible="modalVisible" :title="editingItem ? '编辑工作项' : '新建工作项'" @close="closeModal">
        <WorkItemForm :work-item="editingItem" :loading="formLoading" @submit="handleSubmit" @cancel="closeModal" />
      </BaseModal>
    </div>

    <!-- Toast 组件 -->
    <Toast />
    <!-- 确认对话框 -->
    <ConfirmDialog />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useWorkItemStore } from '@/stores/work-item'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import Toast from '@/components/common/Toast.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import WorkItemCard from '@/components/business/WorkItemCard.vue'
import WorkItemForm from '@/components/business/WorkItemForm.vue'
import { STATUS_CONFIG, type WorkItem, type CreateWorkItemDto } from '@/types'

const router = useRouter()
const store = useWorkItemStore()
const toast = useToast()
const { confirm } = useConfirm()

const { items, loading, stats } = storeToRefs(store)

const STORAGE_KEY = 'taskflow-filter-statuses'
const LEVEL_LINE_CLASSES = [
  'border-blue-300 dark:border-blue-500/70',
  'border-violet-300 dark:border-violet-500/70',
  'border-emerald-300 dark:border-emerald-500/70',
  'border-amber-300 dark:border-amber-500/70',
  'border-rose-300 dark:border-rose-500/70'
] as const

const searchText = ref('')
const filterStatuses = ref<string[]>(loadCachedStatuses())
const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const modalVisible = ref(false)
const editingItem = ref<WorkItem | null>(null)
const formLoading = ref(false)

let searchTimeout: number | null = null

const flatItems = computed(() => {
  const result: Array<{ item: WorkItem; depth: number }> = []

  const visit = (list: WorkItem[], depth: number) => {
    for (const item of list) {
      result.push({ item, depth })
      if (item.children && item.children.length > 0) {
        visit(item.children, depth + 1)
      }
    }
  }

  visit(items.value, 0)
  return result
})

const filterStatusLabel = computed(() => {
  if (filterStatuses.value.length === 0 || filterStatuses.value.length === Object.keys(STATUS_CONFIG).length) {
    return '全部状态'
  }
  return filterStatuses.value.map(s => STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label).join('、')
})

function getLevelLineClass(level: number) {
  return LEVEL_LINE_CLASSES[(level - 1) % LEVEL_LINE_CLASSES.length]
}

function loadCachedStatuses(): string[] {
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

function saveCachedStatuses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filterStatuses.value))
}

function onFilterStatusChange() {
  saveCachedStatuses()
  loadWorkItems()
}

function selectAllStatuses() {
  filterStatuses.value = Object.keys(STATUS_CONFIG)
  saveCachedStatuses()
  loadWorkItems()
}

function clearAllStatuses() {
  filterStatuses.value = []
  saveCachedStatuses()
  loadWorkItems()
}

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    dropdownOpen.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await Promise.all([
    loadWorkItems(),
    store.fetchStats()
  ])
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

async function loadWorkItems() {
  const statusParam = filterStatuses.value.length > 0 && filterStatuses.value.length < Object.keys(STATUS_CONFIG).length
    ? filterStatuses.value.join(',')
    : undefined
  await store.fetchWorkItems({
    status: statusParam,
    search: searchText.value || undefined
  })
}

function debouncedSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = window.setTimeout(() => {
    loadWorkItems()
  }, 300)
}

function goToDetail(id: number) {
  router.push(`/work-item/${id}`)
}

function openCreateModal() {
  editingItem.value = null
  modalVisible.value = true
}

function openEditModal(item: WorkItem) {
  editingItem.value = item
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
  editingItem.value = null
}

async function handleSubmit(data: CreateWorkItemDto) {
  formLoading.value = true
  try {
    if (editingItem.value) {
      await store.updateWorkItem(editingItem.value.id, data)
      toast.success('更新成功')
    } else {
      await store.createWorkItem(data)
      toast.success('创建成功')
    }
    closeModal()
    await loadWorkItems()
  } catch (err: any) {
    toast.error(err.message || '操作失败')
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(item: WorkItem) {
  const confirmed = await confirm({
    title: '删除确认',
    message: `确定要删除工作项"${item.title}"吗？删除后可在回收站恢复。`,
    type: 'danger',
    confirmText: '删除'
  })

  if (confirmed) {
    try {
      await store.deleteWorkItem(item.id)
      await loadWorkItems()
      toast.success('已移至回收站')
    } catch (err: any) {
      toast.error(err.message || '删除失败')
    }
  }
}

async function handleStatusUpdated() {
  await Promise.all([loadWorkItems(), store.fetchStats()])
}
</script>
