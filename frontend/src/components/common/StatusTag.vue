<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'md'
  }
});

const getStatusClass = (status) => {
  const s = status?.toLowerCase() || '';
  switch (s) {
    case 'todo': return 'status-todo';
    case 'design': return 'status-design';
    case 'dev': return 'status-dev';
    case 'test': return 'status-test';
    case 'deploy': return 'status-deploy';
    case 'done': return 'status-done';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getStatusLabel = (status) => {
  const s = status?.toLowerCase() || '';
  const labels = {
    todo: '待处理',
    design: '设计中',
    dev: '开发中',
    test: '测试中',
    deploy: '交付中',
    done: '已完成'
  };
  return labels[s] || status;
};
</script>

<template>
  <span
    class="rounded font-medium whitespace-nowrap"
    :class="[
      getStatusClass(status),
      size === 'sm' ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-xs'
    ]"
  >
    {{ getStatusLabel(status) }}
  </span>
</template>
