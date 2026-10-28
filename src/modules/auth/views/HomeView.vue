<template>
  <section class="mx-auto w-full max-w-280 px-5 py-[clamp(3rem,8vw,7rem)]">
    <p class="mb-3 text-xs font-bold tracking-widest text-[#267e91] uppercase">Sesión protegida</p>
    <h1 class="m-0 text-[clamp(2rem,5vw,3.5rem)] font-bold text-[#203f45]">
      Bienvenido, {{ authStore.user?.fullName }}
    </h1>
    <p class="mt-2 font-semibold text-[#b34700]">Rol: {{ authStore.user?.role }}</p>
    <p class="mt-4 text-slate-500">El acceso fue validado correctamente.</p>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const authStore = useAuthStore()
</script>
