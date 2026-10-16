<template>
  <main class="min-h-screen bg-slate-50">
    <header class="flex min-h-18 items-center justify-between bg-[#123e4c] px-[clamp(1.25rem,5vw,4rem)] font-bold text-white">
      <span>Sistema de planillas</span>
      <button type="button" class="cursor-pointer rounded-lg border border-white/25 px-4 py-2 text-sm transition hover:bg-white/10" @click="handleLogout">
        Cerrar sesión
      </button>
    </header>
    <RouterView />
  </main>
</template>

<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  authStore.logout()
  await router.replace({ name: 'login' })
}
</script>
