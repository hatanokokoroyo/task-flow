<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary' // primary, secondary, outline, danger
  },
  size: {
    type: String,
    default: 'md' // sm, md, lg
  },
  type: {
    type: String,
    default: 'button'
  },
  loading: Boolean
});
</script>

<template>
  <button
    :type="type"
    class="rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="{
      'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
      'bg-gray-100 text-gray-700 hover:bg-gray-200': variant === 'secondary',
      'border border-gray-300 text-gray-700 hover:bg-gray-50': variant === 'outline',
      'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
      'px-3 py-1.5 text-xs': size === 'sm',
      'px-4 py-2 text-sm': size === 'md',
      'px-6 py-3 text-base': size === 'lg'
    }"
    :disabled="loading"
  >
    <svg v-if="loading" class="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <slot />
  </button>
</template>
