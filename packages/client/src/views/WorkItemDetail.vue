<template>
  <AppLayout title="工作项详情">
    <div class="max-w-7xl mx-auto">
      <div v-if="loading" class="text-center py-12 text-slate-400 dark:text-slate-500">
      加载中...
    </div>
    <div v-else-if="!currentItem" class="text-center py-12 text-slate-400 dark:text-slate-500">
      工作项不存在
    </div>
    <div v-else class="space-y-6">
      <!-- 面包屑 -->
      <div class="flex items-center gap-3 text-sm">
        <router-link to="/" class="breadcrumb-link">工作项管理</router-link>
        <span class="breadcrumb-sep">/</span>
        <template v-for="a in ancestors" :key="a.id">
          <router-link :to="`/work-item/${a.id}`" class="breadcrumb-link">{{ a.title }}</router-link>
          <span class="breadcrumb-sep">/</span>
        </template>
        <span class="text-slate-800 dark:text-slate-100 current-breadcrumb">{{ currentItem.title }}</span>
      </div>

      <!-- 基本信息 -->
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="flex items-center gap-2 mb-2 text-sm text-slate-500 dark:text-slate-400">
              <span v-if="currentItem.project">📁 项目：{{ currentItem.project }}</span>
              <span v-if="currentItem.tag">🏷️ 标签：{{ currentItem.tag }}</span>
              <span v-if="currentItem.type">类型：{{ currentItem.type }}</span>
            </div>
            <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-2">{{ currentItem.title }}</h2>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-slate-500 dark:text-slate-400">状态：</span>
              <StatusSelect
                  v-model:modelValue="selectedStatus"
                  :workItemId="currentItem.id"
                  :disabled="saving"
                  @save="onSave"
                  @change="(v) => onSave({ status: v })"
                />
            </div>
          </div>
          <div class="flex items-center gap-2">
            <BaseButton variant="secondary" @click="openEditModal">
              ✏️ 编辑
            </BaseButton>
            <BaseButton variant="danger" @click="handleDelete">
              🗑️ 删除
            </BaseButton>
          </div>
        </div>

        <MarkdownViewer 
          :content="currentItem.content" 
          editable
          class="mb-4"
          @save="handleUpdateContent"
        />

        <div class="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
          <span v-if="currentItem.startTime">
            开始：{{ formatDate(currentItem.startTime) }}
          </span>
          <span v-if="currentItem.endTime">
            结束：{{ formatDate(currentItem.endTime) }}
          </span>
          <span>创建：{{ formatDate(currentItem.createdAt) }}</span>
          <span>更新：{{ formatDate(currentItem.updatedAt) }}</span>
        </div>
      </div>

      <!-- 子工作项 -->
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">子工作项</h3>
          <BaseButton size="sm" @click="openSubItemModal">
            ➕ 添加子项
          </BaseButton>
        </div>
        <SubItemTree
          :items="currentItem.children || []"
          :expand-all="true"
          @select="goToDetail"
          @edit="openEditSubItemModal"
          @delete="handleDeleteSubItem"
        />
      </div>

      <!-- 评论 -->
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">评论</h3>
        <CommentForm :loading="commentLoading" @submit="handleAddComment" />
        <div class="mt-6">
          <CommentList
            :comments="currentItem.comments || []"
            @edit="openEditCommentModal"
            @delete="handleDeleteComment"
          />
        </div>
      </div>
    </div>

    <!-- 编辑工作项模态框 -->
    <BaseModal
      :visible="editModalVisible"
      :title="editingSubItem ? '编辑子工作项' : '编辑工作项'"
      @close="closeEditModal"
    >
      <WorkItemForm
        :work-item="editingSubItem || currentItem"
        :loading="formLoading"
        :parent-id="editingSubItem ? currentItem?.id : undefined"
        @submit="handleUpdateWorkItem"
        @cancel="closeEditModal"
      />
    </BaseModal>

    <!-- 添加子工作项模态框 -->
    <BaseModal
      :visible="subItemModalVisible"
      title="添加子工作项"
      @close="closeSubItemModal"
    >
      <WorkItemForm
        :loading="formLoading"
        :parent-id="currentItem?.id"
        :initial-data="subItemInitialData"
        @submit="handleAddSubItem"
        @cancel="closeSubItemModal"
      />
    </BaseModal>

    <!-- 编辑评论模态框 -->
    <BaseModal
      :visible="editCommentModalVisible"
      title="编辑评论"
      @close="closeEditCommentModal"
    >
      <div class="space-y-4">
        <textarea
          v-model="editingCommentContent"
          @keydown.ctrl.enter.exact.prevent="handleUpdateComment"
          class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 focus:ring-opacity-20 min-h-[120px] bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        />
        <div class="flex justify-end gap-3">
          <BaseButton variant="secondary" @click="closeEditCommentModal">
            取消
          </BaseButton>
          <BaseButton :loading="commentLoading" @click="handleUpdateComment">
            保存
          </BaseButton>
        </div>
      </div>
    </BaseModal>
    </div>

    <Toast />
    <ConfirmDialog />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { useWorkItemStore } from '@/stores/work-item'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import * as commentApi from '@/api/comment'
