<script setup>
import { ListTodo, CalendarDays, Trash2, Circle } from 'lucide-vue-next';
import { useRoute } from 'vue-router';

const route = useRoute();

const navItems = [
  { name: '工作项管理', href: '/', icon: ListTodo },
  { name: '按天日志查看', href: '/daily-log', icon: CalendarDays },
  { name: '回收站', href: '/recycle-bin', icon: Trash2 },
];

const categories = [
  { name: '项目 A', color: 'text-blue-400' },
  { name: '个人提升', color: 'text-green-400' },
];
</script>

<template>
  <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
    <div class="p-6 border-b border-gray-200">
      <h1 class="text-xl font-bold flex items-center gap-2">
        <ListTodo class="text-blue-600 w-6 h-6" />
        Task Flow
      </h1>
      <p class="text-xs text-gray-500 mt-1">本地工作日志系统</p>
    </div>
    <nav class="flex-1 overflow-y-auto p-4 space-y-2">
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.href"
        class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors"
        :class="route.path === item.href ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-100 text-gray-700'"
      >
        <component :is="item.icon" class="w-5 h-5" />
        {{ item.name }}
      </router-link>

      <div class="pt-4 border-t border-gray-100 mt-4">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">我的分类</p>
        <a
          v-for="cat in categories"
          :key="cat.name"
          href="#"
          class="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
        >
          <Circle class="w-2 h-2" :class="cat.color" fill="currentColor" />
          {{ cat.name }}
        </a>
      </div>
    </nav>
    <div class="p-4 border-t border-gray-200">
      <div class="flex items-center gap-3 px-2">
        <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">我</div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">本地用户</p>
          <p class="text-xs text-gray-500 truncate">离线模式</p>
        </div>
      </div>
    </div>
  </aside>
</template>
