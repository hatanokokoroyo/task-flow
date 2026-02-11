<template>
  <div class="relative px-2 py-4">
    <!-- 时间轴连接线 -->
    <div class="absolute left-[3.25rem] top-8 bottom-8 w-0.5 bg-gray-100 dark:bg-slate-700"></div>

    <div class="space-y-10">
      <div v-for="log in logs" :key="log.id" class="relative flex gap-8">
        <!-- 时间 -->
        <div class="w-10 text-right text-xs text-gray-400 dark:text-slate-500 pt-2 shrink-0 font-medium">
          {{ formatTime(log.createdAt) }}
        </div>

        <!-- 图标圆圈 -->
        <div
          class="flex-shrink-0 w-8 h-8 rounded-full border-4 border-white dark:border-slate-800 shadow-sm z-10 flex items-center justify-center transition-transform hover:scale-110"
          :class="typeClasses[log.type]"
        >
          <span class="text-[10px]">{{ typeIcons[log.type] }}</span>
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1.5">
            <h5 class="text-sm font-bold text-gray-900 dark:text-white leading-none">
              {{ typeLabels[log.type] }}
            </h5>
          </div>
          
          <div class="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
            <template v-if="log.workItem">
              工作项 <router-link
                :to="`/work-item/${log.workItem.id}`"
                class="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                「{{ log.workItem.title }}」
              </router-link>
            </template>
            <div 
              v-if="log.type === 'comment'"
              class="mt-2 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 p-4 rounded-lg text-sm text-gray-600 dark:text-slate-300 italic shadow-sm"
            >
              "{{ log.description }}"
            </div>
            <p v-else class="mt-1">
              {{ log.description }}
            </p>
          </div>
          
          <div class="mt-2 text-[10px] text-gray-400 dark:text-slate-500 font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ formatDate(log.createdAt) }}
          </div>
        </div>
      </div>

      <div v-if="logs.length === 0" class="text-center py-16">
        <div class="w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-300 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-gray-400 dark:text-slate-500 text-sm">此日期下暂无活动记录</p>
      </div>
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

const typeLabels: Record<string, string> = {
  create: '创建记录',
  update: '信息更新',
  status: '状态变更',
  comment: '添加备注',
  delete: '移至回收站',
  restore: '记录恢复'
}

const typeClasses: Record<string, string> = {
  create: 'bg-yellow-100 text-yellow-600',
  update: 'bg-blue-100 text-blue-600',
  status: 'bg-green-100 text-green-600',
  comment: 'bg-purple-100 text-purple-600',
  delete: 'bg-red-100 text-red-600',
  restore: 'bg-teal-100 text-teal-600'
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

function formatTime(date: string) {
  return dayjs(date).format('HH:mm')
}
</script>
