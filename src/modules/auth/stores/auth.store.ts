import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authService from '@/modules/auth/services/auth.service'
import type { AuthUser, LoginCredentials } from '@/modules/auth/types/auth.types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(authService.getSession())
  const isAuthenticated = computed(() => user.value !== null)

  async function login(credentials: LoginCredentials): Promise<boolean> {
    user.value = await authService.login(credentials)
    return isAuthenticated.value
  }

  function logout(): void {
    authService.logout()
    user.value = null
  }

  return { user, isAuthenticated, login, logout }
})
