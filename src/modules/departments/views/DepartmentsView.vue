<template>
  <section class="w-full px-3 py-5 sm:px-4 lg:px-5 lg:py-6 2xl:px-6">
    <header class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div
          class="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-[#b34700] uppercase"
        >
         
        </div>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">Departamentos</h1>
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
        Nuevo departamento
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
          <span class="sr-only">Buscar departamentos</span>
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

      <div v-if="isPending" class="grid gap-3 p-5" aria-label="Cargando departamentos">
        <div v-for="item in 5" :key="item" class="h-16 animate-pulse rounded-xl bg-slate-100"></div>
      </div>

      <div v-else-if="queryError" class="grid place-items-center px-6 py-16 text-center">
        <div class="grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-500">
          <span class="text-xl font-bold">!</span>
        </div>
        <h2 class="mt-4 font-bold text-slate-800">No fue posible cargar los departamentos</h2>
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
        v-else-if="filteredDepartments.length === 0"
        class="grid place-items-center px-6 py-16 text-center"
      >
        <div class="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M2 21h20M8 7h4M8 11h4M8 15h4"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <h2 class="mt-4 font-bold text-slate-800">No hay departamentos para mostrar</h2>
        <p class="mt-1 text-sm text-slate-500">
          {{
            isAdmin
              ? 'Ajusta los filtros o registra un nuevo departamento.'
              : 'Ajusta los filtros de búsqueda.'
          }}
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[44rem] border-collapse text-left">
          <thead class="bg-[#e4f2f1] text-xs font-bold tracking-wider text-[#245f69] uppercase">
            <tr>
              <th class="px-5 py-3.5">Departamento</th>
              <th class="px-5 py-3.5">Estado</th>
              <th v-if="isAdmin" class="px-5 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="department in paginatedDepartments"
              :key="department.idDepartamento"
              class="transition hover:bg-slate-50/80"
            >
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div>
                    <p class="font-semibold text-slate-800">{{ department.nombre }}</p>
                    <p class="mt-0.5 text-xs text-slate-500">
                      {{ department.descripcion || 'Sin descripción' }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
                  :class="
                    department.activo
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  "
                  ><span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="department.activo ? 'bg-emerald-500' : 'bg-slate-400'"
                  ></span
                  >{{ department.activo ? 'Activo' : 'Inactivo' }}</span
                >
              </td>
              <td v-if="isAdmin" class="px-5 py-4">
                <div class="flex justify-end gap-1">
                  <button
                    type="button"
                    class="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-[#f38630] hover:text-[#202f33]"
                    title="Editar departamento"
                    aria-label="Editar departamento"
                    @click="openEdit(department)"
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
                      department.activo
                        ? 'hover:bg-red-50 hover:text-red-600'
                        : 'hover:bg-emerald-50 hover:text-emerald-600'
                    "
                    :title="department.activo ? 'Desactivar departamento' : 'Activar departamento'"
                    :aria-label="
                      department.activo ? 'Desactivar departamento' : 'Activar departamento'
                    "
                    @click="openStatus(department)"
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
        v-if="!isPending && !queryError && filteredDepartments.length"
        v-model:page="currentPage"
        :page-size="pageSize"
        :total-items="filteredDepartments.length"
      />
    </div>
  </section>

  <DepartmentFormModal
    :open="formOpen"
    :mode="formMode"
    :department="selectedDepartment"
    :loading="formLoading"
    :server-error="formError"
    @close="formOpen = false"
    @submit="saveDepartment"
  />
  <ConfirmDialog
    :open="statusOpen"
    :title="selectedDepartment?.activo ? 'Desactivar departamento' : 'Activar departamento'"
    :description="selectedDepartment?.nombre"
    :message="
      selectedDepartment?.activo
        ? 'El departamento dejará de estar disponible para asignar empleados. Solo se puede desactivar si no tiene empleados activos.'
        : 'El departamento volverá a estar disponible para asignar empleados.'
    "
    :confirm-label="selectedDepartment?.activo ? 'Desactivar' : 'Activar'"
    :danger="selectedDepartment?.activo"
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
import DepartmentFormModal from '@/modules/departments/components/DepartmentFormModal.vue'
import {
  departmentKeys,
  useDepartmentMutations,
  useDepartmentsQuery,
} from '@/modules/departments/composables/useDepartments'
import * as departmentService from '@/modules/departments/services/department.service'
import type { Department, DepartmentFormValues } from '@/modules/departments/types/department.types'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const queryClient = useQueryClient()
const authStore = useAuthStore()
const departmentsQuery = useDepartmentsQuery()
const { createMutation, updateMutation, statusMutation } = useDepartmentMutations()

const search = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = 15
const formOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formError = ref('')
const statusOpen = ref(false)
const selectedDepartment = ref<Department | null>(null)
const notice = reactive<{ type: 'success' | 'error'; message: string }>({
  type: 'success',
  message: '',
})

const isAdmin = computed(() => authStore.user?.role === 'ADMIN')
const departments = computed(() => departmentsQuery.data.value ?? [])
const isPending = computed(() => departmentsQuery.isPending.value)
const queryError = computed(() => departmentsQuery.error.value)
const formLoading = computed(() => createMutation.isPending.value || updateMutation.isPending.value)
const filteredDepartments = computed(() => {
  const term = search.value.trim().toLocaleLowerCase()
  return departments.value.filter((department) => {
    const matchesSearch =
      !term ||
      `${department.nombre} ${department.descripcion ?? ''}`.toLocaleLowerCase().includes(term)
    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'active' ? department.activo : !department.activo)
    return matchesSearch && matchesStatus
  })
})
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredDepartments.value.length / pageSize)),
)
const paginatedDepartments = computed(() =>
  filteredDepartments.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize),
)

watch([search, statusFilter], () => (currentPage.value = 1))
watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

function openCreate(): void {
  formMode.value = 'create'
  selectedDepartment.value = null
  formError.value = ''
  formOpen.value = true
}

async function openEdit(department: Department): Promise<void> {
  formError.value = ''
  try {
    selectedDepartment.value = await queryClient.fetchQuery({
      queryKey: departmentKeys.detail(department.idDepartamento),
      queryFn: () => departmentService.getDepartment(department.idDepartamento),
    })
    formMode.value = 'edit'
    formOpen.value = true
  } catch (error) {
    showNotice('error', getErrorMessage(error))
  }
}

async function saveDepartment(values: DepartmentFormValues): Promise<void> {
  formError.value = ''
  const payload = { nombre: values.nombre, descripcion: values.descripcion || null }
  try {
    if (formMode.value === 'create') {
      await createMutation.mutateAsync(payload)
      showNotice('success', 'Departamento creado correctamente.')
    } else if (selectedDepartment.value) {
      await updateMutation.mutateAsync({ id: selectedDepartment.value.idDepartamento, payload })
      showNotice('success', 'Departamento actualizado correctamente.')
    }
    formOpen.value = false
  } catch (error) {
    formError.value = getErrorMessage(error)
  }
}

function openStatus(department: Department): void {
  selectedDepartment.value = department
  statusOpen.value = true
}

async function changeStatus(): Promise<void> {
  if (!selectedDepartment.value) return
  try {
    const activate = !selectedDepartment.value.activo
    await statusMutation.mutateAsync({ id: selectedDepartment.value.idDepartamento, activate })
    statusOpen.value = false
    showNotice(
      'success',
      activate ? 'Departamento activado correctamente.' : 'Departamento desactivado correctamente.',
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
  void departmentsQuery.refetch()
}
</script>
