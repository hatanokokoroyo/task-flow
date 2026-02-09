<template>
  <div class="space-y-2">
    <div v-for="item in items" :key="item.id" class="sub-item-node">
      <div
        class="flex items-center gap-2 p-3 rounded-lg hover:bg-slate-50 cursor-pointer"
        @click="$emit('select', item)"
      >
        <button
          v-if="item.children && item.children.length > 0"
          class="w-5 h-5 flex items-center justify-center text-slate-400"
          @click.stop="toggleExpand(item.id)"
        >
          {{ expanded.has(item.id) ? '▼' : '▶' }}
        </button>
        <span v-else class="w-5" />

        <StatusTag :status="item.status" />
        <span class="flex-1 text-slate-700">{{ item.title }}</span>

        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <button class="p-1 hover:bg-slate-100 rounded" @click.stop="$emit('edit', item)">
            ✏️
          </button>
          <button class="p-1 hover:bg-slate-100 rounded" @click.stop="$emit('delete', item)">
            🗑️
          </button>
        </div>
      </div>

      <div v-if="item.children && item.children.length > 0 && expanded.has(item.id)" class="ml-6">
        <SubItemTree
          :items="item.children"
          @select="$emit('select', $event)"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>
    </div>

    <div v-if="items.length === 0" class="text-center py-8 text-slate-400">
      暂无子工作项
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { WorkItem } from '@/types'
import StatusTag from '@/components/common/StatusTag.vue'

defineProps<{
  items: WorkItem[]
}>()

defineEmits<{
  select: [item: WorkItem]
  edit: [item: WorkItem]
  delete: [item: WorkItem]
}>()

const expanded = ref(new Set<number>())

function toggleExpand(id: number) {
  if (expanded.value.has(id)) {
    expanded.value.delete(id)
  } else {
    expanded.value.add(id)
  }
}
</script>

<style scoped>
.sub-item-node:hover > div:first-child > div:last-child {
  opacity: 1;
}
</style>
