<template>
  <aside class="w-60 bg-slate-800 text-white fixed top-0 left-0 bottom-0 flex flex-col">
    <!-- Logo -->
    <div class="h-16 flex items-center px-5 border-b border-slate-700">
      <span class="text-xl font-bold">📋 Task Flow</span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 py-4">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: $route.path === item.path }"
      >
        <component :is="item.icon" class="w-5 h-5" />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-slate-700 text-slate-400 text-sm">
      <div>Task Flow v1.0.0</div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { h } from 'vue'

const navItems = [
  { path: '/', label: '工作项管理', icon: () => h('span', '📋') },
  { path: '/daily-log', label: '日志查看', icon: () => h('span', '📅') },
  { path: '/recycle-bin', label: '回收站', icon: () => h('span', '🗑️') }
]
</script>

<style scoped>
.nav-item {
  @apply flex items-center gap-3 px-5 py-3 text-white/70 cursor-pointer transition-all border-l-[3px] border-transparent hover:bg-white/5 hover:text-white;
}
.nav-item.active {
  @apply bg-white/10 text-white border-l-primary;
}
</style>
