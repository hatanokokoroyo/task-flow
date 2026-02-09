<template>
  <AppLayout title="回收站">
    <!-- 提示信息 -->
    <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
      <div class="flex items-center gap-2 text-yellow-800">
        <span>⚠️</span>
        <span>回收站中的工作项将在删除后 7 天自动彻底删除</span>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="flex items-center justify-between mb-6">
      <div class="text-slate-600">
        共 {{ items.length }} 个工作项
      </div>
      <BaseButton v-if="items.length > 0" variant="danger" @click="handleClearAll">
        🗑️ 清空回收站
      </BaseButton>
    </div>

    <!-- 列表 -->
    <div v-if="loading" class="text-center py-12 text-slate-400">
      加载中...
    </div>
    <div v-else-if="items.length === 0" class="text-center py-12 text-slate-400">
      回收站是空的
    </div>
    <div v-else class="space-y-4">
      <div
        v-for="item in items"
        :key="item.id"
        class="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between"
      >
        <div>
          <h3 class="font-semibold text-slate-800 mb-1">{{ item.title }}</h3>
          <div class="flex items-center gap-4 text-sm text-slate-400">
            <StatusTag :status="item.status" />
            <span>删除于：{{ formatDate(item.deletedAt!) }}</span>
            <span class="text-red-500">{{ getRemainingDays(item.expiresAt) }} 天后彻底删除</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <BaseButton size="sm" variant="secondary" @click="handleRestore(item)">
            ♻️ 恢复
          </BaseButton>
          <BaseButton size="sm" variant="danger" @click="handlePermanentDelete(item)">
            🗑️ 彻底删除
          </BaseButton>
        </div>
      </div>
    </div>

    <Toast />
    <ConfirmDialog />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useWorkItemStore } from '@/stores/work-item'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import * as statsApi from '@/api/stats'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import Toast from '@/components/common/Toast.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import type { WorkItem } from '@/types'

const store = useWorkItemStore()
const toast = useToast()
const { confirm } = useConfirm()

const items = ref<(WorkItem & { expiresAt: string })[]>([])
const loading = ref(false)

onMounted(async () => {
  await loadRecycleBin()
})

async function loadRecycleBin() {
  loading.value = true
  try {
    items.value = await statsApi.getRecycleBin()
  } catch (err: any) {
    toast.error(err.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function getRemainingDays(expiresAt: string) {
  return Math.max(0, dayjs(expiresAt).diff(dayjs(), 'day'))
}

async function handleRestore(item: WorkItem) {
  try {
    await store.restoreWorkItem(item.id)
    toast.success('恢复成功')
    await loadRecycleBin()
  } catch (err: any) {
    toast.error(err.message || '恢复失败')
  }
}

async function handlePermanentDelete(item: WorkItem) {
  const confirmed = await confirm({
    title: '彻底删除',
    message: `确定要彻底删除"${item.title}"吗？此操作不可恢复！`,
    type: 'danger',
    confirmText: '彻底删除'
  })

  if (confirmed) {
    try {
      await store.permanentDeleteWorkItem(item.id)
      toast.success('已彻底删除')
      await loadRecycleBin()
    } catch (err: any) {
      toast.error(err.message || '删除失败')
    }
  }
}

async function handleClearAll() {
  const confirmed = await confirm({
    title: '清空回收站',
    message: '确定要清空回收站吗？所有工作项将被彻底删除，此操作不可恢复！',
    type: 'danger',
    confirmText: '清空'
  })

  if (confirmed) {
    try {
      await statsApi.clearRecycleBin()
      toast.success('回收站已清空')
      await loadRecycleBin()
    } catch (err: any) {
      toast.error(err.message || '清空失败')
    }
  }
}
</script>
