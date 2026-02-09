<template>
  <AppLayout title="工作项详情">
    <div v-if="loading" class="text-center py-12 text-slate-400">
      加载中...
    </div>
    <div v-else-if="!currentItem" class="text-center py-12 text-slate-400">
      工作项不存在
    </div>
    <div v-else class="space-y-6">
      <!-- 面包屑 -->
      <div class="flex items-center gap-2 text-sm text-slate-500">
        <router-link to="/" class="hover:text-primary">工作项管理</router-link>
        <span>/</span>
        <span class="text-slate-800">{{ currentItem.title }}</span>
      </div>

      <!-- 基本信息 -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-xl font-bold text-slate-800 mb-2">{{ currentItem.title }}</h2>
            <div>
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

        <p v-if="currentItem.content" class="text-slate-600 mb-4 whitespace-pre-wrap">
          {{ currentItem.content }}
        </p>

        <div class="flex items-center gap-6 text-sm text-slate-500">
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
      <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">子工作项</h3>
          <BaseButton size="sm" @click="openSubItemModal">
            ➕ 添加子项
          </BaseButton>
        </div>
        <SubItemTree
          :items="currentItem.children || []"
          @select="goToDetail"
          @edit="openEditSubItemModal"
          @delete="handleDeleteSubItem"
        />
      </div>

      <!-- 评论 -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 class="text-lg font-semibold mb-4">评论</h3>
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
          class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 focus:ring-opacity-20 min-h-[120px]"
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
import SubItemTree from '@/components/business/SubItemTree.vue'
import CommentList from '@/components/business/CommentList.vue'
import CommentForm from '@/components/business/CommentForm.vue'
import WorkItemForm from '@/components/business/WorkItemForm.vue'
import type { WorkItem, Comment, CreateWorkItemDto } from '@/types'

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

onMounted(async () => {
  await store.fetchWorkItem(id.value)
})

const selectedStatus = ref<string>('')

watch(
  () => currentItem.value?.status,
  (v) => {
    selectedStatus.value = v || ''
  },
  { immediate: true }
)

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function goToDetail(item: WorkItem) {
  router.push(`/work-item/${item.id}`)
}

async function onSave(payload: { workItemId?: number | null; status: string }) {
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
  if (!editingComment.value) return
  commentLoading.value = true
  try {
    await commentApi.updateComment(editingComment.value.id, editingCommentContent.value)
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
