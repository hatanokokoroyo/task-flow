<script setup>
import { ref, onMounted, computed } from 'vue';
import { useWorkItemStore } from '../stores/work-item';
import { Calendar, MessageSquare, MoreVertical, ChevronRight, Plus, Search } from 'lucide-vue-next';
import StatusTag from '../components/common/StatusTag.vue';
import BaseModal from '../components/common/BaseModal.vue';
import BaseButton from '../components/common/BaseButton.vue';
import WorkItemDetail from '../components/business/WorkItemDetail.vue';
import { workItemService } from '../services/work-item';

const store = useWorkItemStore();
const activeTab = ref('list');
const isCreateModalOpen = ref(false);
const selectedItem = ref(null);
const searchQuery = ref('');
const statusFilter = ref('');
const sortBy = ref('created_at');

const newItem = ref({
  title: '',
  content: '',
  status: 'todo',
  start_time: '',
  end_time: ''
});

const handleSearch = () => {
  store.fetchWorkItems({
    search: searchQuery.value,
    status: statusFilter.value || undefined,
    sort_by: sortBy.value
  });
};

const handleFilterChange = () => {
  handleSearch();
};

const filteredWorkItems = computed(() => {
  // Client-side tab filtering for quick switches, 
  // but handleSearch handles server-side filtering for search/sort
  if (activeTab.value === 'ongoing') {
    return store.workItems.filter(item => !['done', 'todo'].includes(item.status.toLowerCase()));
  }
  if (activeTab.value === 'completed') {
    return store.workItems.filter(item => item.status.toLowerCase() === 'done');
  }
  return store.workItems;
});

const handleCreate = async () => {
  if (!newItem.value.title) return;
  await store.createWorkItem(newItem.value);
  isCreateModalOpen.value = false;
  newItem.value = { title: '', content: '', status: 'todo', start_time: '', end_time: '' };
};

const openDetail = async (item) => {
  if (!item) return;
  try {
    const detail = await workItemService.getWorkItem(item.id);
    selectedItem.value = detail;
  } catch (error) {
    console.error('Failed to fetch detail:', error);
    selectedItem.value = item;
  }
};

const handleRefresh = async () => {
  await store.fetchWorkItems({
    search: searchQuery.value,
    status: statusFilter.value || undefined,
    sort_by: sortBy.value
  });
  if (selectedItem.value) {
    await openDetail(selectedItem.value);
  }
};

const handleDelete = async (id, event) => {
  event.stopPropagation();
  if (confirm('确认将此项移至回收站?')) {
    await store.deleteWorkItem(id);
  }
};

onMounted(() => {
  store.fetchWorkItems();
});

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN', { 
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<template>
  <div class="flex h-full relative overflow-hidden">
    <div class="flex-1 flex flex-col p-6 min-w-0 overflow-y-auto">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-2xl font-bold">工作项管理</h2>
        <div class="flex items-center gap-4">
          <div class="relative w-64">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search class="w-4 h-4" />
            </span>
            <input 
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text" 
              placeholder="搜索工作项..." 
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
          </div>
          <BaseButton @click="isCreateModalOpen = true">
            <Plus class="w-4 h-4" />
            新建工作项
          </BaseButton>
        </div>
      </div>

    <!-- Filters -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex border-b border-gray-200">
        <button
          @click="activeTab = 'list'"
          class="px-4 py-2 text-sm font-medium transition-colors"
          :class="activeTab === 'list' ? 'tab-active' : 'text-gray-500 hover:text-gray-700'"
        >
          所有
        </button>
        <button
          @click="activeTab = 'ongoing'"
          class="px-4 py-2 text-sm font-medium transition-colors"
          :class="activeTab === 'ongoing' ? 'tab-active' : 'text-gray-500 hover:text-gray-700'"
        >
          进行中
        </button>
        <button
          @click="activeTab = 'completed'"
          class="px-4 py-2 text-sm font-medium transition-colors"
          :class="activeTab === 'completed' ? 'tab-active' : 'text-gray-500 hover:text-gray-700'"
        >
          已完成
        </button>
      </div>

      <div class="flex items-center gap-2">
        <select 
          v-model="statusFilter" 
          @change="handleFilterChange"
          class="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
        >
          <option value="">所有状态</option>
          <option value="todo">待处理</option>
          <option value="design">设计中</option>
          <option value="dev">开发中</option>
          <option value="test">测试中</option>
          <option value="deploy">交付中</option>
          <option value="done">已完成</option>
        </select>
        <select 
          v-model="sortBy" 
          @change="handleFilterChange"
          class="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
        >
          <option value="created_at">按创建时间</option>
          <option value="start_time">按开始时间</option>
          <option value="end_time">按结束时间</option>
          <option value="title">按标题</option>
        </select>
      </div>
    </div>

    <!-- Work Item Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="store.loading" class="p-8 text-center text-gray-500">
        加载中...
      </div>
      <div v-else-if="filteredWorkItems.length === 0" class="p-12 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
          <Calendar class="w-8 h-8" />
        </div>
        <p class="text-gray-500">暂无相关工作项</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">开始时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预计结束</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">进度</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr 
              v-for="item in filteredWorkItems" 
              :key="item.id"
              @click="openDetail(item)"
              class="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ item.title }}</div>
                <div class="text-xs text-gray-500 truncate max-w-xs">{{ item.content }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <StatusTag :status="item.status" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(item.start_time) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(item.end_time) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="w-32">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-[10px] text-gray-500">{{ item.completed_children }}/{{ item.total_children }}</span>
                    <span class="text-[10px] font-medium text-gray-700">{{ item.progress_percentage }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      class="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                      :style="{ width: `${item.progress_percentage}%` }"
                    ></div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click.stop="openDetail(item)" class="text-blue-600 hover:text-blue-900 mr-3">详情</button>
                <button @click="handleDelete(item.id, $event)" class="text-red-600 hover:text-red-900">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Create Modal -->
    <BaseModal
      :is-open="isCreateModalOpen"
      title="新建工作项"
      @close="isCreateModalOpen = false"
    >
      <form @submit.prevent="handleCreate" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">标题</label>
          <input
            v-model="newItem.title"
            type="text"
            required
            placeholder="输入工作项标题"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">描述 (可选)</label>
          <textarea
            v-model="newItem.content"
            rows="3"
            placeholder="输入详细描述"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          ></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
            <input
              v-model="newItem.start_time"
              type="datetime-local"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">截止时间</label>
            <input
              v-model="newItem.end_time"
              type="datetime-local"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <select
            v-model="newItem.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="todo">待处理</option>
            <option value="design">设计中</option>
            <option value="dev">开发中</option>
            <option value="test">测试中</option>
            <option value="deploy">交付中</option>
            <option value="done">已完成</option>
          </select>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton variant="outline" type="button" @click="isCreateModalOpen = false">取消</BaseButton>
          <BaseButton type="submit">创建</BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Detail side panel -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <WorkItemDetail
        v-if="selectedItem"
        :work-item="selectedItem"
        @close="selectedItem = null"
        @refresh="handleRefresh"
        class="fixed right-0 top-0 bottom-0 z-40"
      />
    </Transition>
  </div>
</template>
