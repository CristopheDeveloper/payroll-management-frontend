<template>
  <section class="w-full px-3 py-5 sm:px-4 lg:px-5 lg:py-6 2xl:px-6">
    <RouterLink
      :to="{ name: 'employees' }"
      class="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-[#b34700]"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="m15 18-6-6 6-6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Empleados
    </RouterLink>

    <div
      v-if="!isNew && employeeQuery.isPending.value"
      class="mt-3 h-80 animate-pulse rounded-2xl bg-slate-100"
      aria-label="Cargando empleado"
    ></div>
    <div
      v-else-if="!isNew && employeeQuery.error.value"
      class="mt-3 grid place-items-center rounded-2xl border border-slate-300 bg-white px-6 py-14 text-center"
    >
      <h2 class="font-bold text-slate-800">No fue posible cargar el empleado</h2>
      <p class="mt-1 text-sm text-slate-600">{{ getErrorMessage(employeeQuery.error.value) }}</p>
    </div>

    <article
      v-else
      class="mt-3 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md shadow-slate-900/5"
    >
      <div class="grid gap-4 p-4 pb-3 sm:p-5 sm:pb-3">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 class="text-xl font-bold tracking-tight text-slate-900">
              {{ employee ? `${employee.nombres} ${employee.apellidos}` : 'Nuevo empleado' }}
            </h1>
          </div>
          <span
            v-if="employee"
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
            :class="
              employee.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
            "
            ><span
              class="h-1.5 w-1.5 rounded-full"
              :class="employee.activo ? 'bg-emerald-500' : 'bg-slate-400'"
            ></span
            >{{ employee.activo ? 'Activo' : 'De baja' }}</span
          >
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <template v-if="isNew">
            <button
              type="submit"
              form="employee-record-form"
              :class="primaryButton"
              :disabled="createMutation.isPending.value"
            >
              {{ createMutation.isPending.value ? 'Salvando...' : 'Salvar' }}
            </button>
            <RouterLink :to="{ name: 'employees' }" :class="secondaryButton">Cancelar</RouterLink>
          </template>
          <template v-else-if="employee">
            <template v-if="formDirty">
              <button
                type="submit"
                form="employee-record-form"
                :class="primaryButton"
                :disabled="updateMutation.isPending.value"
              >
                {{ updateMutation.isPending.value ? 'Salvando...' : 'Salvar' }}
              </button>
              <button type="button" :class="secondaryButton" @click="recordForm?.reset()">
                Descartar
              </button>
            </template>
            <template v-if="employee.activo">
              <button type="button" :class="secondaryButton" @click="openHireDate">
                Corregir fecha de ingreso
              </button>
              <button
                type="button"
                :class="secondaryButton"
                class="hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                @click="openTerminate"
              >
                Dar de baja
              </button>
            </template>
            <button
              v-else
              type="button"
              :class="formDirty ? secondaryButton : primaryButton"
              @click="openRehire"
            >
              Reingresar
            </button>
          </template>
        </div>
      </div>

      <EmployeeRecordForm
        ref="recordForm"
        :section="activeTab"
        :employee="employee"
        :positions="positions"
        :departments="departments"
        :server-error="formError"
        @submit="save"
        @dirty="formDirty = $event"
        @invalid="onInvalid"
      >
        <template #tabs>
          <div class="flex gap-1 overflow-x-auto border-y border-slate-300 bg-slate-50 px-3">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              type="button"
              class="cursor-pointer border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition"
              :class="
                activeTab === tab.value
                  ? 'border-[#fa6900] text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              "
              @click="activeTab = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>
        </template>

        <div v-if="activeTab === 'periods' && employee" class="overflow-x-auto">
          <table class="w-full min-w-[36rem] border-collapse text-sm">
            <thead class="bg-[#e4f2f1] text-xs font-bold tracking-wider text-[#245f69] uppercase">
              <tr>
                <th class="px-4 py-2.5 text-left">Ingreso</th>
                <th class="px-4 py-2.5 text-left">Retiro</th>
                <th class="px-4 py-2.5 text-left">Tipo de retiro</th>
                <th class="px-4 py-2.5 text-left">Motivo del retiro</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-for="period in sortedPeriods" :key="period.idPeriodoLaboral">
                <td class="px-4 py-2 text-slate-800 tabular-nums">
                  {{ formatDate(period.fechaIngreso) }}
                </td>
                <td class="px-4 py-2 text-slate-800 tabular-nums">
                  {{ period.fechaBaja ? formatDate(period.fechaBaja) : 'Actual' }}
                </td>
                <td class="px-4 py-2 text-slate-700">
                  {{ period.tipoBaja ? terminationTypeLabels[period.tipoBaja] : '' }}
                </td>
                <td class="px-4 py-2 text-slate-600">{{ period.motivoBaja }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <EmployeePaymentsTab
          v-if="activeTab === 'payrolls' && employee"
          :payments="paymentsQuery.data.value ?? []"
          :loading="paymentsQuery.isPending.value"
        />
      </EmployeeRecordForm>
    </article>

    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="translate-y-2 opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="notice.message"
        class="fixed right-4 bottom-4 left-4 z-[8000] flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg sm:left-auto sm:max-w-md"
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
          class="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-md hover:bg-black/5"
          aria-label="Cerrar notificación"
          @click="notice.message = ''"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m6 6 12 12M18 6 6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </Transition>
  </section>

  <TerminateEmployeeModal
    :open="terminateOpen"
    :employee-name="fullName"
    :loading="terminateMutation.isPending.value"
    :server-error="actionError"
    :confirm-code="confirmAbsences"
    @close="terminateOpen = false"
    @submit="terminate"
  />
  <RehireEmployeeModal
    :open="rehireOpen"
    :employee="employee"
    :positions="positions"
    :departments="departments"
    :loading="rehireMutation.isPending.value"
    :server-error="actionError"
    @close="rehireOpen = false"
    @submit="rehire"
  />
  <HireDateModal
    :open="hireDateOpen"
    :employee-name="fullName"
    :current-date="currentPeriod?.fechaIngreso ?? ''"
    :loading="hireDateMutation.isPending.value"
    :server-error="actionError"
    @close="hireDateOpen = false"
    @submit="correctHireDate"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import EmployeePaymentsTab from '@/modules/employees/components/EmployeePaymentsTab.vue'
import EmployeeRecordForm from '@/modules/employees/components/EmployeeRecordForm.vue'
import HireDateModal from '@/modules/employees/components/HireDateModal.vue'
import RehireEmployeeModal from '@/modules/employees/components/RehireEmployeeModal.vue'
import TerminateEmployeeModal from '@/modules/employees/components/TerminateEmployeeModal.vue'
import {
  useEmployeeMutations,
  useEmployeePaymentsQuery,
  useEmployeeQuery,
} from '@/modules/employees/composables/useEmployees'
import { EmployeeRequestError } from '@/modules/employees/services/employee.service'
import type {
  CreateEmployeeRequest,
  RehireEmployeeRequest,
  TerminateEmployeeRequest,
} from '@/modules/employees/types/employee.types'
import { terminationTypeLabels } from '@/modules/employees/utils/employee.format'
import { useDepartmentsQuery } from '@/modules/departments/composables/useDepartments'
import { usePositionsQuery } from '@/modules/positions/composables/usePositions'
import { formatDate } from '@/modules/payrolls/utils/payroll.format'

type Tab = 'personal' | 'periods' | 'params' | 'payment' | 'payrolls'

const route = useRoute()
const router = useRouter()
const isNew = computed(() => route.name === 'employee-new')
const employeeId = computed(() => Number(route.params.id ?? 0))
const employeeQuery = useEmployeeQuery(employeeId, () => !isNew.value && employeeId.value > 0)
const employee = computed(() => (isNew.value ? null : (employeeQuery.data.value ?? null)))
const activeTab = ref<Tab>('personal')
const paymentsQuery = useEmployeePaymentsQuery(
  employeeId,
  () => !isNew.value && activeTab.value === 'payrolls',
)
const positionsQuery = usePositionsQuery()
const departmentsQuery = useDepartmentsQuery()
const { createMutation, updateMutation, terminateMutation, rehireMutation, hireDateMutation } =
  useEmployeeMutations()

const primaryButton =
  'inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#fa6900] px-4 text-sm font-bold text-[#202f33] transition hover:bg-[#f38630] disabled:cursor-not-allowed disabled:opacity-50'
const secondaryButton =
  'inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'

const recordForm = ref<InstanceType<typeof EmployeeRecordForm> | null>(null)
const formDirty = ref(false)
const formError = ref('')
const actionError = ref('')
const confirmAbsences = ref(false)
const terminateOpen = ref(false)
const rehireOpen = ref(false)
const hireDateOpen = ref(false)
const notice = reactive<{ type: 'success' | 'error'; message: string }>({
  type: 'success',
  message: '',
})

const positions = computed(() =>
  (positionsQuery.data.value ?? [])
    .map((item) => ({ id: item.idPuesto, nombre: item.nombre, activo: item.activo }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre)),
)
const departments = computed(() =>
  (departmentsQuery.data.value ?? [])
    .map((item) => ({ id: item.idDepartamento, nombre: item.nombre, activo: item.activo }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre)),
)
const fullName = computed(() =>
  employee.value ? `${employee.value.nombres} ${employee.value.apellidos}` : '',
)
const sortedPeriods = computed(() =>
  [...(employee.value?.periodos ?? [])].sort((a, b) =>
    b.fechaIngreso.localeCompare(a.fechaIngreso),
  ),
)
const currentPeriod = computed(() => sortedPeriods.value[0] ?? null)
const tabs = computed<{ value: Tab; label: string }[]>(() =>
  isNew.value
    ? [
        { value: 'personal', label: 'Datos personales' },
        { value: 'params', label: 'Parámetros' },
        { value: 'payment', label: 'Forma de pago' },
      ]
    : [
        { value: 'personal', label: 'Datos personales' },
        { value: 'periods', label: 'Altas y bajas' },
        { value: 'params', label: 'Parámetros' },
        { value: 'payment', label: 'Forma de pago' },
        { value: 'payrolls', label: 'Planillas' },
      ],
)

watch(employeeId, () => {
  activeTab.value = 'personal'
  notice.message = ''
})

function onInvalid(section: 'header' | 'personal' | 'params' | 'payment'): void {
  if (section !== 'header') activeTab.value = section
}

async function save(values: CreateEmployeeRequest): Promise<void> {
  formError.value = ''
  try {
    if (isNew.value) {
      const created = await createMutation.mutateAsync(values)
      await router.replace({ name: 'employee-detail', params: { id: created.idEmpleado } })
      showNotice('success', `Empleado ${created.codigoEmpleado} creado.`)
      return
    }
    await updateMutation.mutateAsync({ id: employeeId.value, payload: values })
    showNotice('success', 'Datos del empleado salvados.')
  } catch (error) {
    formError.value = getErrorMessage(error)
  }
}

function openTerminate(): void {
  actionError.value = ''
  confirmAbsences.value = false
  terminateOpen.value = true
}

async function terminate(values: TerminateEmployeeRequest): Promise<void> {
  actionError.value = ''
  try {
    await terminateMutation.mutateAsync({ id: employeeId.value, payload: values })
    terminateOpen.value = false
    showNotice('success', 'Empleado dado de baja.')
  } catch (error) {
    confirmAbsences.value =
      error instanceof EmployeeRequestError && error.code === 'AUSENCIAS_PROGRAMADAS'
    actionError.value = getErrorMessage(error)
  }
}

function openRehire(): void {
  actionError.value = ''
  rehireOpen.value = true
}

async function rehire(values: RehireEmployeeRequest): Promise<void> {
  actionError.value = ''
  try {
    await rehireMutation.mutateAsync({ id: employeeId.value, payload: values })
    rehireOpen.value = false
    showNotice('success', 'Empleado reingresado.')
  } catch (error) {
    actionError.value = getErrorMessage(error)
  }
}

function openHireDate(): void {
  actionError.value = ''
  hireDateOpen.value = true
}

async function correctHireDate(fechaIngreso: string): Promise<void> {
  actionError.value = ''
  try {
    await hireDateMutation.mutateAsync({ id: employeeId.value, fechaIngreso })
    hireDateOpen.value = false
    showNotice('success', 'Fecha de ingreso corregida.')
  } catch (error) {
    actionError.value = getErrorMessage(error)
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
</script>
