<template>
  <div class="space-y-2">
    <div v-for="item in items" :key="item.id" class="sub-item-node">
      <div
        class="flex items-center gap-2 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer group"
        @click="$emit('select', item)"
      >
        <!-- 使用固定宽度的容器包裹折叠按钮，解决有无子项时的对齐问题 -->
        <div class="w-6 flex-shrink-0 flex items-center justify-center">
          <button
            v-if="item.children && item.children.length > 0"
            class="w-5 h-5 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-600/50 rounded transition-colors"
            @click.stop="toggleExpand(item.id)"
          >
            {{ expanded.has(item.id) ? '▼' : '▶' }}
          </button>
        </div>

        <StatusSelect
          v-model:modelValue="item.status"
          :workItemId="item.id"
          :disabled="savingIds.has(item.id)"
          @save="(p) => onSave(item, p)"
          @change="(v) => onSave(item, { workItemId: item.id, status: v })"
        />

        <span class="flex-1 text-slate-700 dark:text-slate-200 truncate">{{ item.title }}</span>

        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button class="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" @click.stop="$emit('edit', item)">
            ✏️
          </button>
          <button class="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" @click.stop="$emit('delete', item)">
            🗑️
          </button>
        </div>
      </div>

      <div v-if="item.children && item.children.length > 0 && expanded.has(item.id)" class="ml-8 border-l border-slate-100 dark:border-slate-700">
        <SubItemTree
          :items="item.children"
          :expand-all="props.expandAll"
          @select="$emit('select', $event)"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>
    </div>

    <div v-if="items.length === 0" class="text-center py-8 text-slate-400 dark:text-slate-500">
      暂无子工作项
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { WorkItem, Status } from '@/types'
import StatusSelect from '@/components/common/StatusSelect.vue'
import * as workItemApi from '@/api/work-item'
import { useToast } from '@/composables/useToast'

const props = defineProps<{
  items: WorkItem[]
  expandAll?: boolean
}>()

defineEmits<{
  select: [item: WorkItem]
  edit: [item: WorkItem]
  delete: [item: WorkItem]
}>()

const expanded = ref(new Set<number>())
const savingIds = ref(new Set<number>())
const toast = useToast()

function collectIds(list: WorkItem[], set: Set<number>) {
  for (const it of list || []) {
    set.add(it.id)
    if (it.children && it.children.length) collectIds(it.children, set)
  }
}

// expand all nodes when `expandAll` is true or items change while expandAll is true
watch(
  [() => props.items, () => props.expandAll],
  ([items, expandAll]) => {
    if (expandAll) {
      const s = new Set<number>()
      collectIds(items, s)
      expanded.value = s
    }
  },
  { immediate: true, deep: true }
)

function toggleExpand(id: number) {
  if (expanded.value.has(id)) {
    expanded.value.delete(id)
  } else {
    expanded.value.add(id)
  }
}

// status updates handled by StatusSelect component
async function onSave(item: WorkItem, payload: { workItemId?: number | null; status: Status }) {
  const prev = item.status
  savingIds.value.add(item.id)
  try {
    await workItemApi.updateWorkItem(item.id, { status: payload.status })
    item.status = payload.status
    toast.success('状态已更新')
  } catch (err: any) {
    item.status = prev
    toast.error(err.message || '状态更新失败')
  } finally {
    savingIds.value.delete(item.id)
  }
}
</script>

<style scoped>
/* 使用 Tailwind group 优化 */
</style>
