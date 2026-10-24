import type { Router } from 'vue-router'
import { hideLoading, showLoading } from '@/composables/useLoading'

export function registerLoadingGuards(router: Router): void {
  router.beforeEach(() => {
    showLoading('Cargando pantalla...')
    return true
  })

  router.afterEach(() => {
    hideLoading(250)
  })

  router.onError(() => {
    hideLoading(0)
  })
}
