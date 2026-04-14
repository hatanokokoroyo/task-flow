<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="grid grid-cols-3 gap-4">
      <BaseInput v-model="form.project" label="项目" placeholder="项目名称（可选）" />
      <BaseInput v-model="form.tag" label="标签" placeholder="标签（可选）" />
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">类型</label>
        <select v-model="form.type"
          class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 focus:ring-opacity-20 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
          <option value="FEATURE">功能</option>
          <option value="BUG">缺陷</option>
          <option value="SUPPORT">支持</option>
        </select>
      </div>
    </div>

    <BaseInput v-model="form.title" label="标题" placeholder="请输入工作项标题" required :error="errors.title" />

    <div class="space-y-1">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">内容</label>
      <textarea v-model="form.content" placeholder="请输入工作项内容"
        class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 focus:ring-opacity-20 min-h-[120px] bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
    </div>

    <div class="space-y-1">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">状态</label>
      <StatusSelect v-model:modelValue="form.status" :autosave="false" fullWidth />
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
import StatusSelect from '@/components/common/StatusSelect.vue'
import type { WorkItem, CreateWorkItemDto, Status } from '@/types'

const props = defineProps<{
  workItem?: WorkItem | null
  loading?: boolean
  parentId?: number
  initialData?: {
    project?: string | null
    tag?: string | null
    type?: 'FEATURE' | 'BUG' | 'SUPPORT' | null
  }
}>()

const emit = defineEmits<{
  submit: [data: CreateWorkItemDto]
  cancel: []
}>()

const isEdit = ref(!!props.workItem)

function getNowLocalDatetime(defaultTime?: string) {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  let hours = now.getHours()
  let minutes = now.getMinutes()
  let seconds = now.getSeconds()
  if (defaultTime) {
    const m = defaultTime.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/)
    if (m) {
      hours = Number(m[1])
      minutes = Number(m[2])
      seconds = m[3] ? Number(m[3]) : 0
    }
  }
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

const form = reactive<{
  title: string
  content: string
  status: Status
  startTime: string
  endTime: string
  project: string
  tag: string
  type: 'FEATURE' | 'BUG' | 'SUPPORT'
}>({
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

watch(
  [() => props.workItem, () => props.initialData],
  ([item, initialData]) => {
    if (item) {
      isEdit.value = true
      form.title = item.title
      form.content = item.content || ''
      form.status = item.status
        form.startTime = item.startTime ? item.startTime.slice(0, 19) : ''
        form.endTime = item.endTime ? item.endTime.slice(0, 19) : ''
      form.project = item.project || ''
      form.tag = item.tag || ''
      form.type = item.type || 'FEATURE'
      return
    }

    isEdit.value = false
    form.title = ''
    form.content = ''
    form.status = 'pending'
      form.startTime = getNowLocalDatetime('09:00:00')
      form.endTime = getNowLocalDatetime('18:00:00')
    form.project = initialData?.project || ''
    form.tag = initialData?.tag || ''
    form.type = initialData?.type || 'FEATURE'
  },
  { immediate: true }
)

function handleSubmit() {
  errors.title = ''

  if (!form.title.trim()) {
    errors.title = '标题不能为空'
    return
  }

  const data: CreateWorkItemDto = {
    title: form.title.trim(),
    content: form.content.trim() || undefined,
    status: form.status,
    startTime: form.startTime ? new Date(form.startTime).toISOString() : undefined,
    endTime: form.endTime ? new Date(form.endTime).toISOString() : undefined,
    parentId: props.parentId,
    project: form.project.trim() || undefined,
    tag: form.tag.trim() || undefined,
    type: form.type
  }

  emit('submit', data)
}
</script>
