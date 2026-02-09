<template>
  <div class="space-y-4">
    <div v-for="log in logs" :key="log.id" class="flex gap-3">
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center text-sm"
        :class="typeClasses[log.type]"
      >
        {{ typeIcons[log.type] }}
      </div>
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <router-link
            v-if="log.workItem"
            :to="`/work-item/${log.workItem.id}`"
            class="font-medium text-primary hover:underline"
          >
            {{ log.workItem.title }}
          </router-link>
        </div>
        <p class="text-slate-600">{{ log.description }}</p>
        <span class="text-sm text-slate-400">{{ formatDate(log.createdAt) }}</span>
      </div>
    </div>

    <div v-if="logs.length === 0" class="text-center py-8 text-slate-400">
      暂无活动日志
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import type { ActivityLog } from '@/types'

defineProps<{
  logs: ActivityLog[]
}>()

const typeIcons: Record<string, string> = {
  create: '➕',
  update: '✏️',
  status: '🔄',
  comment: '💬',
  delete: '🗑️',
  restore: '♻️'
}

const typeClasses: Record<string, string> = {
  create: 'bg-green-100 text-green-600',
  update: 'bg-blue-100 text-blue-600',
  status: 'bg-yellow-100 text-yellow-600',
  comment: 'bg-purple-100 text-purple-600',
  delete: 'bg-red-100 text-red-600',
  restore: 'bg-teal-100 text-teal-600'
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}
</script>
