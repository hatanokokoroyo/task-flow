<template>
  <div class="status-select-wrapper" :class="[customClass]">
    <div :class="['status-tag', `status-${internal}`, { 'is-disabled': props.disabled }]">
      <span class="status-dot"></span>
      <span class="status-text">{{ label }}</span>
    </div>

    <select
      class="status-select-native"
      :value="internal"
      :disabled="props.disabled"
      @click.stop
      @change="onChange"
    >
      <option
        v-for="(cfg, key) in STATUS_CONFIG"
        :key="key"
        :value="key"
        :style="{ color: cfg.color }"
      >
        ● {{ cfg.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Status } from '@/types'
import { STATUS_CONFIG } from '@/types'

const props = defineProps<{
  modelValue?: Status | null
  workItemId?: number | null
  autosave?: boolean
  disabled?: boolean
  class?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [v: Status]
  change: [v: Status]
  save: [{ workItemId?: number | null; status: Status }]
}>()

const internal = ref<Status>(props.modelValue || 'pending')
const customClass = props.class || ''

const label = computed(() => {
  return STATUS_CONFIG[internal.value]?.label || ''
})

watch(() => props.modelValue, (v) => {
  if (v) internal.value = v
})

function onChange(e: Event) {
  const v = (e.target as HTMLSelectElement).value as Status
  internal.value = v
  emit('update:modelValue', v)
  emit('change', v)

  if (props.autosave !== false && props.workItemId) {
    emit('save', { workItemId: props.workItemId, status: v })
  }
}
</script>

<style scoped>
.status-select-wrapper {
  position: relative;
  display: inline-flex;
  vertical-align: middle;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 20px;
  gap: 6px;
  white-space: nowrap;
  pointer-events: none;
}

.status-tag.is-disabled {
  opacity: 0.5;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

/* Status Colors from prototype styles.css */
.status-pending { background-color: rgba(156, 163, 175, 0.15); color: #6b7280; }
.status-pending .status-dot { background-color: #9ca3af; }

.status-design { background-color: rgba(59, 130, 246, 0.15); color: #2563eb; }
.status-design .status-dot { background-color: #3b82f6; }

.status-develop { background-color: rgba(16, 185, 129, 0.15); color: #059669; }
.status-develop .status-dot { background-color: #10b981; }

.status-test { background-color: rgba(245, 158, 11, 0.15); color: #d97706; }
.status-test .status-dot { background-color: #f59e0b; }

.status-delivery { background-color: rgba(249, 115, 22, 0.15); color: #ea580c; }
.status-delivery .status-dot { background-color: #f97316; }

.status-done { background-color: rgba(34, 197, 94, 0.15); color: #16a34a; }
.status-done .status-dot { background-color: #22c55e; }

/* Native Select overlay */
.status-select-native {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  appearance: none;
}
.status-select-native:disabled {
  cursor: not-allowed;
}

/* Option styling (limited browser support) */
option {
  padding: 4px;
  font-weight: normal;
}
</style>
