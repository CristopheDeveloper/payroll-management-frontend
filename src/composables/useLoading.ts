import { readonly, ref } from 'vue'

const DEFAULT_LOADING_TIME = 250
const isLoading = ref(false)
const loadingMessage = ref('Cargando aplicación...')
let hideTimer: ReturnType<typeof setTimeout> | undefined

export function showLoading(message = 'Cargando información...'): void {
  clearHideTimer()
  loadingMessage.value = message
  isLoading.value = true
}

export function hideLoading(delay = DEFAULT_LOADING_TIME): void {
  clearHideTimer()

  hideTimer = setTimeout(() => {
    isLoading.value = false
    hideTimer = undefined
  }, delay)
}

export async function runWithLoading<T>(
  operation: () => Promise<T>,
  message = 'Procesando información...',
): Promise<T> {
  showLoading(message)

  try {
    return await operation()
  } finally {
    hideLoading(150)
  }
}

export function useLoading() {
  return {
    isLoading: readonly(isLoading),
    loadingMessage: readonly(loadingMessage),
    showLoading,
    hideLoading,
    runWithLoading,
  }
}

function clearHideTimer(): void {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = undefined
  }
}
