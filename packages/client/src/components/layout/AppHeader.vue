<template>
  <header class="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-8 sticky top-0 z-10 backdrop-blur-md bg-white/90 dark:bg-slate-800/90">
    <div class="flex items-center gap-4">
      <h1 class="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">{{ title }}</h1>
    </div>
    
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{{ currentDate }}</span>
      </div>
      
      <div class="flex items-center gap-3 pl-6 border-l border-gray-100 dark:border-slate-700">
        <!-- 主题切换按钮 -->
        <button 
          @click="uiStore.toggleTheme()"
          class="p-2 text-gray-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all"
          :title="uiStore.theme === 'light' ? '切换到夜间模式' : '切换到日间模式'"
        >
          <!-- 太阳图标 (夜间模式时显示) -->
          <svg v-if="uiStore.theme === 'dark'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <!-- 月亮图标 (日间模式时显示) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
        <button class="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-md shadow-blue-100 dark:shadow-blue-900/30 ring-2 ring-blue-50 dark:ring-blue-900/50">
          USER
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useUIStore } from '../../stores/ui'

defineProps<{
  title: string
}>()

const uiStore = useUIStore()

dayjs.locale('zh-cn')
const currentDate = computed(() => dayjs().format('YYYY年MM月DD日 dddd'))
</script>
