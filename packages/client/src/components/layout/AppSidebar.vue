<template>
  <aside class="w-64 bg-white border-r border-gray-200 fixed top-0 left-0 bottom-0 flex flex-col z-20">
    <!-- Logo -->
    <div class="p-6 border-b border-gray-200">
      <h1 class="text-xl font-bold flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Task Flow
      </h1>
      <p class="text-xs text-gray-500 mt-1 font-medium">本地工作日志系统</p>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto p-4 space-y-2">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item flex items-center gap-3 px-4 py-2 rounded-lg transition-colors"
        :class="$route.path === item.path ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'"
      >
        <component :is="item.icon" class="w-5 h-5" />
        {{ item.label }}
      </router-link>

      <!-- Dummy Categories Section from prototype -->
      <div class="pt-4 border-t border-gray-100 mt-4">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">我的分类</p>
        <a href="#" class="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
          <span class="w-2 h-2 rounded-full bg-blue-400"></span>
          项目 A
        </a>
      </div>
    </nav>

    <!-- User Profile Footer -->
    <div class="p-4 border-t border-gray-200">
      <div class="flex items-center gap-3 px-2">
        <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-blue-50">我</div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">本地用户</p>
          <p class="text-xs text-gray-500 truncate">离线模式</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { h, defineComponent } from 'vue'

const WorkItemsIcon = defineComponent({
  render() {
    return h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 6h16M4 12h16M4 18h16' })
    ])
  }
})

const DailyLogIcon = defineComponent({
  render() {
    return h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })
    ])
  }
})

const RecycleBinIcon = defineComponent({
  render() {
    return h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' })
    ])
  }
})

const navItems = [
  { path: '/', label: '工作项管理', icon: WorkItemsIcon },
  { path: '/daily-log', label: '按天日志查看', icon: DailyLogIcon },
  { path: '/recycle-bin', label: '回收站', icon: RecycleBinIcon }
]
</script>
