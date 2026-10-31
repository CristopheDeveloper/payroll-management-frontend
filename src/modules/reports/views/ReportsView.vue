<template>
  <section class="w-full px-3 py-5 sm:px-4 lg:px-5 lg:py-6 2xl:px-6">
    <header>
      <div
        class="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-[#b34700] uppercase"
      >
        
      </div>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">Reportes</h1>
    </header>

    <div class="mt-5 grid items-start gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <nav
        class="hidden overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md shadow-slate-900/5 lg:block"
        aria-label="Reportes"
      >
        <div v-for="group in groups" :key="group.name">
          <p
            class="border-b border-slate-300 bg-[#e4f2f1] px-4 py-2 text-xs font-bold text-[#245f69]"
          >
            {{ group.name }}
          </p>
          <button
            v-for="item in group.items"
            :key="item.key"
            type="button"
            class="block w-full cursor-pointer border-l-4 px-4 py-2.5 text-left text-sm transition"
            :class="
              item.key === current.key
                ? 'border-[#fa6900] bg-[#fa6900]/8 font-semibold text-slate-900'
                : 'border-transparent text-slate-700 hover:bg-slate-50'
            "
            :aria-current="item.key === current.key ? 'page' : undefined"
            @click="select(item.key)"
          >
            {{ item.title }}
          </button>
        </div>
      </nav>

      <div
        class="min-w-0 rounded-2xl border border-slate-300 bg-white shadow-md shadow-slate-900/5"
      >
        <div class="p-4 sm:p-5">
          <label for="report-select" class="sr-only">Reporte</label>
          <select
            id="report-select"
            :value="current.key"
            :class="controlClass"
            class="w-full font-semibold lg:hidden"
            @change="select(($event.target as HTMLSelectElement).value)"
          >
            <optgroup v-for="group in groups" :key="group.name" :label="group.name">
              <option v-for="item in group.items" :key="item.key" :value="item.key">
                {{ item.title }}
              </option>
            </optgroup>
          </select>

          <h2 class="hidden text-lg font-bold text-slate-900 lg:block">{{ current.title }}</h2>

          <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div
              v-if="has('planilla')"
              class="flex flex-col gap-3 sm:col-span-2 sm:flex-row xl:col-span-3"
            >
              <label class="grid shrink-0 gap-1 sm:w-28">
                <span :class="labelClass">Año</span>
                <select v-model.number="year" :class="controlClass" :disabled="!years.length">
                  <option v-for="item in years" :key="item" :value="item">{{ item }}</option>
                </select>
              </label>
              <label class="grid min-w-0 flex-1 gap-1">
                <span :class="labelClass">Planilla</span>
                <select v-model.number="filters.planilla" :class="controlClass">
                  <option :value="0" disabled>
                    {{
                      printable.length ? 'Selecciona una planilla' : 'No hay planillas generadas'
                    }}
                  </option>
                  <option v-for="item in yearPayrolls" :key="item.idNomina" :value="item.idNomina">
                    {{ item.codigo }} · {{ monthName(item.anio, item.mes) }} ·
                    {{ statusLabels[item.estado] }}
                  </option>
                </select>
              </label>
            </div>
            <div v-if="has('empleadoPlanilla')" class="grid gap-1 sm:col-span-2">
              <label for="report-payroll-employee" :class="labelClass">Empleado</label>
              <BaseCombobox
                id="report-payroll-employee"
                v-model="filters.empleadoPlanilla"
                :options="payrollEmployeeOptions"
                :input-class="controlClass"
              />
            </div>
            <label v-if="has('tipoPago')" class="grid gap-1">
              <span :class="labelClass">Forma de pago</span>
              <select v-model="filters.tipoPago" :class="controlClass">
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="CHEQUE">Cheque</option>
                <option value="EFECTIVO">Efectivo</option>
              </select>
            </label>
            <label v-if="has('rubro')" class="grid gap-1">
              <span :class="labelClass">Rubro</span>
              <select v-model.number="filters.rubro" :class="controlClass">
                <option :value="0">Todos (resumen)</option>
                <option v-for="item in concepts" :key="item.idRubro" :value="item.idRubro">
                  {{ item.nombre }}
                </option>
              </select>
            </label>
            <div v-if="has('empleado')" class="grid gap-1 sm:col-span-2">
              <label for="report-employee" :class="labelClass">Empleado</label>
              <BaseCombobox
                id="report-employee"
                v-model="filters.empleado"
                :options="employeeOptions"
                :input-class="controlClass"
                placeholder="Escribe el nombre o el código"
              />
            </div>
            <label v-if="has('estado')" class="grid gap-1">
              <span :class="labelClass">Estado</span>
              <select v-model="filters.estado" :class="controlClass">
                <option value="ACTIVOS">Activos</option>
                <option value="BAJA">De baja</option>
                <option value="TODOS">Todos</option>
              </select>
            </label>
            <label v-if="has('mes')" class="grid gap-1">
              <span :class="labelClass">Mes</span>
              <input v-model="filters.mes" type="month" :class="controlClass" />
            </label>
            <label v-if="has('departamento')" class="grid gap-1">
              <span :class="labelClass">Departamento</span>
              <select v-model.number="filters.departamento" :class="controlClass">
                <option :value="0">Todos</option>
                <option
                  v-for="item in departments"
                  :key="item.idDepartamento"
                  :value="item.idDepartamento"
                >
                  {{ item.nombre }}
                </option>
              </select>
            </label>
            <label v-if="has('puesto')" class="grid gap-1">
              <span :class="labelClass">Puesto</span>
              <select v-model.number="filters.puesto" :class="controlClass">
                <option :value="0">Todos</option>
                <option v-for="item in positions" :key="item.idPuesto" :value="item.idPuesto">
                  {{ item.nombre }}
                </option>
              </select>
            </label>
            <label v-if="has('desde')" class="grid gap-1">
              <span :class="labelClass">Desde</span>
              <input v-model="filters.desde" type="date" :class="controlClass" />
            </label>
            <label v-if="has('hasta')" class="grid gap-1">
              <span :class="labelClass">Hasta</span>
              <input
                v-model="filters.hasta"
                type="date"
                :min="filters.desde || undefined"
                :class="controlClass"
              />
            </label>
          </div>

          <div class="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
            <button
              v-for="item in downloads"
              :key="item.label"
              type="button"
              class="inline-flex h-10 cursor-pointer items-center rounded-lg px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50"
              :class="
                item.label === 'PDF'
                  ? 'bg-[#fa6900] text-[#202f33] hover:bg-[#f38630]'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              "
              :disabled="!ready || !!downloading"
              @click="download(item)"
            >
              {{ downloading === item.label ? 'Descargando...' : `Descargar ${item.label}` }}
            </button>
            <p v-if="!ready" class="text-sm text-slate-600">{{ missingMessage }}</p>
            <p v-else-if="preliminary" class="text-sm font-semibold text-[#b34700]">
              Preliminar: la planilla no está cerrada.
            </p>
          </div>
          <p
            v-if="notice"
            class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
            role="alert"
          >
            {{ notice }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import BaseCombobox from '@/components/BaseCombobox.vue'
import { useRoute, useRouter } from 'vue-router'
import { reportCatalog } from '@/modules/reports/utils/report.catalog'
import * as reportService from '@/modules/reports/services/report.service'
import type {
  ReportDownload,
  ReportFilter,
  ReportFilters,
} from '@/modules/reports/types/report.types'
import {
  usePayrollEmployeesQuery,
  usePayrollsQuery,
} from '@/modules/payrolls/composables/usePayrolls'
import { formatPeriod, statusLabels } from '@/modules/payrolls/utils/payroll.format'
import { useDepartmentsQuery } from '@/modules/departments/composables/useDepartments'
import { usePositionsQuery } from '@/modules/positions/composables/usePositions'
import { useConceptsQuery } from '@/modules/concepts/composables/useConcepts'
import { useEmployeesQuery } from '@/modules/employees/composables/useEmployees'

const labelClass = 'text-xs font-semibold text-slate-600'
const controlClass =
  'h-10 w-full min-w-0 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25'

const route = useRoute()
const router = useRouter()
const today = new Date()
const pad = (value: number) => String(value).padStart(2, '0')
const todayIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

const filters = reactive<ReportFilters>({
  planilla: Number(route.query.planilla) || 0,
  empleadoPlanilla: 0,
  tipoPago: 'TRANSFERENCIA',
  rubro: 0,
  estado: 'ACTIVOS',
  departamento: 0,
  puesto: 0,
  desde: `${today.getFullYear()}-01-01`,
  hasta: todayIso,
  empleado: 0,
  mes: `${today.getFullYear()}-${pad(today.getMonth() + 1)}`,
})
const selectedKey = ref(String(route.query.reporte ?? reportCatalog[0]!.key))
const downloading = ref('')
const notice = ref('')

const payrollsQuery = usePayrollsQuery()
const departmentsQuery = useDepartmentsQuery()
const positionsQuery = usePositionsQuery()
const conceptsQuery = useConceptsQuery()
const employeesQuery = useEmployeesQuery()

const current = computed(
  () => reportCatalog.find((item) => item.key === selectedKey.value) ?? reportCatalog[0]!,
)
const payrollEmployeesQuery = usePayrollEmployeesQuery(
  () => filters.planilla,
  () => has('empleadoPlanilla') && filters.planilla > 0,
)
const groups = computed(() =>
  [...new Set(reportCatalog.map((item) => item.group))].map((name) => ({
    name,
    items: reportCatalog.filter((item) => item.group === name),
  })),
)
const printable = computed(() =>
  (payrollsQuery.data.value ?? [])
    .filter((item) => item.estado === 'GENERADA' || item.estado === 'CERRADA')
    .sort((a, b) => b.anio - a.anio || b.mes - a.mes || b.codigo.localeCompare(a.codigo)),
)
const departments = computed(() =>
  [...(departmentsQuery.data.value ?? [])].sort((a, b) => a.nombre.localeCompare(b.nombre)),
)
const positions = computed(() =>
  [...(positionsQuery.data.value ?? [])].sort((a, b) => a.nombre.localeCompare(b.nombre)),
)
const concepts = computed(() =>
  [...(conceptsQuery.data.value ?? [])].sort((a, b) => a.orden - b.orden),
)
const employees = computed(() =>
  [...(employeesQuery.data.value ?? [])].sort((a, b) =>
    a.nombreCompleto.localeCompare(b.nombreCompleto),
  ),
)
const payrollEmployeeOptions = computed(() => [
  { value: 0, label: 'Todos los empleados' },
  ...[...(payrollEmployeesQuery.data.value ?? [])]
    .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto))
    .map((item) => ({
      value: item.idEmpleado,
      label: `${item.codigoEmpleado} · ${item.nombreCompleto}`,
    })),
])
const employeeOptions = computed(() =>
  employees.value.map((item) => ({
    value: item.idEmpleado,
    label: `${item.codigoEmpleado} · ${item.nombreCompleto}`,
    hint: item.activo ? undefined : '(de baja)',
  })),
)
const year = ref(0)
const years = computed(() => [...new Set(printable.value.map((item) => item.anio))])
const yearPayrolls = computed(() => printable.value.filter((item) => item.anio === year.value))

