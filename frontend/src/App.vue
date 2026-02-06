<script setup>
import AppSidebar from './components/layout/AppSidebar.vue';
import AppHeader from './components/layout/AppHeader.vue';
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <AppSidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <AppHeader />
      <main class="flex-1 overflow-hidden bg-gray-50">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style>
@import './assets/css/main.css';
</style>
