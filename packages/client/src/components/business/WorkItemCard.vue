<template>
  <div
    class="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
    @click="$emit('click')"
  >
    <div class="flex items-start justify-between mb-3">
      <h3 class="font-semibold text-slate-800 line-clamp-1">{{ item.title }}</h3>
      <StatusTag :status="item.status" />
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
import type { WorkItem } from '@/types'
import StatusTag from '@/components/common/StatusTag.vue'
import BaseButton from '@/components/common/BaseButton.vue'

defineProps<{
  item: WorkItem
}>()

defineEmits<{
  click: []
  edit: []
  delete: []
}>()

function formatDate(date: string) {
  return dayjs(date).format('MM-DD HH:mm')
}
</script>
