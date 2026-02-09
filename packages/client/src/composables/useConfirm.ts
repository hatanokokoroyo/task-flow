import { ref } from 'vue'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

const visible = ref(false)
const options = ref<ConfirmOptions>({
  message: ''
})
let resolvePromise: ((value: boolean) => void) | null = null

export function useConfirm() {
  function confirm(opts: ConfirmOptions): Promise<boolean> {
    options.value = {
      title: opts.title || '确认',
      message: opts.message,
      confirmText: opts.confirmText || '确认',
      cancelText: opts.cancelText || '取消',
      type: opts.type || 'info'
    }
    visible.value = true

    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  function handleConfirm() {
    visible.value = false
    resolvePromise?.(true)
    resolvePromise = null
  }

  function handleCancel() {
    visible.value = false
    resolvePromise?.(false)
    resolvePromise = null
  }

  return {
    visible,
    options,
    confirm,
    handleConfirm,
    handleCancel
  }
}