import * as workItemApi from '@/api/work-item'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import StatusSelect from '@/components/common/StatusSelect.vue'
import Toast from '@/components/common/Toast.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import MarkdownViewer from '@/components/common/MarkdownViewer.vue'
import SubItemTree from '@/components/business/SubItemTree.vue'
import CommentList from '@/components/business/CommentList.vue'
import CommentForm from '@/components/business/CommentForm.vue'
import WorkItemForm from '@/components/business/WorkItemForm.vue'
import type { WorkItem, Comment, CreateWorkItemDto, Status } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useWorkItemStore()
const toast = useToast()
const { confirm } = useConfirm()

const currentItem = computed(() => store.currentItem)
const loading = computed(() => store.loading)

const editModalVisible = ref(false)
const subItemModalVisible = ref(false)
const editCommentModalVisible = ref(false)
const formLoading = ref(false)
const commentLoading = ref(false)
const editingSubItem = ref<WorkItem | null>(null)
const editingComment = ref<Comment | null>(null)
const editingCommentContent = ref('')

const id = computed(() => Number(route.params.id))

const saving = ref(false)
const ancestors = ref<WorkItem[]>([])
const subItemInitialData = computed(() => ({
  project: currentItem.value?.project || null,
  tag: currentItem.value?.tag || null,
  type: currentItem.value?.type || 'FEATURE'
}))

onMounted(async () => {
  await store.fetchWorkItem(id.value)
  await fetchAncestors()
})

// re-fetch when route id changes (navigate between work items without remount)
watch(
  id,
  async (v, old) => {
    if (v && v !== old) {
      await store.fetchWorkItem(v)
      await fetchAncestors()
    }
  }
)

async function fetchAncestors() {
  ancestors.value = []
  const startParentId = store.currentItem?.parentId ?? null
  let pid = startParentId
  while (pid) {
    try {
      const parent = await workItemApi.getWorkItem(pid)
      // keep top-down order: root ... immediate parent
      ancestors.value.unshift(parent)
      pid = parent.parentId
    } catch (err) {
      break
    }
  }
}

const selectedStatus = ref<Status>('pending')

watch(
  () => currentItem.value?.status,
  (v) => {
    selectedStatus.value = v || 'pending'
  },
  { immediate: true }
)

