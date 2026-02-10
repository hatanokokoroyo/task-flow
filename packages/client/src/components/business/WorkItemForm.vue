<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="grid grid-cols-3 gap-4">
      <BaseInput v-model="form.project" label="项目" placeholder="项目名称（可选）" />
      <BaseInput v-model="form.tag" label="标签" placeholder="标签（可选）" />
      <div>
        <label class="block text-sm font-medium text-slate-700">类型</label>
        <select v-model="form.type"
          class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 focus:ring-opacity-20">
          <option value="FEATURE">功能</option>
          <option value="BUG">缺陷</option>
          <option value="SUPPORT">支持</option>
        </select>
      </div>
    </div>

    <BaseInput v-model="form.title" label="标题" placeholder="请输入工作项标题" required :error="errors.title" />

    <div class="space-y-1">
      <label class="block text-sm font-medium text-slate-700">内容</label>
      <textarea v-model="form.content" placeholder="请输入工作项内容"
        class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 focus:ring-opacity-20 min-h-[120px]" />
    </div>

    <div class="space-y-1">
      <label class="block text-sm font-medium text-slate-700">状态</label>
      <select v-model="form.status"
        class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 focus:ring-opacity-20">
        <option v-for="(config, key) in STATUS_CONFIG" :key="key" :value="key">
          {{ config.label }}
        </option>
      </select>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <BaseInput v-model="form.startTime" type="datetime-local" label="开始时间" />
      <BaseInput v-model="form.endTime" type="datetime-local" label="结束时间" />
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <BaseButton variant="secondary" type="button" @click="$emit('cancel')">
        取消
      </BaseButton>
      <BaseButton type="submit" :loading="loading">
        {{ isEdit ? '保存' : '创建' }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { STATUS_CONFIG, type WorkItem, type CreateWorkItemDto } from '@/types'

const props = defineProps<{
  workItem?: WorkItem | null
  loading?: boolean
  parentId?: number
}>()

const emit = defineEmits<{
  submit: [data: CreateWorkItemDto]
  cancel: []
}>()

const isEdit = ref(!!props.workItem)

function getNowLocalDatetime() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}

const form = reactive({
  title: '',
  content: '',
  status: 'pending',
  startTime: '',
  endTime: '',
  project: '',
  tag: '',
  type: 'FEATURE'
})

const errors = reactive({
  title: ''
})

watch(() => props.workItem, (item) => {
  if (item) {
    isEdit.value = true
    form.title = item.title
    form.content = item.content || ''
    form.status = item.status
    form.startTime = item.startTime ? item.startTime.slice(0, 16) : ''
    form.endTime = item.endTime ? item.endTime.slice(0, 16) : ''
    form.project = item.project || ''
    form.tag = item.tag || ''
    form.type = item.type || 'FEATURE'
  } else {
    isEdit.value = false
    form.title = ''
    form.content = ''
    form.status = 'pending'
    form.startTime = getNowLocalDatetime()
    form.endTime = ''
    form.project = ''
    form.tag = ''
    form.type = 'FEATURE'
  }
}, { immediate: true })

function handleSubmit() {
  errors.title = ''

  if (!form.title.trim()) {
    errors.title = '标题不能为空'
    return
  }

  const data: CreateWorkItemDto = {
    title: form.title.trim(),
    content: form.content.trim() || undefined,
    status: form.status as any,
    startTime: form.startTime ? new Date(form.startTime).toISOString() : undefined,
    endTime: form.endTime ? new Date(form.endTime).toISOString() : undefined,
    parentId: props.parentId,
    project: form.project.trim() || undefined,
    tag: form.tag.trim() || undefined,
    type: form.type as any
  }

  emit('submit', data)
}
</script>
