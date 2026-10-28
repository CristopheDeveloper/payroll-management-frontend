<template>
  <section class="w-full px-3 py-5 sm:px-4 lg:px-5 lg:py-6 2xl:px-6">
    <header class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div
          class="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-[#b34700] uppercase"
        >
          <span class="h-px w-6 bg-[#fa6900]"></span>
          Catálogos
        </div>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">Puestos</h1>
      </div>
      <button
        v-if="isAdmin"
        type="button"
        class="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#fa6900] px-5 text-sm font-bold text-[#202f33] shadow-lg shadow-[#fa6900]/20 transition hover:-translate-y-0.5 hover:bg-[#f38630] hover:shadow-[#f38630]/30"
        @click="openCreate"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        Nuevo puesto
      </button>
    </header>

    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="-translate-y-2 opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="notice.message"
        class="mt-5 flex items-center justify-between gap-5 rounded-2xl border px-5 py-4 text-base font-medium shadow-sm sm:px-6 sm:py-5"
        :class="
          notice.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-red-200 bg-red-50 text-red-700'
        "
        role="status"
      >
        <span>{{ notice.message }}</span>
        <button
          type="button"
          class="cursor-pointer font-bold"
          aria-label="Cerrar notificación"
          @click="notice.message = ''"
        >
          ×
        </button>
      </div>
    </Transition>

    <div
      class="mt-5 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md shadow-slate-900/5"
    >
      <div
        class="grid gap-3 border-b border-slate-300 p-3 sm:p-4 md:grid-cols-[minmax(16rem,1fr)_12rem]"
      >
        <label class="relative block">
          <span class="sr-only">Buscar puestos</span>
          <svg
            class="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" />
            <path d="m16 16 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <input
            v-model="search"
            type="search"
            class="h-11 w-full rounded-xl border border-[#a7dbd8] pr-4 pl-10 text-sm outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
            placeholder="Buscar por nombre o descripción..."
          />
        </label>
        <select
          v-model="statusFilter"
          class="h-11 cursor-pointer rounded-xl border border-[#a7dbd8] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
          aria-label="Filtrar por estado"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      <div v-if="isPending" class="grid gap-3 p-5" aria-label="Cargando puestos">
        <div v-for="item in 5" :key="item" class="h-16 animate-pulse rounded-xl bg-slate-100"></div>
      </div>

      <div v-else-if="queryError" class="grid place-items-center px-6 py-16 text-center">
        <div class="grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-500">
          <span class="text-xl font-bold">!</span>
        </div>
        <h2 class="mt-4 font-bold text-slate-800">No fue posible cargar los puestos</h2>
        <p class="mt-1 text-sm text-slate-500">{{ getErrorMessage(queryError) }}</p>
        <button
          type="button"
          class="mt-5 cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          @click="refetch"
        >
          Reintentar
        </button>
      </div>

      <div
        v-else-if="filteredPositions.length === 0"
        class="grid place-items-center px-6 py-16 text-center"
      >
        <div class="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Zm6-2V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <h2 class="mt-4 font-bold text-slate-800">No hay puestos para mostrar</h2>
        <p class="mt-1 text-sm text-slate-500">
          {{
            isAdmin
              ? 'Ajusta los filtros o registra un nuevo puesto.'
              : 'Ajusta los filtros de búsqueda.'
          }}
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[44rem] border-collapse text-left">
          <thead class="bg-[#e4f2f1] text-xs font-bold tracking-wider text-[#245f69] uppercase">
            <tr>
              <th class="px-5 py-3.5">Puesto</th>
              <th class="px-5 py-3.5">Estado</th>
              <th v-if="isAdmin" class="px-5 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="position in paginatedPositions"
              :key="position.idPuesto"
              class="transition hover:bg-slate-50/80"
            >
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div>
                    <p class="font-semibold text-slate-800">{{ position.nombre }}</p>
                    <p class="mt-0.5 text-xs text-slate-500">
                      {{ position.descripcion || 'Sin descripción' }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
                  :class="
                    position.activo
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  "
                  ><span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="position.activo ? 'bg-emerald-500' : 'bg-slate-400'"
                  ></span
                  >{{ position.activo ? 'Activo' : 'Inactivo' }}</span
                >
              </td>
              <td v-if="isAdmin" class="px-5 py-4">
                <div class="flex justify-end gap-1">
                  <button
                    type="button"
                    class="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-[#f38630] hover:text-[#202f33]"
                    title="Editar puesto"
                    aria-label="Editar puesto"
                    @click="openEdit(position)"
                  >
                    <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="m14 5 5 5M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-slate-400 transition"
                    :class="
                      position.activo
                        ? 'hover:bg-red-50 hover:text-red-600'
                        : 'hover:bg-emerald-50 hover:text-emerald-600'
                    "
                    :title="position.activo ? 'Desactivar puesto' : 'Activar puesto'"
                    :aria-label="position.activo ? 'Desactivar puesto' : 'Activar puesto'"
                    @click="openStatus(position)"
                  >
                    <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 3v9m6.4-5.4a9 9 0 1 1-12.8 0"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        v-if="!isPending && !queryError && filteredPositions.length"
        v-model:page="currentPage"
        :page-size="pageSize"
        :total-items="filteredPositions.length"
      />
    </div>
  </section>

  <PositionFormModal
    :open="formOpen"
    :mode="formMode"
    :position="selectedPosition"
    :loading="formLoading"
    :server-error="formError"
    @close="formOpen = false"
    @submit="savePosition"
  />
  <ConfirmDialog
    :open="statusOpen"
    :title="selectedPosition?.activo ? 'Desactivar puesto' : 'Activar puesto'"
    :description="selectedPosition?.nombre"
    :message="
      selectedPosition?.activo
        ? 'El puesto dejará de estar disponible para asignar empleados. Solo se puede desactivar si no tiene empleados activos.'
        : 'El puesto volverá a estar disponible para asignar empleados.'
    "
    :confirm-label="selectedPosition?.activo ? 'Desactivar' : 'Activar'"
    :danger="selectedPosition?.activo"
    :loading="statusMutation.isPending.value"
    @close="statusOpen = false"
    @confirm="changeStatus"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import BasePagination from '@/components/BasePagination.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import PositionFormModal from '@/modules/positions/components/PositionFormModal.vue'
import {
  positionKeys,
  usePositionMutations,
  usePositionsQuery,
} from '@/modules/positions/composables/usePositions'
import * as positionService from '@/modules/positions/services/position.service'
import type { Position, PositionFormValues } from '@/modules/positions/types/position.types'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const queryClient = useQueryClient()
const authStore = useAuthStore()
const positionsQuery = usePositionsQuery()
const { createMutation, updateMutation, statusMutation } = usePositionMutations()

const search = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = 15
const formOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formError = ref('')
const statusOpen = ref(false)
const selectedPosition = ref<Position | null>(null)
const notice = reactive<{ type: 'success' | 'error'; message: string }>({
  type: 'success',
  message: '',
})

const isAdmin = computed(() => authStore.user?.role === 'ADMIN')
const positions = computed(() => positionsQuery.data.value ?? [])
const isPending = computed(() => positionsQuery.isPending.value)
const queryError = computed(() => positionsQuery.error.value)
const formLoading = computed(() => createMutation.isPending.value || updateMutation.isPending.value)
const filteredPositions = computed(() => {
  const term = search.value.trim().toLocaleLowerCase()
  return positions.value.filter((position) => {
    const matchesSearch =
      !term || `${position.nombre} ${position.descripcion ?? ''}`.toLocaleLowerCase().includes(term)
    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'active' ? position.activo : !position.activo)
    return matchesSearch && matchesStatus
  })
})
const totalPages = computed(() => Math.max(1, Math.ceil(filteredPositions.value.length / pageSize)))
const paginatedPositions = computed(() =>
  filteredPositions.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize),
)

