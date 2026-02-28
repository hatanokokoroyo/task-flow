<template>
  <div
    class="rounded-lg border hover:shadow-sm transition-shadow cursor-pointer"
    :class="cardClass"
    @click="$emit('click')">
    <div class="flex items-center justify-between gap-3 px-4 py-3">
      <div class="min-w-0 flex-1">
        <div v-if="depth > 0" class="inline-flex items-center gap-1 mb-2 text-xs text-slate-500 dark:text-slate-400">
          <span class="px-2 py-0.5 rounded" :class="childBadgeClass">子项 · 第 {{ depth }} 级</span>
        </div>
        <div class="flex items-center gap-2 mb-1 text-xs text-slate-500 dark:text-slate-400">
          <span v-if="item.project" class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">{{ item.project }}</span>
          <span v-if="item.tag" class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">{{ item.tag }}</span>
          <span v-if="item.type" class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">{{ item.type }}</span>
        </div>
        <h3 class="font-medium text-slate-800 dark:text-slate-100 truncate">{{ item.title }}</h3>
        <p v-if="item.content" class="text-slate-500 dark:text-slate-400 text-sm truncate mt-1">
          {{ item.content }}
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0" @click.stop>
        <StatusSelect v-model:modelValue="selectedStatus" :workItemId="item.id" :disabled="saving" @save="onSave"
          @change="(v) => onSave({ workItemId: item.id, status: v })" />
        <BaseButton size="sm" variant="ghost" @click="$emit('edit')">编辑</BaseButton>
        <BaseButton size="sm" variant="ghost" @click="$emit('delete')">删除</BaseButton>
      </div>
    </div>

    <div class="px-4 pb-3 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
      <div class="flex items-center gap-3">
        <span v-if="item.childStats" class="flex items-center gap-1">
          子项 {{ item.childStats.done }}/{{ item.childStats.total }}
        </span>
        <span v-if="item._count?.comments" class="flex items-center gap-1">
          评论 {{ item._count.comments }}
        </span>
      </div>
      <span>{{ formatDate(item.updatedAt || item.createdAt) }}</span>
    </div>

    <div v-if="progress" class="px-4 pb-4" @click.stop>
      <div class="flex items-center justify-between text-xs mb-1">
        <span class="text-slate-500 dark:text-slate-400">进度 {{ progress.percent }}%</span>
        <span class="text-slate-500 dark:text-slate-400">{{ progress.remainingText }}</span>
      </div>
      <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div class="h-full rounded-full transition-all" :class="progress.barClass" :style="{ width: `${progress.percent}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, ref, watch } from 'vue'
import type { WorkItem, Status } from '@/types'
import StatusSelect from '@/components/common/StatusSelect.vue'
import * as workItemApi from '@/api/work-item'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps<{
  item: WorkItem
  depth?: number
}>()

const emit = defineEmits<{
  click: []
  edit: []
  delete: []
  'status-updated': [newStatus: Status]
}>()

const selectedStatus = ref<Status>(props.item?.status || 'pending')
const saving = ref(false)
const toast = useToast()

const depth = computed(() => props.depth ?? 0)
const LEVEL_ACCENT_CLASSES = [
  {
    line: 'border-l-blue-500 dark:border-l-blue-400',
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200',
    surface: 'bg-blue-50/40 dark:bg-slate-800/70'
  },
  {
    line: 'border-l-violet-500 dark:border-l-violet-400',
    badge: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200',
    surface: 'bg-violet-50/40 dark:bg-slate-800/70'
  },
  {
    line: 'border-l-emerald-500 dark:border-l-emerald-400',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
    surface: 'bg-emerald-50/40 dark:bg-slate-800/70'
  },
  {
    line: 'border-l-amber-500 dark:border-l-amber-400',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200',
    surface: 'bg-amber-50/40 dark:bg-slate-800/70'
  },
  {
    line: 'border-l-rose-500 dark:border-l-rose-400',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200',
    surface: 'bg-rose-50/40 dark:bg-slate-800/70'
  }
] as const

const levelAccentClass = computed(() => {
  if (depth.value <= 0) {
    return null
  }
  return LEVEL_ACCENT_CLASSES[(depth.value - 1) % LEVEL_ACCENT_CLASSES.length]
})

const cardClass = computed(() => {
  if (depth.value > 0) {
    return `border-l-4 border-slate-200 dark:border-slate-600 ${levelAccentClass.value?.line} ${levelAccentClass.value?.surface}`
  }
  return 'border-l-4 border-l-slate-300 dark:border-l-slate-600 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
})

const childBadgeClass = computed(() => {
  return levelAccentClass.value?.badge || 'bg-slate-100 dark:bg-slate-700'
})

const progress = computed(() => {
  if (!props.item.startTime || !props.item.endTime) {
    return null
  }

  const start = dayjs(props.item.startTime)
  const end = dayjs(props.item.endTime)
  if (!start.isValid() || !end.isValid() || !end.isAfter(start)) {
    return null
  }

  const now = dayjs()
  const totalMs = end.diff(start)
  const elapsedMs = now.diff(start)
  const clampedElapsed = Math.min(Math.max(elapsedMs, 0), totalMs)
  const percent = Math.round((clampedElapsed / totalMs) * 100)

  const remainingRatioRaw = end.diff(now) / totalMs
  const remainingRatio = Math.min(Math.max(remainingRatioRaw, 0), 1)

  let barClass = 'bg-emerald-500'
  if (remainingRatio <= 0.2) {
    barClass = 'bg-rose-500'
  } else if (remainingRatio <= 0.5) {
    barClass = 'bg-amber-500'
  }

  const diffDays = end.startOf('day').diff(now.startOf('day'), 'day')
  const remainingText = diffDays >= 0
    ? `剩余${diffDays}天`
    : `已逾期${Math.abs(diffDays)}天`

  return {
    percent,
    remainingText,
    barClass
  }
})

watch(
  () => props.item?.status,
  (v) => {
    selectedStatus.value = v || 'pending'
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

function formatDate(date: string | null) {
  if (!date) return '--'
  return dayjs(date).format('MM-DD HH:mm')
}
</script>
