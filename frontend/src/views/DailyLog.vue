<script setup>
import { ref, onMounted } from 'vue';
import { logService } from '../services/work-item';
import { Clock, History } from 'lucide-vue-next';

const logs = ref([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    const data = await logService.getLogs();
    logs.value = data;
  } finally {
    loading.value = false;
  }
});

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<template>
  <div class="p-6 h-full overflow-y-auto">
    <h2 class="text-2xl font-bold mb-6">操作日志</h2>
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div v-if="loading" class="text-center py-8 text-gray-500">加载中...</div>
      <div v-else-if="logs.length === 0" class="text-center py-12">
        <History class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500">暂无操作记录</p>
      </div>
      <div v-else class="relative">
        <!-- Timeline Line -->
        <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100"></div>

        <div v-for="log in logs" :key="log.id" class="relative pl-10 pb-8 last:pb-0">
          <!-- Timeline Dot -->
          <div class="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-500 shadow-sm z-10"></div>
          
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-gray-900 leading-relaxed">
                <span class="font-medium">{{ log.content }}</span>
              </p>
              <div class="flex items-center gap-2 mt-1 text-xs text-gray-400">
                <Clock class="w-3 h-3" />
                {{ formatDate(log.created_at) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
