<template>
  <section class="w-full px-3 py-5 sm:px-4 lg:px-5 lg:py-6 2xl:px-6">
    <header class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div
          class="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-[#b34700] uppercase"
        >
        
        </div>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">Planillas</h1>
      </div>
      <button
        type="button"
        class="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#fa6900] px-5 text-sm font-bold text-[#202f33] shadow-lg shadow-[#fa6900]/20 transition hover:-translate-y-0.5 hover:bg-[#f38630] hover:shadow-[#f38630]/30"
        @click="router.push({ name: 'payroll-new' })"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        Nueva planilla
      </button>
    </header>

    <div
      class="mt-4 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md shadow-slate-900/5"
    >
      <div class="grid gap-3 border-b border-slate-300 p-3 sm:p-4 md:grid-cols-[1fr_11rem_11rem]">
        <input
          v-model="search"
          type="search"
          class="h-11 rounded-xl border border-[#a7dbd8] bg-white px-3.5 text-sm text-slate-700 outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
          placeholder="Buscar por código o descripción..."
          aria-label="Buscar planilla"
        />
        <select
          v-model="yearFilter"
          class="h-11 cursor-pointer rounded-xl border border-[#a7dbd8] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
          aria-label="Filtrar por año"
        >
          <option value="all">Todos los años</option>
          <option v-for="year in years" :key="year" :value="String(year)">{{ year }}</option>
        </select>
        <select
          v-model="statusFilter"
          class="h-11 cursor-pointer rounded-xl border border-[#a7dbd8] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
          aria-label="Filtrar por estado"
        >
          <option value="all">Todos los estados</option>
          <option v-for="(label, value) in statusLabels" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
      </div>

      <div v-if="isPending" class="grid gap-3 p-5" aria-label="Cargando planillas">
        <div v-for="item in 5" :key="item" class="h-16 animate-pulse rounded-xl bg-slate-100"></div>
      </div>

      <div v-else-if="queryError" class="grid place-items-center px-6 py-16 text-center">
        <div class="grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-500">
          <span class="text-xl font-bold">!</span>
        </div>
        <h2 class="mt-4 font-bold text-slate-800">No fue posible cargar las planillas</h2>
        <p class="mt-1 text-sm text-slate-600">{{ getErrorMessage(queryError) }}</p>
        <button
          type="button"
          class="mt-5 cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          @click="refetch"
        >
          Reintentar
        </button>
      </div>

      <div
        v-else-if="filteredPayrolls.length === 0"
        class="grid place-items-center px-6 py-16 text-center"
      >
        <div class="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 20V10m6 10V4m6 16v-7m4 7H2"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <h2 class="mt-4 font-bold text-slate-800">No hay planillas para mostrar</h2>
        <p class="mt-1 text-sm text-slate-600">
          Ajusta los filtros o crea la planilla del mes para empezar.
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[62rem] border-collapse text-left">
          <thead class="bg-[#e4f2f1] text-xs font-bold tracking-wider text-[#245f69] uppercase">
            <tr>
              <th class="px-5 py-3.5">Planilla</th>
              <th class="px-5 py-3.5">Periodo</th>
              <th class="px-5 py-3.5">Descripción</th>
              <th class="px-5 py-3.5">Estado</th>
              <th class="px-5 py-3.5 text-right">Empleados</th>
              <th class="px-5 py-3.5 text-right">Líquido</th>
              <th class="w-10"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="payroll in paginatedPayrolls"
              :key="payroll.idNomina"
              class="group cursor-pointer transition hover:bg-[#69d2e7]/10"
              @click="openPayroll(payroll.idNomina)"
            >
              <td class="px-5 py-3 font-semibold whitespace-nowrap text-slate-800">
                {{ payroll.codigo }}
              </td>
              <td class="px-5 py-3 text-sm whitespace-nowrap text-slate-800">
                {{ formatPeriod(payroll.anio, payroll.mes) }}
              </td>
              <td class="px-5 py-3 text-sm text-slate-600">{{ payroll.descripcion }}</td>
              <td class="px-5 py-3"><PayrollStatusBadge :status="payroll.estado" /></td>
              <td class="px-5 py-3 text-right text-sm text-slate-600 tabular-nums">
                {{ payroll.cantidadEmpleados }}
              </td>
              <td class="px-5 py-3 text-right text-sm font-bold text-slate-800 tabular-nums">
                {{
                  payroll.estado === 'GENERADA' || payroll.estado === 'CERRADA'
                    ? formatMoney(payroll.totalLiquido)
                    : '—'
                }}
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
        v-if="!isPending && !queryError && filteredPayrolls.length > pageSize"
        v-model:page="currentPage"
        :page-size="pageSize"
        :total-items="filteredPayrolls.length"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BasePagination from '@/components/BasePagination.vue'
import PayrollStatusBadge from '@/modules/payrolls/components/PayrollStatusBadge.vue'
import { usePayrollsQuery } from '@/modules/payrolls/composables/usePayrolls'
import { formatMoney, formatPeriod, statusLabels } from '@/modules/payrolls/utils/payroll.format'

const router = useRouter()
const payrollsQuery = usePayrollsQuery()

const search = ref('')
const yearFilter = ref('all')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = 6

const payrolls = computed(() => payrollsQuery.data.value ?? [])
const isPending = computed(() => payrollsQuery.isPending.value)
const queryError = computed(() => payrollsQuery.error.value)
const years = computed(() =>
  [...new Set(payrolls.value.map((payroll) => payroll.anio))].sort((a, b) => b - a),
)
const filteredPayrolls = computed(() =>
  payrolls.value.filter(
    (payroll) =>
      (!search.value.trim() ||
        `${payroll.codigo} ${payroll.descripcion}`
          .toLocaleLowerCase()
          .includes(search.value.trim().toLocaleLowerCase())) &&
      (yearFilter.value === 'all' || String(payroll.anio) === yearFilter.value) &&
      (statusFilter.value === 'all' || payroll.estado === statusFilter.value),
  ),
)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredPayrolls.value.length / pageSize)))
const paginatedPayrolls = computed(() =>
  filteredPayrolls.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize),
)

watch([search, yearFilter, statusFilter], () => (currentPage.value = 1))
watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

function openPayroll(id: number): void {
  void router.push({ name: 'payroll-detail', params: { id } })
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
}

function refetch(): void {
  void payrollsQuery.refetch()
}
</script>
