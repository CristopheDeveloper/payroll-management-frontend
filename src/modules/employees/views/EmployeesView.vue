<template>
  <section class="w-full px-3 py-5 sm:px-4 lg:px-5 lg:py-6 2xl:px-6">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div
          class="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-[#d95800] uppercase"
        >
          <span class="h-px w-6 bg-[#fa6900]"></span>
          Nómina
        </div>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">Empleados</h1>
      </div>
      <RouterLink
        :to="{ name: 'employee-new' }"
        class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#fa6900] px-5 text-sm font-bold text-[#202f33] shadow-lg shadow-[#fa6900]/20 transition hover:bg-[#f38630]"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        Nuevo empleado
      </RouterLink>
    </header>

    <div
      class="mt-4 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md shadow-slate-900/5"
    >
      <div class="grid gap-3 border-b border-slate-300 p-3 sm:p-4 md:grid-cols-[1fr_13rem_11rem]">
        <input
          v-model="search"
          type="search"
          class="h-11 rounded-xl border border-[#a7dbd8] bg-white px-3.5 text-sm text-slate-700 outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
          placeholder="Buscar por código, nombre o DPI..."
          aria-label="Buscar empleado"
        />
        <select
          v-model="departmentFilter"
          :class="selectClass"
          aria-label="Filtrar por departamento"
        >
          <option value="all">Todos los departamentos</option>
          <option v-for="name in departmentNames" :key="name" :value="name">{{ name }}</option>
        </select>
        <select v-model="statusFilter" :class="selectClass" aria-label="Filtrar por estado">
          <option value="active">Activos</option>
          <option value="inactive">De baja</option>
          <option value="all">Todos</option>
        </select>
      </div>

      <div v-if="query.isPending.value" class="grid gap-3 p-5" aria-label="Cargando empleados">
        <div v-for="item in 5" :key="item" class="h-12 animate-pulse rounded-xl bg-slate-100"></div>
      </div>
      <div v-else-if="query.error.value" class="grid place-items-center px-6 py-14 text-center">
        <h2 class="font-bold text-slate-800">No fue posible cargar los empleados</h2>
        <p class="mt-1 text-sm text-slate-600">{{ getErrorMessage(query.error.value) }}</p>
        <button
          type="button"
          class="mt-5 cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          @click="query.refetch()"
        >
          Reintentar
        </button>
      </div>
      <p v-else-if="!filtered.length" class="px-6 py-14 text-center text-sm text-slate-600">
        {{
          employees.length
            ? 'Ningún empleado coincide con los filtros.'
            : 'Todavía no hay empleados.'
        }}
      </p>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[56rem] border-collapse text-left">
          <thead class="bg-[#e4f2f1] text-xs font-bold tracking-wider text-[#245f69] uppercase">
            <tr>
              <th class="px-5 py-3">Código</th>
              <th class="px-5 py-3">Nombre</th>
              <th class="px-5 py-3">Puesto</th>
              <th class="px-5 py-3">Departamento</th>
              <th class="px-5 py-3 text-right">Salario</th>
              <th class="px-5 py-3">Ingreso</th>
              <th class="px-5 py-3">Estado</th>
              <th class="w-10"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="row in paginated"
              :key="row.idEmpleado"
              class="group cursor-pointer transition hover:bg-[#69d2e7]/10"
              @click="open(row.idEmpleado)"
            >
              <td class="px-5 py-3 text-sm text-slate-600 tabular-nums">
                {{ row.codigoEmpleado }}
              </td>
              <td class="px-5 py-3 text-sm font-semibold text-slate-800">
                <div class="flex items-center gap-2.5">
                  <EmployeePhotoImage
                    v-if="row.fotoUrl"
                    :url="row.fotoUrl"
                    :alt="`Fotografía de ${row.nombreCompleto}`"
                    image-class="h-9 w-9 rounded-full border border-slate-200 object-cover"
                  >
                    <span
                      class="grid h-9 w-9 place-items-center rounded-full bg-[#e4f2f1] text-xs font-bold text-[#245f69]"
                      aria-hidden="true"
                      >{{ initials(row.nombreCompleto) }}</span
                    >
                  </EmployeePhotoImage>
                  <span
                    v-else
                    class="grid h-9 w-9 place-items-center rounded-full bg-[#e4f2f1] text-xs font-bold text-[#245f69]"
                    aria-hidden="true"
                    >{{ initials(row.nombreCompleto) }}</span
                  >
                  <span>{{ row.nombreCompleto }}</span>
                </div>
              </td>
              <td class="px-5 py-3 text-sm text-slate-700">{{ row.puesto }}</td>
              <td class="px-5 py-3 text-sm text-slate-700">{{ row.departamento }}</td>
              <td class="px-5 py-3 text-right text-sm text-slate-800 tabular-nums">
                {{ formatAmount(row.salario) }}
              </td>
              <td class="px-5 py-3 text-sm text-slate-700 tabular-nums">
                {{ formatDate(row.fechaIngresoActual) }}
              </td>
              <td class="px-5 py-3">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
                  :class="
                    row.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  "
                  ><span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="row.activo ? 'bg-emerald-500' : 'bg-slate-400'"
                  ></span
                  >{{ row.activo ? 'Activo' : 'De baja' }}</span
                >
              </td>
              <td class="pr-4 text-slate-400 transition group-hover:text-[#245f69]">
                <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="m9 18 6-6-6-6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        v-if="filtered.length > pageSize"
        v-model:page="page"
        :page-size="pageSize"
        :total-items="filtered.length"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BasePagination from '@/components/BasePagination.vue'
import EmployeePhotoImage from '@/modules/employees/components/EmployeePhotoImage.vue'
import { useEmployeesQuery } from '@/modules/employees/composables/useEmployees'
import { formatAmount, formatDate } from '@/modules/payrolls/utils/payroll.format'

const router = useRouter()
const query = useEmployeesQuery()
const selectClass =
  'h-11 cursor-pointer rounded-xl border border-[#a7dbd8] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25'
const search = ref('')
const departmentFilter = ref('all')
const statusFilter = ref<'active' | 'inactive' | 'all'>('active')
const page = ref(1)
const pageSize = 10

const employees = computed(() => query.data.value ?? [])
const departmentNames = computed(() =>
  [...new Set(employees.value.map((row) => row.departamento))].sort((a, b) => a.localeCompare(b)),
)
const filtered = computed(() => {
  const term = search.value.trim().toLocaleLowerCase()
  return employees.value.filter(
    (row) =>
      (!term ||
        `${row.codigoEmpleado} ${row.nombreCompleto} ${row.dpi}`
          .toLocaleLowerCase()
          .includes(term)) &&
      (departmentFilter.value === 'all' || row.departamento === departmentFilter.value) &&
      (statusFilter.value === 'all' || row.activo === (statusFilter.value === 'active')),
  )
})
const paginated = computed(() =>
  filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize),
)

watch([search, departmentFilter, statusFilter], () => (page.value = 1))

function open(id: number): void {
  void router.push({ name: 'employee-detail', params: { id } })
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
}
</script>
