<template>
  <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
    <h1 class="text-xl font-semibold text-slate-800">{{ title }}</h1>
    <div class="flex items-center gap-4">
      <span class="text-slate-500 text-sm">{{ currentDate }}</span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

defineProps<{
  title: string
}>()

dayjs.locale('zh-cn')
const currentDate = computed(() => dayjs().format('YYYY年MM月DD日 dddd'))
</script>
