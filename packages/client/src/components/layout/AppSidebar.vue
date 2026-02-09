<template>
  <aside class="w-60 bg-white border-r border-slate-200 fixed top-0 left-0 bottom-0 flex flex-col z-20">
    <!-- Logo -->
    <div class="h-16 flex items-center px-6">
      <span class="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">📋 Task Flow</span>
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
        <component :is="item.icon" class="w-5 h-5 opacity-70" />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Footer -->
    <div class="p-6 border-t border-slate-100 text-slate-400 text-xs">
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
  @apply flex items-center gap-3 px-6 py-3.5 text-slate-600 cursor-pointer transition-all hover:bg-slate-50 hover:text-primary-600;
}
.nav-item.active {
  @apply bg-primary-50 text-primary-700 font-medium;
}
</style>
