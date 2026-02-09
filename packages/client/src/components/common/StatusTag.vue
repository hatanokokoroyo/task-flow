<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :style="{
      color: config.color,
      backgroundColor: config.bgColor
    }"
  >
    {{ config.label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { STATUS_CONFIG, type Status } from '@/types'

const props = defineProps<{
  status: Status
}>()

const config = computed(() => STATUS_CONFIG[props.status])
</script>
