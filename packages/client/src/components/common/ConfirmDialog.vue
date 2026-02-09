<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <h3 class="text-lg font-semibold mb-2">{{ options.title }}</h3>
          <p class="text-slate-600 mb-6">{{ options.message }}</p>
          <div class="flex justify-end gap-3">
            <BaseButton variant="secondary" @click="handleCancel">
              {{ options.cancelText }}
            </BaseButton>
            <BaseButton
              :variant="options.type === 'danger' ? 'danger' : 'primary'"
              @click="handleConfirm"
            >
              {{ options.confirmText }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useConfirm } from '@/composables/useConfirm'
import BaseButton from './BaseButton.vue'

const { visible, options, handleConfirm, handleCancel } = useConfirm()
</script>

<style scoped>
.confirm-enter-active,
.confirm-leave-active {
  transition: opacity 0.3s ease;
}
.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
}
</style>
