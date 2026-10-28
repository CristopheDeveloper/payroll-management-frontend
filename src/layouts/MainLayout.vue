<template>
  <div class="min-h-screen bg-[#eef0e6] lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
    <aside
      class="sticky top-0 hidden h-screen flex-col overflow-y-auto border-r border-[#69d2e7]/20 bg-[#203f45] text-white lg:flex"
      aria-label="Navegación principal"
    >
      <div class="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <span
          class="grid h-10 w-10 place-items-center rounded-xl bg-[#69d2e7] text-[#203f45] shadow-lg shadow-black/10"
        >
          <svg class="h-6 w-6" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              d="M8 9.5h16M8 15.5h16M8 21.5h9"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
            />
            <path
              d="M22 20v5m-2.5-2.5h5"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
            />
            <rect
              x="4"
              y="4"
              width="24"
              height="24"
              rx="7"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </span>
        <div>
          <p class="font-bold leading-tight">Planilla</p>
          <p class="mt-0.5 text-xs text-white/50">Gestión administrativa</p>
        </div>
      </div>

      <nav class="flex-1 px-4 py-6">
        <p class="mb-3 px-3 text-[0.65rem] font-bold tracking-[0.18em] text-white/35 uppercase">
          Principal
        </p>
        <RouterLink
          :to="{ name: 'home' }"
          class="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-white/70 transition hover:bg-[#69d2e7]/15 hover:text-white"
          exact-active-class="!bg-[#fa6900] !text-[#202f33] shadow-lg shadow-black/15"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9Z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
          </svg>
          Inicio
        </RouterLink>
        <RouterLink
          :to="{ name: 'users' }"
          class="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-white/70 transition hover:bg-[#69d2e7]/15 hover:text-white"
          active-class="!bg-[#fa6900] !text-[#202f33] shadow-lg shadow-black/15"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="9" cy="8" r="4" stroke="currentColor" stroke-width="1.8" />
            <path
              d="M2.5 20c.7-4 2.9-6 6.5-6s5.8 2 6.5 6M17 8h5m-2.5-2.5v5"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
          Usuarios
        </RouterLink>

        <p
          class="mt-8 mb-3 px-3 text-[0.65rem] font-bold tracking-[0.18em] text-white/35 uppercase"
        >
          Nómina
        </p>
        <RouterLink
          :to="{ name: 'employees' }"
          class="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-white/70 transition hover:bg-[#69d2e7]/15 hover:text-white"
          active-class="!bg-[#fa6900] !text-[#202f33] shadow-lg shadow-black/15"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm10 9v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.15a3.5 3.5 0 0 1 0 6.7"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Empleados
        </RouterLink>
        <RouterLink
          :to="{ name: 'attendance' }"
          class="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-white/70 transition hover:bg-[#69d2e7]/15 hover:text-white"
          active-class="!bg-[#fa6900] !text-[#202f33] shadow-lg shadow-black/15"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect
              x="3"
              y="5"
              width="18"
              height="16"
              rx="2"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <path
              d="M3 10h18M8 3v4m8-4v4m-7 7 2 2 4-4"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Asistencia
        </RouterLink>
        <RouterLink
          :to="{ name: 'payrolls' }"
          class="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-white/70 transition hover:bg-[#69d2e7]/15 hover:text-white"
          active-class="!bg-[#fa6900] !text-[#202f33] shadow-lg shadow-black/15"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 20V10m6 10V4m6 16v-7m4 7H2"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
          Planillas
        </RouterLink>

        <p
          class="mt-8 mb-3 px-3 text-[0.65rem] font-bold tracking-[0.18em] text-white/35 uppercase"
        >
          Catálogos
        </p>
        <RouterLink
          :to="{ name: 'departments' }"
          class="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-white/70 transition hover:bg-[#69d2e7]/15 hover:text-white"
          active-class="!bg-[#fa6900] !text-[#202f33] shadow-lg shadow-black/15"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M2 21h20M8 7h4M8 11h4M8 15h4"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
          Departamentos
        </RouterLink>
        <RouterLink
          :to="{ name: 'positions' }"
          class="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-white/70 transition hover:bg-[#69d2e7]/15 hover:text-white"
          active-class="!bg-[#fa6900] !text-[#202f33] shadow-lg shadow-black/15"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Zm6-2V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Puestos
        </RouterLink>
        <RouterLink
          :to="{ name: 'concepts' }"
          class="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-white/70 transition hover:bg-[#69d2e7]/15 hover:text-white"
          active-class="!bg-[#fa6900] !text-[#202f33] shadow-lg shadow-black/15"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 6h16M4 12h10M4 18h7M17 15v6m-3-3h6"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
          Rubros
        </RouterLink>

        <p
          class="mt-8 mb-3 px-3 text-[0.65rem] font-bold tracking-[0.18em] text-white/35 uppercase"
        >
          Próximamente
        </p>
        <button
          type="button"
          class="mb-1 flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold text-white/25"
          disabled
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8" />
            <path
              d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linejoin="round"
            />
          </svg>
          Configuración
        </button>
      </nav>

      <div class="border-t border-white/10 p-4">
        <div class="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <span
            class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#f38630] text-xs font-bold text-[#202f33]"
            >{{ userInitials }}</span
          >
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold">{{ authStore.user?.fullName }}</p>
            <p class="truncate text-xs text-white/45">{{ authStore.user?.role }}</p>
          </div>
          <button
            type="button"
            class="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-white"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            @click="handleLogout"
          >
            <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5m5-4 3-3-3-3m3 3H8"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <div class="min-w-0">
      <header
        class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden"
      >
        <span class="shrink-0 font-bold text-[#203f45]">Sistema de planillas</span>
        <nav class="-mr-2 ml-3 flex min-w-0 items-center gap-1 overflow-x-auto">
          <RouterLink
            :to="{ name: 'home' }"
            class="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-slate-500"
            exact-active-class="!bg-[#a7dbd8] !text-[#203f45]"
            >Inicio</RouterLink
          >
          <RouterLink
            :to="{ name: 'users' }"
            class="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-slate-500"
            active-class="!bg-[#a7dbd8] !text-[#203f45]"
            >Usuarios</RouterLink
          >
          <RouterLink
            :to="{ name: 'employees' }"
            class="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-slate-500"
            active-class="!bg-[#a7dbd8] !text-[#203f45]"
            >Empleados</RouterLink
          >
          <RouterLink
            :to="{ name: 'attendance' }"
            class="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-slate-500"
            active-class="!bg-[#a7dbd8] !text-[#203f45]"
            >Asistencia</RouterLink
          >
          <RouterLink
            :to="{ name: 'payrolls' }"
            class="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-slate-500"
            active-class="!bg-[#a7dbd8] !text-[#203f45]"
            >Planillas</RouterLink
          >
          <RouterLink
            :to="{ name: 'departments' }"
            class="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-slate-500"
            active-class="!bg-[#a7dbd8] !text-[#203f45]"
            >Departamentos</RouterLink
          >
          <RouterLink
            :to="{ name: 'positions' }"
            class="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-slate-500"
            active-class="!bg-[#a7dbd8] !text-[#203f45]"
            >Puestos</RouterLink
          >
          <RouterLink
            :to="{ name: 'concepts' }"
            class="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-slate-500"
            active-class="!bg-[#a7dbd8] !text-[#203f45]"
            >Rubros</RouterLink
          >
          <button
            type="button"
            class="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-600 transition hover:bg-[#f38630] hover:text-[#202f33]"
            aria-label="Cerrar sesión"
            @click="handleLogout"
          >
            <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5m5-4 3-3-3-3m3 3H8"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </nav>
      </header>
      <main class="min-h-screen min-w-0"><RouterView /></main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import { hideLoading, showLoading } from '@/composables/useLoading'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const router = useRouter()
const queryClient = useQueryClient()
const authStore = useAuthStore()
const userInitials = computed(() =>
  (authStore.user?.fullName ?? 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase(),
)

async function handleLogout() {
  showLoading('Cerrando sesión...')
  authStore.logout()
  void queryClient.cancelQueries()
  queryClient.clear()

  try {
    await router.replace({ name: 'login' })
  } finally {
    hideLoading(0)
  }
}
</script>
