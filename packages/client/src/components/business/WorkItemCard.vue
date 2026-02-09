<template>
  <div
    class="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer"
    @click="$emit('click')"
  >
        <div class="flex items-start justify-between mb-3">
          <h3 class="font-semibold text-slate-800 line-clamp-1">{{ item.title }}</h3>
          <div>
            <StatusSelect
              v-model:modelValue="selectedStatus"
              :workItemId="item.id"
              :disabled="saving"
              @save="onSave"
              @change="(v) => onSave({ workItemId: item.id, status: v })"
            />
          </div>
        </div>

    <p v-if="item.content" class="text-slate-500 text-sm line-clamp-2 mb-4">
      {{ item.content }}
    </p>

    <div class="flex items-center justify-between text-sm text-slate-400">
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

    <!-- 操作按钮 -->
    <div class="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
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
