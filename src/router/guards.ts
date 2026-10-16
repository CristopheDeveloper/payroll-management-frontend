import type { Router } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

export function registerNavigationGuards(router: Router): void {
  router.beforeEach((to) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return { name: 'login' }
    }

    if (to.meta.guestOnly && authStore.isAuthenticated) {
      return { name: 'home' }
    }

    return true
  })
}
