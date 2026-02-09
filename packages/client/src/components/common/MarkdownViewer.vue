<template>
  <div v-if="content" class="markdown-container border border-slate-200/60 rounded-xl bg-slate-50/40 p-5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
    <div class="prose prose-slate max-w-none prose-sm sm:prose-base" v-html="renderedContent"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

// Configure marked for better defaults
marked.setOptions({
  breaks: true,
  gfm: true
})

const props = defineProps<{
  content?: string | null
}>()

const renderedContent = computed(() => {
  return marked.parse(props.content || '')
})
</script>

<style scoped>
.markdown-container :deep(.prose) {
  /* Ensure images don't overflow */
  @apply max-w-none;
}

.markdown-container :deep(.prose pre) {
  @apply bg-slate-800 text-slate-100 rounded-lg p-4 my-4;
}

.markdown-container :deep(.prose code) {
  @apply bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-[0.9em] font-normal before:content-none after:content-none;
}

.markdown-container :deep(.prose pre code) {
  @apply bg-transparent text-inherit p-0 text-sm;
}
</style>
