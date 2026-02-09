<template>
  <div class="space-y-4">
    <div v-for="comment in comments" :key="comment.id" class="flex gap-3">
      <div class="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
        👤
      </div>
      <div class="flex-1">
        <MarkdownViewer :content="comment.content" />
        <div class="flex items-center gap-3 mt-1 text-sm text-slate-400">
          <span>{{ formatDate(comment.createdAt) }}</span>
          <button class="hover:text-slate-600" @click="$emit('edit', comment)">编辑</button>
          <button class="hover:text-red-500" @click="$emit('delete', comment)">删除</button>
        </div>
      </div>
    </div>

    <div v-if="comments.length === 0" class="text-center py-8 text-slate-400">
      暂无评论
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import MarkdownViewer from '@/components/common/MarkdownViewer.vue'
import type { Comment } from '@/types'

defineProps<{
  comments: Comment[]
}>()

defineEmits<{
  edit: [comment: Comment]
  delete: [comment: Comment]
}>()

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}
</script>
