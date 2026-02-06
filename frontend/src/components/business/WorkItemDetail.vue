<script setup>
import { ref, onMounted } from 'vue';
import { X, Send, Clock } from 'lucide-vue-next';
import StatusTag from '../common/StatusTag.vue';
import BaseButton from '../common/BaseButton.vue';
import SubItemTree from './SubItemTree.vue';
import { workItemService } from '../../services/work-item';

const props = defineProps({
  workItem: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'refresh']);

const commentContent = ref('');
const isSubmitting = ref(false);

const handleAddComment = async () => {
  if (!commentContent.value.trim()) return;
  isSubmitting.value = true;
  try {
    await workItemService.addComment(props.workItem.id, commentContent.value);
    commentContent.value = '';
    emit('refresh');
  } finally {
    isSubmitting.value = false;
  }
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString();
};
</script>

<template>
  <div class="h-full flex flex-col bg-white border-l border-gray-200 w-[400px] shadow-2xl">
    <div class="h-16 flex items-center justify-between px-6 border-b border-gray-100">
      <h3 class="font-bold text-lg truncate">详情</h3>
      <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
        <X class="w-5 h-5" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <!-- Info section -->
      <section class="space-y-4">
        <div class="flex items-center gap-2">
          <StatusTag :status="workItem.status" />
          <span class="text-xs text-gray-400">#{{ workItem.id }}</span>
        </div>
        <h2 class="text-xl font-bold text-gray-900">{{ workItem.title }}</h2>
        <div class="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg min-h-[100px] whitespace-pre-wrap">
          {{ workItem.content || '暂无描述' }}
        </div>

        <!-- Subtasks section -->
        <div v-if="workItem.children?.length" class="space-y-2">
          <h4 class="font-bold text-sm text-gray-900 uppercase tracking-wider">子任务</h4>
          <SubItemTree :items="workItem.children" />
        </div>

        <div class="flex items-center gap-4 text-xs text-gray-500">
          <div class="flex items-center gap-1.5">
            <Clock class="w-4 h-4" />
            创建于: {{ formatDate(workItem.created_at) }}
          </div>
        </div>
      </section>

      <!-- Comments section -->
      <section class="space-y-4 border-t border-gray-100 pt-6">
        <h4 class="font-bold text-sm text-gray-900 uppercase tracking-wider">评论</h4>
        
        <!-- Comment List (Placeholder for now) -->
        <div class="space-y-4">
          <div v-if="!workItem.comments || workItem.comments.length === 0" class="text-center py-4 text-gray-400 text-sm">
            暂无评论
          </div>
          <div v-for="comment in workItem.comments" :key="comment.id" class="flex gap-3">
            <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
              U
            </div>
            <div class="flex-1 bg-gray-50 p-3 rounded-lg">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold text-gray-700">用户</span>
                <span class="text-[10px] text-gray-400">{{ formatDate(comment.created_at) }}</span>
              </div>
              <p class="text-sm text-gray-600">{{ comment.content }}</p>
            </div>
          </div>
        </div>

        <!-- Add Comment -->
        <div class="pt-2">
          <textarea
            v-model="commentContent"
            rows="3"
            placeholder="添加一条评论..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          ></textarea>
          <div class="flex justify-end mt-2">
            <BaseButton size="sm" @click="handleAddComment" :loading="isSubmitting">
              <Send class="w-3 h-3" />
              发送
            </BaseButton>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