const datesValid = computed(
  () =>
    !has('desde') ||
    !has('hasta') ||
    !filters.desde ||
    !filters.hasta ||
    filters.desde <= filters.hasta,
)
const missing = computed(() =>
  current.value.required.filter((filter) => {
    const value = filters[filter]
    return value === 0 || value === ''
  }),
)
const ready = computed(() => !missing.value.length && datesValid.value)
const missingMessage = computed(() => {
  if (!datesValid.value) return 'La fecha final no puede ser anterior a la inicial.'
  const first = missing.value[0]
  if (first === 'planilla')
    return printable.value.length
      ? 'Selecciona una planilla.'
      : 'Todavía no hay planillas generadas o cerradas.'
  if (first === 'empleado') return 'Selecciona un empleado.'
  if (first === 'mes') return 'Selecciona el mes.'
  return 'Completa las fechas.'
})
const downloads = computed(() => current.value.downloads(filters))

const preliminary = computed(
  () =>
    has('planilla') &&
    printable.value.find((item) => item.idNomina === filters.planilla)?.estado !== 'CERRADA',
)

watch(
  printable,
  (items) => {
    if (!items.length) return
    const current = items.find((item) => item.idNomina === filters.planilla) ?? items[0]!
    year.value = current.anio
    filters.planilla = current.idNomina
  },
  { immediate: true },
)
watch(year, () => {
  if (!yearPayrolls.value.some((item) => item.idNomina === filters.planilla))
    filters.planilla = yearPayrolls.value[0]?.idNomina ?? 0
})
watch(
  () => filters.planilla,
  () => (filters.empleadoPlanilla = 0),
)
watch([selectedKey, () => filters.planilla], ([key, planilla]) => {
  notice.value = ''
  const query: Record<string, string> = { reporte: key }
  if (planilla) query.planilla = String(planilla)
  void router.replace({ query })
})

function monthName(anio: number, mes: number): string {
  return formatPeriod(anio, mes).replace(` ${anio}`, '')
}

function has(filter: ReportFilter): boolean {
  return current.value.filters.includes(filter)
}

function select(key: string): void {
  selectedKey.value = key
}

async function download(item: ReportDownload): Promise<void> {
  notice.value = ''
  downloading.value = item.label
  try {
    await reportService.downloadFile(item.url, item.params)
  } catch (error) {
    notice.value = errorMessage(error)
  } finally {
    downloading.value = ''
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
}
</script>
