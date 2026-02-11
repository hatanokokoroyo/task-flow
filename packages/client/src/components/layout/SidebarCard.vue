<template>
  <div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
    <h4 v-if="title" class="font-bold text-sm mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
      <slot name="icon"></slot>
      {{ title }}
    </h4>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>