function formatDate(date: string | null) {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function goToDetail(item: WorkItem) {
  router.push(`/work-item/${item.id}`)
}

async function onSave(payload: { workItemId?: number | null; status: Status }) {
  if (!currentItem.value) return
  saving.value = true
  try {
    await workItemApi.updateWorkItem(currentItem.value.id, { status: payload.status })
    toast.success('状态已更新')
    await store.fetchWorkItem(id.value)
  } catch (err: any) {
    toast.error(err.message || '状态更新失败')
  } finally {
    saving.value = false
  }
}

// status updates handled by StatusSelect; listen to its `saved` event to refresh

function openEditModal() {
  editingSubItem.value = null
  editModalVisible.value = true
}

function openEditSubItemModal(item: WorkItem) {
  editingSubItem.value = item
  editModalVisible.value = true
}

function closeEditModal() {
  editModalVisible.value = false
  editingSubItem.value = null
}

function openSubItemModal() {
  subItemModalVisible.value = true
}

function closeSubItemModal() {
  subItemModalVisible.value = false
}

function openEditCommentModal(comment: Comment) {
  editingComment.value = comment
  editingCommentContent.value = comment.content
  editCommentModalVisible.value = true
}

function closeEditCommentModal() {
  editCommentModalVisible.value = false
  editingComment.value = null
  editingCommentContent.value = ''
}

async function handleUpdateWorkItem(data: CreateWorkItemDto) {
  formLoading.value = true
  try {
    const targetId = editingSubItem.value?.id || id.value
    await workItemApi.updateWorkItem(targetId, data)
    toast.success('更新成功')
    closeEditModal()
    await store.fetchWorkItem(id.value)
  } catch (err: any) {
    toast.error(err.message || '更新失败')
  } finally {
    formLoading.value = false
  }
}

async function handleUpdateContent(content: string) {
  if (!currentItem.value) return
  try {
    await workItemApi.updateWorkItem(currentItem.value.id, { content })
    toast.success('描述已更新')
    await store.fetchWorkItem(id.value)
  } catch (err: any) {
    toast.error(err.message || '更新失败')
  }
}

async function handleAddSubItem(data: CreateWorkItemDto) {
  formLoading.value = true
  try {
    await workItemApi.createWorkItem({ ...data, parentId: id.value })
    toast.success('添加成功')
    closeSubItemModal()
    await store.fetchWorkItem(id.value)
  } catch (err: any) {
    toast.error(err.message || '添加失败')
  } finally {
    formLoading.value = false
  }
}

async function handleDelete() {
  const confirmed = await confirm({
    title: '删除确认',
    message: `确定要删除工作项"${currentItem.value?.title}"吗？`,
    type: 'danger',
    confirmText: '删除'
  })

  if (confirmed) {
    try {
      await store.deleteWorkItem(id.value)
      toast.success('已移至回收站')
      router.push('/')
    } catch (err: any) {
      toast.error(err.message || '删除失败')
    }
  }
}

async function handleDeleteSubItem(item: WorkItem) {
  const confirmed = await confirm({
    title: '删除确认',
    message: `确定要删除子工作项"${item.title}"吗？`,
    type: 'danger',
    confirmText: '删除'
  })

  if (confirmed) {
    try {
      await workItemApi.deleteWorkItem(item.id)
      toast.success('已删除')
      await store.fetchWorkItem(id.value)
    } catch (err: any) {
      toast.error(err.message || '删除失败')
    }
  }
}

async function handleAddComment(content: string) {
  commentLoading.value = true
  try {
    await commentApi.addComment(id.value, content)
    toast.success('评论添加成功')
    await store.fetchWorkItem(id.value)
  } catch (err: any) {
    toast.error(err.message || '评论失败')
  } finally {
    commentLoading.value = false
  }
}

async function handleUpdateComment() {
  const content = editingCommentContent.value.trim()

  if (!editingComment.value || commentLoading.value || !content) return
  commentLoading.value = true
  try {
    await commentApi.updateComment(editingComment.value.id, content)
    toast.success('评论更新成功')
    closeEditCommentModal()
    await store.fetchWorkItem(id.value)
  } catch (err: any) {
    toast.error(err.message || '更新失败')
  } finally {
    commentLoading.value = false
  }
}

async function handleDeleteComment(comment: Comment) {
  const confirmed = await confirm({
    title: '删除确认',
    message: '确定要删除这条评论吗？',
    type: 'danger',
    confirmText: '删除'
  })

  if (confirmed) {
    try {
      await commentApi.deleteComment(comment.id)
      toast.success('评论已删除')
      await store.fetchWorkItem(id.value)
    } catch (err: any) {
      toast.error(err.message || '删除失败')
    }
  }
}
</script>

<style scoped>
.breadcrumb-link {
  color: #374151; /* slate-700 */
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.3125rem;
}
.breadcrumb-link:hover {
  color: #0ea5e9; /* brighter on hover */
  background: rgba(14,165,233,0.06);
}
.breadcrumb-sep {
  color: #9ca3af; /* slate-400 */
  font-size: 1rem;
  margin: 0 0.125rem;
}
.current-breadcrumb {
  background: linear-gradient(90deg, rgba(99,102,241,0.10), rgba(96,165,250,0.08));
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  color: #0f172a; /* slate-900 */
  font-weight: 700;
  font-size: 1rem;
}
</style>
