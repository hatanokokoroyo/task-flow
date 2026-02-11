<template>
  <div
    class="flex flex-col bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer min-h-[200px]"
    @click="$emit('click')">
    <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
      <span v-if="item.project" class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">📁 {{ item.project }}</span>
      <span v-if="item.tag" class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">🏷️ {{ item.tag }}</span>
      <span v-if="item.type" class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">{{ item.type }}</span>
    </div>
    <div class="flex items-start justify-between mb-3">
      <h3 class="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">{{ item.title }}</h3>
      <div>
        <StatusSelect v-model:modelValue="selectedStatus" :workItemId="item.id" :disabled="saving" @save="onSave"
          @change="(v) => onSave({ workItemId: item.id, status: v })" />
      </div>
    </div>

    <p v-if="item.content" class="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4">
      {{ item.content }}
    </p>

    <div class="flex items-center justify-between text-sm text-slate-400 dark:text-slate-500">
      <div class="flex items-center gap-4">
        <span v-if="item.childStats" class="flex items-center gap-1">
          📁 {{ item.childStats.done }}/{{ item.childStats.total }}
        </span>
        <span v-if="item._count?.comments" class="flex items-center gap-1">
          💬 {{ item._count.comments }}
        </span>
      </div>
      <span>{{ formatDate(item.updatedAt) }}</span>
    </div>

    <!-- 操作按钮 - 始终固定在底部 -->
    <div class="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
      <BaseButton size="sm" variant="ghost" @click.stop="$emit('edit')">
        ✏️ 编辑
      </BaseButton>
      <BaseButton size="sm" variant="ghost" @click.stop="$emit('delete')">
        🗑️ 删除
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { ref, watch } from 'vue'
import type { WorkItem, Status } from '@/types'
import StatusSelect from '@/components/common/StatusSelect.vue'
import * as workItemApi from '@/api/work-item'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps<{
  item: WorkItem
}>()

const emit = defineEmits<{
  click: []
  edit: []
  delete: []
  'status-updated': [newStatus: Status]
}>()

const selectedStatus = ref<string>(props.item?.status || '')
const saving = ref(false)
const toast = useToast()

watch(
  () => props.item?.status,
  (v) => {
    selectedStatus.value = v || ''
  },
  { immediate: true }
)

async function onSave(payload: { workItemId?: number | null; status: Status }) {
  const prev = selectedStatus.value
  const newStatus = payload.status
  saving.value = true
  try {
    await workItemApi.updateWorkItem(props.item.id, { status: newStatus })
    selectedStatus.value = newStatus
    emit('status-updated', newStatus)
    toast.success('状态已更新')
  } catch (err: any) {
    selectedStatus.value = prev
    toast.error(err.message || '状态更新失败')
  } finally {
    saving.value = false
  }
}

function formatDate(date: string) {
  return dayjs(date).format('MM-DD HH:mm')
}
</script>
