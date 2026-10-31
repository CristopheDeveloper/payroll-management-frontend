<template>
  <section class="w-full px-3 py-5 sm:px-4 lg:px-5 lg:py-6 2xl:px-6">
    <RouterLink :to="{ name: 'payrolls' }"
      class="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-[#b34700]">
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
      Planillas
    </RouterLink>

    <div v-if="payrollQuery.isPending.value" class="mt-5 grid gap-3" aria-label="Cargando planilla">
      <div class="h-72 animate-pulse rounded-2xl bg-slate-100"></div>
      <div class="h-64 animate-pulse rounded-2xl bg-slate-100"></div>
    </div>

    <div v-else-if="payrollQuery.error.value"
      class="mt-5 grid place-items-center rounded-2xl border border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div class="grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-500">
        <span class="text-xl font-bold">!</span>
      </div>
      <h2 class="mt-4 font-bold text-slate-800">No fue posible cargar la planilla</h2>
      <p class="mt-1 text-sm text-slate-600">{{ getErrorMessage(payrollQuery.error.value) }}</p>
      <button type="button"
        class="mt-5 cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        @click="refetchAll">
        Reintentar
      </button>
    </div>

    <template v-else-if="payroll">
      <article class="mt-3 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md shadow-slate-900/5">
        <div class="grid gap-4 p-4 sm:p-5">
          <div>
            <h1 class="text-xl font-bold tracking-tight text-slate-900">
              Planilla {{ payroll.codigo }}
            </h1>
            <p class="mt-0.5 text-sm text-slate-600">{{ subtitle }}</p>
          </div>
          <PayrollStateStrip :status="payroll.estado" />
          <PayrollRecordForm ref="recordForm" :payroll="payroll" :editable="headerEditable" :server-error="headerError"
            @save="saveHeader" @dirty="headerDirty = $event" />

          <div class="flex flex-wrap items-center gap-2">
            <template v-if="hasEmployees">
              <button type="button" :class="secondaryButton" @click="openEmployeeData(null)">
                Datos por empleado
              </button>
              <button type="button" :class="secondaryButton" @click="openVariableData">
                Datos por variable
              </button>
              <button v-if="isPrepared" type="button" :class="secondaryButton" @click="openImport">
                Importar de Excel
              </button>
            </template>
            <button v-if="canChangeState" type="button" :class="headerDirty ? secondaryButton : primaryButton"
              :disabled="busy" @click="openState">
              {{ busy ? 'Procesando...' : 'Cambiar estado' }}
            </button>
            <template v-if="headerDirty">
              <button type="button" :class="secondaryButton" @click="recordForm?.reset()">
                Descartar
              </button>
              <button type="submit" form="payroll-record-form" :class="primaryButton"
                :disabled="updateMutation.isPending.value">
                {{ updateMutation.isPending.value ? 'Salvando...' : 'Salvar' }}
              </button>
            </template>

            <div class="ml-auto flex items-center gap-1">
              <button v-if="warningCount" type="button"
                class="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold transition"
                :class="blockingWarnings.length
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-amber-700 hover:bg-amber-50'
                  " :aria-expanded="warningsOpen" @click="warningsOpen = !warningsOpen">
                <PayrollIcon name="warning" />
                {{ warningCount }} {{ warningCount === 1 ? 'aviso' : 'avisos' }}
              </button>
              <div class="relative">
                <button type="button" :class="iconButton" :disabled="!canPrint || downloading"
                  :title="canPrint ? 'Imprimir' : 'Disponible cuando la planilla está generada'" aria-label="Imprimir"
                  :aria-expanded="reportsOpen" @click="reportsOpen = !reportsOpen">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M7 9V3h10v6M7 18H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M7 14h10v7H7z"
                      stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
                  </svg>
                </button>
                <div v-if="reportsOpen"
                  class="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-lg border border-slate-300 bg-white py-1 shadow-xl">
                  <button v-for="report in reports" :key="report.file" type="button"
                    class="block w-full cursor-pointer px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    @click="download(report.file)">
                    {{ report.label }}
                  </button>
                </div>
              </div>
              <button v-if="isAdmin && !isClosed" type="button" :class="iconButton"
                class="hover:bg-red-50 hover:text-red-600" title="Eliminar planilla" aria-label="Eliminar planilla"
                @click="deleteOpen = true">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"
                    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <ul v-if="warningsOpen && warningCount"
            class="list-disc rounded-lg border border-amber-200 bg-amber-50 py-2 pr-4 pl-8 text-sm text-amber-800">
            <li v-if="payroll.motivoReapertura && !isClosed">
              Reabierta: {{ payroll.motivoReapertura }}
            </li>
            <li v-for="(warning, index) in payrollWarnings" :key="index" :class="{ 'text-red-700': warning.bloquea }">
              {{ warning.mensaje }}<template v-if="warning.bloquea"> (impide cerrar)</template>
            </li>
          </ul>
        </div>

        <div class="flex gap-1 overflow-x-auto border-y border-slate-300 bg-slate-50 px-3">
          <button v-for="tab in tabs" :key="tab.value" type="button"
            class="cursor-pointer border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition" :class="activeTab === tab.value
                ? 'border-[#fa6900] text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-800'
              " @click="activeTab = tab.value">
            {{ tab.label }}
          </button>
        </div>

        <PayrollEmployeesTab v-if="activeTab === 'employees'" :employees="employees"
          :loading="hasEmployees && employeesQuery.isPending.value" @open-data="openEmployeeData" />
        <div v-else-if="activeTab === 'parameters'">
          <p v-if="payroll.estado === 'CREADA'" class="px-5 py-10 text-center text-sm text-slate-600">
            Los parámetros se toman al preparar la planilla.
          </p>
          <table v-else class="w-full border-collapse text-sm">
            <tbody class="divide-y divide-slate-200">
              <tr v-for="item in parameters" :key="item.label">
                <td class="px-4 py-2 text-slate-600">{{ item.label }}</td>
                <td class="px-4 py-2 text-right font-semibold text-slate-800 tabular-nums">
                  {{ item.value }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <PayrollGeneratedTab v-else :payroll="payroll" :employees="employees" />
      </article>
      <Teleport to="body">
        <Transition enter-active-class="transition duration-200" enter-from-class="translate-y-2 opacity-0"
          leave-active-class="transition duration-150" leave-to-class="opacity-0">
          <div v-if="notice.message"
            class="fixed right-4 bottom-4 left-4 z-[10000] flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg sm:left-auto sm:max-w-md"
            :class="notice.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
              " role="status">
            <span>{{ notice.message }}</span>
            <button type="button"
              class="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-md hover:bg-black/5"
              aria-label="Cerrar notificación" @click="notice.message = ''">
              <PayrollIcon name="close" />
            </button>
          </div>
        </Transition>
      </Teleport>
    </template>
  </section>

  <EmployeeDataModal :open="employeeDataOpen" :payroll-code="payroll?.codigo ?? ''" :employees="employees"
    :initial-employee-id="initialEmployeeId" :concepts="conceptsQuery.data.value ?? []" :editable="isPrepared"
    :status-label="statusLabels[payroll?.estado ?? 'CREADA']" :saving="dataMutations.employeeMutation.isPending.value"
    :server-error="dataError" @close="employeeDataOpen = false" @submit="saveEmployeeData" />
  <VariableDataModal :open="variableDataOpen" :payroll-code="payroll?.codigo ?? ''" :employees="employees"
    :concepts="conceptsQuery.data.value ?? []" :editable="isPrepared"
    :status-label="statusLabels[payroll?.estado ?? 'CREADA']" :saving="dataMutations.variableMutation.isPending.value"
    :server-error="dataError" @close="variableDataOpen = false" @submit="saveVariable" />
  <ExcelImportModal :open="importOpen" :payroll-code="payroll?.codigo ?? ''" :employees="employees"
    :concepts="conceptsQuery.data.value ?? []" :saving="dataMutations.importMutation.isPending.value"
    :server-error="dataError" @close="importOpen = false" @submit="importVariables" />
  <PayrollStateModal :open="stateOpen" :status="payroll?.estado ?? 'CREADA'"
    :description="payroll ? `${payroll.codigo} · ${payroll.descripcion}` : ''" :is-admin="isAdmin"
    :blockers="blockingWarnings.map((warning) => warning.mensaje)" :loading="busy" :server-error="stateError"
    @close="stateOpen = false" @accept="changeState" />
  <ConfirmDialog :open="deleteOpen" title="Eliminar planilla"
    :description="payroll ? `${payroll.codigo} · ${payroll.descripcion}` : ''"
    message="Se eliminará la planilla con sus empleados, los datos capturados y el cálculo." confirm-label="Eliminar"
    danger :loading="deleteMutation.isPending.value" @close="deleteOpen = false" @confirm="removePayroll" />
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import EmployeeDataModal from '@/modules/payrolls/components/EmployeeDataModal.vue'
import ExcelImportModal from '@/modules/payrolls/components/ExcelImportModal.vue'
import PayrollEmployeesTab from '@/modules/payrolls/components/PayrollEmployeesTab.vue'
import PayrollGeneratedTab from '@/modules/payrolls/components/PayrollGeneratedTab.vue'
import PayrollRecordForm from '@/modules/payrolls/components/PayrollRecordForm.vue'
import PayrollStateModal, {
  type StateAction,
} from '@/modules/payrolls/components/PayrollStateModal.vue'
import PayrollStateStrip from '@/modules/payrolls/components/PayrollStateStrip.vue'
import VariableDataModal from '@/modules/payrolls/components/VariableDataModal.vue'
import {
  payrollKeys,
  useManualConceptsQuery,
  usePayrollDataMutations,
  usePayrollEmployeesQuery,
  usePayrollMutations,
  usePayrollQuery,
} from '@/modules/payrolls/composables/usePayrolls'
import * as payrollService from '@/modules/payrolls/services/payroll.service'
import type {
  EditPayrollRequest,
  PayrollEmployee,
  SaveEmployeeDataRequest,
  SaveVariableRequest,
} from '@/modules/payrolls/types/payroll.types'
import { formatAmount, formatDateTime, statusLabels } from '@/modules/payrolls/utils/payroll.format'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import PayrollIcon from '@/modules/payrolls/components/PayrollIcon.vue'

type Tab = 'employees' | 'parameters' | 'generated'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const authStore = useAuthStore()
const payrollId = computed(() => Number(route.params.id))

const payrollQuery = usePayrollQuery(payrollId)
const payroll = computed(() => payrollQuery.data.value)
const isClosed = computed(() => payroll.value?.estado === 'CERRADA')
const isGenerated = computed(() => payroll.value?.estado === 'GENERADA')
const isPrepared = computed(() => payroll.value?.estado === 'PREPARADA')
const canPrint = computed(() => isGenerated.value || isClosed.value)
const hasEmployees = computed(() => !!payroll.value && payroll.value.estado !== 'CREADA')
const headerEditable = computed(() => !!payroll.value && !isClosed.value)
const employeesQuery = usePayrollEmployeesQuery(payrollId, hasEmployees)
const employeeDataOpen = ref(false)
const variableDataOpen = ref(false)
const importOpen = ref(false)
const activeTab = ref<Tab>('employees')
const conceptsQuery = useManualConceptsQuery(
  () => employeeDataOpen.value || variableDataOpen.value || importOpen.value,
)
const {
  updateMutation,
  deleteMutation,
  prepareMutation,
  generateMutation,
  backMutation,
  closeMutation,
  reopenMutation,
} = usePayrollMutations()
const dataMutations = usePayrollDataMutations(payrollId)

const isAdmin = computed(() => authStore.user?.role === 'ADMIN')
const notice = reactive<{ type: 'success' | 'error'; message: string }>({
  type: 'success',
  message: '',
})
const recordForm = ref<InstanceType<typeof PayrollRecordForm> | null>(null)
const headerDirty = ref(false)
const headerError = ref('')
const reportsOpen = ref(false)
const warningsOpen = ref(false)
const downloading = ref(false)
const deleteOpen = ref(false)
const stateOpen = ref(false)
const stateError = ref('')
const dataError = ref('')
const initialEmployeeId = ref<number | null>(null)
const reports = [
  { file: 'planilla/pdf' as const, label: 'Planilla general (PDF)' },
  { file: 'planilla/excel' as const, label: 'Planilla general (Excel)' },
  { file: 'boletas/pdf' as const, label: 'Boletas de pago (PDF)' },
]
const primaryButton =
  'inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#fa6900] px-4 text-sm font-bold text-[#202f33] transition hover:bg-[#f38630] disabled:cursor-not-allowed disabled:opacity-50'
const iconButton =
  'grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40'
const secondaryButton =
  'inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'

const employees = computed(() => employeesQuery.data.value ?? [])
const busy = computed(
  () =>
    prepareMutation.isPending.value ||
    generateMutation.isPending.value ||
    backMutation.isPending.value ||
    closeMutation.isPending.value ||
    reopenMutation.isPending.value,
)
const payrollWarnings = computed(() => payroll.value?.advertencias ?? [])
const blockingWarnings = computed(() => payrollWarnings.value.filter((warning) => warning.bloquea))
const warningCount = computed(
  () => payrollWarnings.value.length + (payroll.value?.motivoReapertura && !isClosed.value ? 1 : 0),
)
const tabs = computed<{ value: Tab; label: string }[]>(() => [
  { value: 'employees', label: `Empleados (${employees.value.length})` },
  { value: 'parameters', label: 'Parámetros' },
  { value: 'generated', label: 'Planilla generada' },
])
const parameters = computed(() => {
  const current = payroll.value
  if (!current) return []
  return [
    { label: 'IGSS laboral', value: `${current.igssLaboral ?? '—'} %` },
    { label: 'IGSS patronal', value: `${current.igssPatronal ?? '—'} %` },
    { label: 'Factor de hora extra', value: String(current.factorHoraExtra ?? '—') },
    { label: 'Días del mes', value: String(current.diasMes ?? '—') },
    { label: 'Horas del mes', value: String(current.horasMes ?? '—') },
  ]
})

watch(payrollId, () => {
  activeTab.value = 'employees'
  notice.message = ''
})

const canChangeState = computed(() => !!payroll.value && (!isClosed.value || isAdmin.value))
const subtitle = computed(() => {
  const current = payroll.value
  if (!current) return ''
  const type = current.nombreTipoPlanilla ?? 'Planilla'
  switch (current.estado) {
    case 'CREADA':
      return `${type} · Recién creada`
    case 'PREPARADA':
      return `${type} · Preparada el ${formatDateTime(current.fechaPreparacion)}`
    case 'GENERADA':
      return `${type} · Generada el ${formatDateTime(current.fechaGeneracion)}`
    default:
      return `${type} · Cerrada el ${formatDateTime(current.fechaCierre)} por ${current.usuarioCierre}`
  }
})

function openState(): void {
  stateError.value = ''
  reportsOpen.value = false
  stateOpen.value = true
}

async function changeState(action: StateAction, reason: string): Promise<void> {
  const current = payroll.value
  if (!current) return
  stateError.value = ''
  const steps: Record<StateAction, { run: () => Promise<unknown>; message: string }> = {
    prepare: {
      run: () => prepareMutation.mutateAsync(payrollId.value),
      message: 'Planilla preparada. Captura los datos del mes y luego genérala.',
    },
    reprepare: {
      run: () => prepareMutation.mutateAsync(payrollId.value),
      message: 'Planilla preparada de nuevo; lo que cambiaste a mano se conservó.',
    },
    generate: {
      run: () => generateMutation.mutateAsync(payrollId.value),
      message: 'Planilla generada. Revisa el resultado antes de cerrarla.',
    },
    back: {
      run: () => backMutation.mutateAsync(payrollId.value),
      message: 'La planilla regresó a preparada. Corrige lo necesario y genérala de nuevo.',
    },
    close: {
      run: () => closeMutation.mutateAsync({ id: payrollId.value, version: current.version ?? '' }),
      message: 'Planilla cerrada correctamente.',
    },
    reopen: {
      run: () => reopenMutation.mutateAsync({ id: payrollId.value, motivo: reason }),
      message:
        'Planilla reabierta: quedó generada. Si necesitas cambiar datos, regrésala a preparada.',
    },
  }
  try {
    await steps[action].run()
    stateOpen.value = false
    showNotice('success', steps[action].message)
    if (action === 'generate') activeTab.value = 'generated'
    if (action === 'prepare' || action === 'back') activeTab.value = 'employees'
  } catch (error) {
    stateError.value = getErrorMessage(error)
  }
}

function openEmployeeData(employee: PayrollEmployee | null): void {
  initialEmployeeId.value = employee?.idEmpleado ?? null
  dataError.value = ''
  employeeDataOpen.value = true
}

function openVariableData(): void {
  dataError.value = ''
  variableDataOpen.value = true
}

async function saveEmployeeData(
  idEmpleado: number,
  values: SaveEmployeeDataRequest,
): Promise<void> {
  dataError.value = ''
  try {
    const saved = await dataMutations.employeeMutation.mutateAsync({ idEmpleado, payload: values })
    showNotice(
      'success',
      `Datos de ${saved.nombreCompleto} salvados${saved.valores.length ? ` (${saved.valores.map((value) => `${value.nombreRubro} ${formatAmount(value.monto)}`).join(', ')})` : ''}.`,
    )
  } catch (error) {
    dataError.value = getErrorMessage(error)
  }
}

async function saveVariable(payload: SaveVariableRequest): Promise<void> {
  dataError.value = ''
  try {
    await dataMutations.variableMutation.mutateAsync(payload)
    showNotice(
      'success',
      `Datos salvados (${payload.valores.length} ${payload.valores.length === 1 ? 'empleado' : 'empleados'}).`,
    )
  } catch (error) {
    dataError.value = getErrorMessage(error)
  }
}

function openImport(): void {
  dataError.value = ''
  importOpen.value = true
}

async function importVariables(variables: SaveVariableRequest[]): Promise<void> {
  dataError.value = ''
  try {
    const saved = await dataMutations.importMutation.mutateAsync(variables)
    const count = variables.reduce((sum, item) => sum + item.valores.length, 0)
    importOpen.value = false
    showNotice(
      'success',
      `Importados ${count} ${count === 1 ? 'valor' : 'valores'} de ${saved.length} ${saved.length === 1 ? 'empleado' : 'empleados'}.`,
    )
  } catch (error) {
    dataError.value = getErrorMessage(error)
  }
}

async function saveHeader(values: EditPayrollRequest): Promise<void> {
  headerError.value = ''
  try {
    await updateMutation.mutateAsync({ id: payrollId.value, payload: values })
    showNotice('success', 'Encabezado salvado.')
  } catch (error) {
    headerError.value = getErrorMessage(error)
  }
}

async function download(file: payrollService.ReportFile): Promise<void> {
  reportsOpen.value = false
  downloading.value = true
  try {
    await payrollService.downloadReport(payrollId.value, file)
  } catch (error) {
    showNotice('error', getErrorMessage(error))
  } finally {
    downloading.value = false
  }
}

async function removePayroll(): Promise<void> {
  const deletedId = payrollId.value
  try {
    await deleteMutation.mutateAsync(deletedId)
    deleteOpen.value = false
    await router.replace({ name: 'payrolls' })
    queryClient.removeQueries({ queryKey: payrollKeys.detail(deletedId) })
  } catch (error) {
    deleteOpen.value = false
    showNotice('error', getErrorMessage(error))
  }
}

let noticeTimer: ReturnType<typeof setTimeout> | undefined

function showNotice(type: 'success' | 'error', message: string): void {
  notice.type = type
  notice.message = message
  clearTimeout(noticeTimer)
  if (type === 'success') noticeTimer = setTimeout(() => (notice.message = ''), 5000)
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
}

function refetchAll(): void {
  void payrollQuery.refetch()
  void employeesQuery.refetch()
}
</script>
