<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal" :style="{ maxWidth: width }">
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="modal-close" @click="$emit('close')">×</button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  visible: boolean
  title: string
  width?: string
}>(), {
  width: '500px'
})

defineEmits<{
  close: []
}>()
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50;
}
.modal {
  @apply bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto;
}
.modal-header {
  @apply flex items-center justify-between px-6 py-5 border-b border-slate-200;
}
.modal-title {
  @apply text-lg font-semibold;
}
.modal-close {
  @apply w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 text-xl;
}
.modal-body {
  @apply p-6;
}
.modal-footer {
  @apply flex justify-end gap-3 px-6 py-4 border-t border-slate-200;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