watch([search, statusFilter], () => (currentPage.value = 1))
watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

function openCreate(): void {
  formMode.value = 'create'
  selectedPosition.value = null
  formError.value = ''
  formOpen.value = true
}

async function openEdit(position: Position): Promise<void> {
  formError.value = ''
  try {
    selectedPosition.value = await queryClient.fetchQuery({
      queryKey: positionKeys.detail(position.idPuesto),
      queryFn: () => positionService.getPosition(position.idPuesto),
    })
    formMode.value = 'edit'
    formOpen.value = true
  } catch (error) {
    showNotice('error', getErrorMessage(error))
  }
}

async function savePosition(values: PositionFormValues): Promise<void> {
  formError.value = ''
  const payload = { nombre: values.nombre, descripcion: values.descripcion || null }
  try {
    if (formMode.value === 'create') {
      await createMutation.mutateAsync(payload)
      showNotice('success', 'Puesto creado correctamente.')
    } else if (selectedPosition.value) {
      await updateMutation.mutateAsync({ id: selectedPosition.value.idPuesto, payload })
      showNotice('success', 'Puesto actualizado correctamente.')
    }
    formOpen.value = false
  } catch (error) {
    formError.value = getErrorMessage(error)
  }
}

function openStatus(position: Position): void {
  selectedPosition.value = position
  statusOpen.value = true
}

async function changeStatus(): Promise<void> {
  if (!selectedPosition.value) return
  try {
    const activate = !selectedPosition.value.activo
    await statusMutation.mutateAsync({ id: selectedPosition.value.idPuesto, activate })
    statusOpen.value = false
    showNotice(
      'success',
      activate ? 'Puesto activado correctamente.' : 'Puesto desactivado correctamente.',
    )
  } catch (error) {
    statusOpen.value = false
    showNotice('error', getErrorMessage(error))
  }
}

function showNotice(type: 'success' | 'error', message: string): void {
  notice.type = type
  notice.message = message
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
}

function refetch(): void {
  void positionsQuery.refetch()
}
</script>
