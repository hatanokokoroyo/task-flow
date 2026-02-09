<template>
  <AppLayout title="工作项管理">
    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <div class="text-2xl font-bold text-slate-800">{{ stats.total }}</div>
        <div class="text-sm text-slate-500">全部工作项</div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <div class="text-2xl font-bold text-slate-500">{{ stats.pending }}</div>
        <div class="text-sm text-slate-500">待处理</div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <div class="text-2xl font-bold text-blue-500">{{ stats.inProgress }}</div>
        <div class="text-sm text-slate-500">进行中</div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <div class="text-2xl font-bold text-green-500">{{ stats.done }}</div>
        <div class="text-sm text-slate-500">已完成</div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <input v-model="searchText" type="text" placeholder="搜索工作项..."
          class="px-4 py-2 rounded-lg border border-slate-300 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 focus:ring-opacity-20 w-64"
          @input="debouncedSearch" />
        <select v-model="filterStatus"
          class="px-4 py-2 rounded-lg border border-slate-300 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 focus:ring-opacity-20"
          @change="loadWorkItems">
          <option value="">全部状态</option>
          <option v-for="(config, key) in STATUS_CONFIG" :key="key" :value="key">
            {{ config.label }}
          </option>
        </select>
      </div>
      <BaseButton @click="openCreateModal">
        ➕ 新建工作项
      </BaseButton>
    </div>

    <!-- 工作项列表 -->
    <div v-if="loading" class="text-center py-12 text-slate-400">
      加载中...
    </div>
    <div v-else-if="items.length === 0" class="text-center py-12 text-slate-400">
      暂无工作项
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <WorkItemCard v-for="item in items" :key="item.id" :item="item" @click="goToDetail(item.id)"
        @edit="openEditModal(item)" @delete="handleDelete(item)" />
    </div>

    <!-- 新建/编辑模态框 -->
    <BaseModal :visible="modalVisible" :title="editingItem ? '编辑工作项' : '新建工作项'" @close="closeModal">
      <WorkItemForm :work-item="editingItem" :loading="formLoading" @submit="handleSubmit" @cancel="closeModal" />
    </BaseModal>

    <!-- Toast 组件 -->
    <Toast />
    <!-- 确认对话框 -->
    <ConfirmDialog />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

const { items, loading, stats } = store

const searchText = ref('')
const filterStatus = ref('')
const modalVisible = ref(false)
const editingItem = ref<WorkItem | null>(null)
const formLoading = ref(false)

let searchTimeout: number | null = null

onMounted(async () => {
  await Promise.all([
    loadWorkItems(),
    store.fetchStats()
  ])
})

async function loadWorkItems() {
  await store.fetchWorkItems({
    status: filterStatus.value || undefined,
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
      toast.success('已移至回收站')
    } catch (err: any) {
      toast.error(err.message || '删除失败')
    }
  }
}
</script>
