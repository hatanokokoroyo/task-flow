<script setup>
import { Search, Plus, Settings } from 'lucide-vue-next';

defineEmits(['open-create-modal']);
</script>

<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
    <div class="flex items-center flex-1">
      <div class="relative w-64">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
          <Search class="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder="搜索工作项..."
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
      </div>
    </div>
    <div class="flex items-center gap-4">
      <button
        @click="$emit('open-create-modal')"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        新建工作项
      </button>
      <button class="text-gray-500 hover:text-gray-700">
        <Settings class="w-5 h-5" />
      </button>
    </div>
  </header>
</template>
