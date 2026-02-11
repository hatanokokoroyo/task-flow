<template>
  <div class="status-select-wrapper" :class="[customClass]" ref="wrapperRef">
    <!-- 当前状态展示/触发器 -->
    <div 
      class="status-tag cursor-pointer active:scale-95 transition-transform"
      :style="{ 
        backgroundColor: config.bgColor, 
        color: config.color 
      }"
      :class="[{ 'is-disabled': props.disabled }]"
      @click.stop="toggleDropdown"
    >
      <span class="status-text">{{ label }}</span>
      <span class="ml-1 text-[10px] opacity-60">▼</span>
    </div>

    <!-- 自定义下拉列表 -->
    <div v-if="isOpen" class="status-dropdown" @click.stop>
      <div
        v-for="(cfg, key) in STATUS_CONFIG"
        :key="key"
        class="status-option-item"
        @click="onSelect(key as Status)"
      >
        <span 
          class="status-option-tag"
          :style="{ backgroundColor: cfg.bgColor, color: cfg.color }"
        >
          {{ cfg.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
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
const isOpen = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

const config = computed(() => {
  return STATUS_CONFIG[internal.value] || STATUS_CONFIG.pending
})

const label = computed(() => {
  return config.value.label
})

watch(() => props.modelValue, (v) => {
  if (v) internal.value = v
})

function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function onSelect(v: Status) {
  internal.value = v
  isOpen.value = false
  emit('update:modelValue', v)
  emit('change', v)

  if (props.autosave !== false && props.workItemId) {
    emit('save', { workItemId: props.workItemId, status: v })
  }
}

// 点击外部关闭逻辑
function handleOutsideClick(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
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
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  white-space: nowrap;
  user-select: none;
  transition: all 0.2s ease;
}

.status-tag.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* 下拉面板样式 */
.status-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 100;
  min-width: 110px;
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

:global(.dark) .status-dropdown {
  background: #334155;
  border-color: #475569;
}

.status-option-item {
  padding: 4px;
}

.status-option-tag {
  display: block;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: transform 0.1s ease, opacity 0.2s ease;
}

.status-option-tag:hover {
  opacity: 0.85;
  transform: translateY(-1px);
}

.status-option-tag:active {
  transform: translateY(0);
}
</style>
