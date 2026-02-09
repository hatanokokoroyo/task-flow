<template>
  <header class="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
    <h1 class="text-xl font-bold text-slate-900 tracking-tight">{{ title }}</h1>
    <div class="flex items-center gap-6">
      <span class="text-slate-400 text-sm font-medium">{{ currentDate }}</span>
      <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs">
        👤
      </div>
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
