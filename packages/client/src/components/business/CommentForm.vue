<template>
  <div class="flex gap-3">
    <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
      👤
    </div>
    <div class="flex-1">
      <textarea
        v-model="content"
        placeholder="添加评论..."
        class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 focus:ring-opacity-20 min-h-[80px] resize-none"
      />
      <div class="flex justify-end mt-2">
        <BaseButton :loading="loading" :disabled="!content.trim()" @click="handleSubmit">
          发送
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [content: string]
}>()

const content = ref('')

function handleSubmit() {
  if (!content.value.trim()) return
  emit('submit', content.value.trim())
  content.value = ''
}
</script>
