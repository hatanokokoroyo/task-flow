<template>
  <div class="flex min-h-screen bg-slate-50">
    <AppSidebar />
    <div class="flex-1 ml-60">
      <AppHeader :title="title" />
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

defineProps<{
  title: string
}>()
</script>
