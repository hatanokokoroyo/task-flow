<script setup>
import { ChevronRight, ChevronDown, Circle } from 'lucide-vue-next';
import { ref } from 'vue';
import StatusTag from '../common/StatusTag.vue';

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
});

const expanded = ref({});

const toggle = (id) => {
  expanded.value[id] = !expanded.value[id];
};
</script>

<template>
  <ul class="space-y-2">
    <li v-for="item in items" :key="item.id">
      <div
        class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-sm border border-transparent hover:border-gray-100 transition-colors"
        @click.stop="item.children?.length && toggle(item.id)"
      >
        <div v-if="item.children?.length" class="text-gray-400">
          <ChevronDown v-if="expanded[item.id]" class="w-4 h-4" />
          <ChevronRight v-else class="w-4 h-4" />
        </div>
        <Circle v-else class="w-2 h-2 text-gray-300 ml-1 mr-1" fill="currentColor" />
        
        <span class="flex-1 truncate" :class="{ 'font-semibold': item.children?.length }">
          {{ item.title }}
        </span>
        
        <StatusTag :status="item.status" size="sm" />
      </div>
      
      <div v-if="expanded[item.id] && item.children?.length" class="ml-6 border-l-2 border-gray-100 pl-4 mt-2">
        <SubItemTree :items="item.children" />
      </div>
    </li>
  </ul>
</template>
