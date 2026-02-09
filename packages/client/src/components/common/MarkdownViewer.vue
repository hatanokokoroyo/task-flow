<template>
  <div v-if="isEditing" class="markdown-editor min-h-[100px]">
    <textarea
      ref="textareaRef"
      v-model="editContent"
      class="w-full min-h-[150px] p-5 rounded-xl border-2 border-primary-500 focus:outline-none bg-white shadow-sm resize-y font-mono text-sm"
      placeholder="输入 Markdown 内容..."
      @blur="handleBlur"
      @keydown.esc="cancelEdit"
      @keydown.ctrl.enter="handleBlur"
    ></textarea>
    <div class="mt-2 flex justify-end gap-2 text-xs text-slate-400">
      <span>Ctrl + Enter 保存</span>
      <span>Esc 取消</span>
    </div>
  </div>
  <div 
    v-else-if="content || editable" 
    class="markdown-container group relative border border-slate-200/60 rounded-xl bg-slate-50/40 p-5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all"
    :class="{ 
      'cursor-pointer hover:bg-slate-50/80 hover:border-primary-300': editable,
      'min-h-[60px] flex items-center justify-center': editable && !content 
    }"
    @click="startEdit"
  >
    <div v-if="content" class="prose prose-slate max-w-none prose-sm sm:prose-base" v-html="renderedContent"></div>
    <div v-else-if="editable" class="text-slate-400 italic py-2">点击添加描述...</div>
    
    <div v-if="editable && content" class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
      <span class="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-md border border-primary-100 font-medium">点击编辑</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { marked } from 'marked'

// Configure marked for better defaults
marked.setOptions({
  breaks: true,
  gfm: true
})

const props = defineProps<{
  content?: string | null
  editable?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', value: string): void
}>()

const isEditing = ref(false)
const editContent = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const renderedContent = computed(() => {
  return marked.parse(props.content || '')
})

const startEdit = () => {
  if (!props.editable) return
  editContent.value = props.content || ''
  isEditing.value = true
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

const handleBlur = () => {
  if (!isEditing.value) return
  
  const newValue = editContent.value.trim()
  const oldValue = (props.content || '').trim()
  
  isEditing.value = false
  
  if (newValue !== oldValue) {
    emit('save', newValue)
  }
}

const cancelEdit = () => {
  isEditing.value = false
}
</script>

<style scoped>
.markdown-container :deep(.prose) {
  /* Ensure images don't overflow */
  @apply max-w-none;
}

.markdown-container :deep(.prose pre) {
  @apply bg-slate-50 border border-slate-100 text-slate-700 rounded-lg p-4 my-4 overflow-x-auto;
}

.markdown-container :deep(.prose code) {
  @apply bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-[0.9em] font-normal before:content-none after:content-none;
}

.markdown-container :deep(.prose pre code) {
  @apply bg-transparent text-inherit p-0 text-sm;
}
</style>
