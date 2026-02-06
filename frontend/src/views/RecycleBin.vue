<script setup>
import { ref, onMounted } from 'vue';
import { recycleBinService } from '../services/work-item';
import { Trash2, RotateCcw, XCircle } from 'lucide-vue-next';

const deletedItems = ref([]);
const loading = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    deletedItems.value = await recycleBinService.getDeletedItems();
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const handleRestore = async (id) => {
  await recycleBinService.restoreItem(id);
  await fetchData();
};

const handlePermanentDelete = async (id) => {
  if (confirm('确定要永久删除吗？此操作不可撤销。')) {
    await recycleBinService.permanentlyDeleteItem(id);
    await fetchData();
  }
};
</script>

<template>
  <div class="p-6 h-full overflow-y-auto">
    <h2 class="text-2xl font-bold mb-6">回收站</h2>
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-500">加载中...</div>
      <div v-else-if="deletedItems.length === 0" class="p-12 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
          <Trash2 class="w-8 h-8" />
        </div>
        <p class="text-gray-500">回收站是空的</p>
      </div>
      <div v-else class="divide-y divide-gray-100">
        <div v-for="item in deletedItems" :key="item.id" class="p-4 hover:bg-gray-50 transition-colors">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-gray-900">{{ item.title }}</h3>
              <p class="text-xs text-gray-400 mt-1">删除于: {{ new Date(item.deleted_at).toLocaleString() }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="handleRestore(item.id)"
                class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <RotateCcw class="w-4 h-4" />
                还原
              </button>
              <button
                @click="handlePermanentDelete(item.id)"
                class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <XCircle class="w-4 h-4" />
                永久删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
