<template>
  <section class="w-full px-3 py-5 sm:px-4 lg:px-5 lg:py-6 2xl:px-6">
    <header class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div class="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-[#d95800] uppercase">
          <span class="h-px w-6 bg-[#fa6900]"></span>
          Administración
        </div>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Empleados
        </h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Administra la información, contratación, bajas y reingresos del personal.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#fa6900] px-5 text-sm font-bold text-[#202f33] shadow-lg shadow-orange-500/20 transition hover:bg-[#f38630]"
        @click="openCreate"
      >
        <span class="text-xl">+</span>
        Contratar empleado
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
        class="mt-5 flex items-center justify-between gap-5 rounded-2xl border px-5 py-4 text-sm font-medium"
        :class="notice.type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-red-200 bg-red-50 text-red-700'"
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

    <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <div class="mb-4">
          <h2 class="font-bold text-slate-800">Directorio de empleados</h2>
          <p class="mt-1 text-sm text-slate-500">
            Busca empleados y filtra los resultados por estado.
          </p>
        </div>

        <div class="grid gap-3 md:grid-cols-[minmax(16rem,1fr)_13rem_auto]">
          <input
            v-model="search"
            type="search"
            class="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/20"
            placeholder="Buscar por nombre, código o DPI..."
            aria-label="Buscar empleados"
          />

          <select
            v-model="statusFilter"
            class="h-11 cursor-pointer rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/20"
            aria-label="Filtrar por estado"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>

          <button
            type="button"
            class="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-50"
            :disabled="isFetching"
            @click="refetch"
          >
            <span :class="{ 'animate-spin': isFetching }">↻</span>
            Actualizar
          </button>
        </div>
      </div>

      <div v-if="queryError" class="grid place-items-center px-6 py-16 text-center">
        <div class="grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-500">
          <span class="text-xl font-bold">!</span>
        </div>
        <h2 class="mt-4 font-bold text-slate-800">
          No fue posible cargar los empleados
        </h2>
        <p class="mt-1 text-sm text-slate-500">
          {{ getErrorMessage(queryError) }}
        </p>
        <button
          type="button"
          class="mt-5 cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          @click="refetch"
        >
          Reintentar
        </button>
      </div>

      <div v-else-if="isPending" class="grid gap-3 p-5" aria-label="Cargando empleados">
        <div
          v-for="item in 6"
          :key="item"
          class="h-16 animate-pulse rounded-xl bg-slate-100"
        ></div>
      </div>

      <div
        v-else-if="filteredEmployees.length === 0"
        class="grid place-items-center px-6 py-16 text-center"
      >
        <div class="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <span class="text-2xl">♙</span>
        </div>
        <h3 class="mt-4 font-bold text-slate-800">No hay empleados para mostrar</h3>
        <p class="mt-1 text-sm text-slate-500">
          Ajusta los filtros o registra un nuevo empleado.
        </p>
      </div>

      <EmployeesTable
        v-else
        :employees="filteredEmployees"
        :loading="isFetching"
        @detail="openDetail"
        @edit="openEdit"
        @terminate="openTerminate"
        @rehire="openRehire"
      />

      <div
        v-if="!isPending && !queryError"
        class="border-t border-slate-200 bg-slate-50/70 px-5 py-3 text-sm text-slate-600"
      >
        Mostrando {{ filteredEmployees.length }} de {{ employees.length }} empleados
      </div>
    </div>

    <EmployeeFormModal
      :open="formOpen"
      :mode="formMode"
      :employee="selectedDetail"
      :departments="departments"
      :positions="positions"
      :loading="formLoading"
      :server-error="formError"
      @close="formOpen = false"
      @submit="saveEmployee"
    />

    <EmployeeTerminationModal
      :open="terminationOpen"
      :loading="terminateMutation.isPending.value"
      :server-error="actionError"
      @close="terminationOpen = false"
      @submit="saveTermination"
    />

    <EmployeeRehireModal
      :open="rehireOpen"
      :departments="departments"
      :positions="positions"
      :loading="rehireMutation.isPending.value"
      :server-error="actionError"
      @close="rehireOpen = false"
      @submit="saveRehire"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import EmployeesTable from '@/modules/employees/components/EmployeesTable.vue'
import EmployeeFormModal from '@/modules/employees/components/EmployeeFormModal.vue'
import EmployeeTerminationModal from '@/modules/employees/components/EmployeeTerminationModal.vue'
import EmployeeRehireModal from '@/modules/employees/components/EmployeeRehireModal.vue'
import {
  useEmployeesQuery,
  useDepartmentsQuery,
  usePositionsQuery,
  useEmployeeMutations,
  employeeKeys,
} from '@/modules/employees/composables/useEmployees'
import * as employeeService from '@/modules/employees/services/employee.service'
import type {
  Employee,
  EmployeeDetail,
  EmployeePayload,
  CreateEmployeePayload,
  BajaPayload,
  ReingresoPayload,
} from '@/modules/employees/types/employee.types'

const queryClient = useQueryClient()
const employeesQuery = useEmployeesQuery()
const departmentsQuery = useDepartmentsQuery()
const positionsQuery = usePositionsQuery()

const {
  createMutation,
  updateMutation,
  terminateMutation,
  rehireMutation,
} = useEmployeeMutations()

const search = ref('')
const statusFilter = ref('all')
const formOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formError = ref('')
const actionError = ref('')
const terminationOpen = ref(false)
const rehireOpen = ref(false)
const selectedEmployee = ref<Employee | null>(null)
const selectedDetail = ref<EmployeeDetail | null>(null)

const notice = reactive<{ type: 'success' | 'error'; message: string }>({
  type: 'success',
  message: '',
})

const employees = computed(() => employeesQuery.data.value ?? [])
const departments = computed(() => departmentsQuery.data.value ?? [])
const positions = computed(() => positionsQuery.data.value ?? [])
const isPending = computed(() => employeesQuery.isPending.value)
const isFetching = computed(() => employeesQuery.isFetching.value)
const queryError = computed(() => employeesQuery.error.value)

const formLoading = computed(
  () => createMutation.isPending.value || updateMutation.isPending.value,
)

const filteredEmployees = computed(() => {
  const term = search.value.trim().toLocaleLowerCase()

  return employees.value.filter((employee) => {
    const matchesSearch =
      !term ||
      `${employee.codigoEmpleado} ${employee.nombreCompleto} ${employee.dpi}`
        .toLocaleLowerCase()
        .includes(term)

    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'active' ? employee.activo : !employee.activo)

    return matchesSearch && matchesStatus
  })
})

function openCreate(): void {
  formMode.value = 'create'
  selectedEmployee.value = null
  selectedDetail.value = null
  formError.value = ''
  formOpen.value = true
}

async function openEdit(employee: Employee): Promise<void> {
  await openEmployeeForm(employee, 'edit')
}

async function openDetail(employee: Employee): Promise<void> {
  await openEmployeeForm(employee, 'edit')
}

async function openEmployeeForm(
  employee: Employee,
  mode: 'edit',
): Promise<void> {
  formError.value = ''
  try {
    const detail = await queryClient.fetchQuery({
      queryKey: employeeKeys.detail(employee.idEmpleado),
      queryFn: () => employeeService.getEmployee(employee.idEmpleado),
    })

    selectedEmployee.value = employee
    selectedDetail.value = detail
    formMode.value = mode
    formOpen.value = true
  } catch (error) {
    showNotice('error', getErrorMessage(error))
  }
}

async function saveEmployee(
  values: EmployeePayload | CreateEmployeePayload,
): Promise<void> {
  formError.value = ''
  try {
    if (formMode.value === 'create') {
      await createMutation.mutateAsync(values as CreateEmployeePayload)
      showNotice('success', 'Empleado contratado correctamente.')
    } else if (selectedEmployee.value) {
      await updateMutation.mutateAsync({
        id: selectedEmployee.value.idEmpleado,
        payload: values as EmployeePayload,
      })
      showNotice('success', 'Empleado actualizado correctamente.')
    }

    formOpen.value = false
  } catch (error) {
    formError.value = getErrorMessage(error)
  }
}

function openTerminate(employee: Employee): void {
  selectedEmployee.value = employee
  actionError.value = ''
  terminationOpen.value = true
}

async function saveTermination(payload: BajaPayload): Promise<void> {
  if (!selectedEmployee.value) return
  actionError.value = ''

  try {
    await terminateMutation.mutateAsync({
      id: selectedEmployee.value.idEmpleado,
      payload,
    })
    terminationOpen.value = false
    showNotice('success', 'La baja del empleado se registró correctamente.')
  } catch (error) {
    actionError.value = getErrorMessage(error)
  }
}

function openRehire(employee: Employee): void {
  selectedEmployee.value = employee
  actionError.value = ''
  rehireOpen.value = true
}

async function saveRehire(payload: ReingresoPayload): Promise<void> {
  if (!selectedEmployee.value) return
  actionError.value = ''

  try {
    await rehireMutation.mutateAsync({
      id: selectedEmployee.value.idEmpleado,
      payload,
    })
    rehireOpen.value = false
    showNotice('success', 'El reingreso del empleado se registró correctamente.')
  } catch (error) {
    actionError.value = getErrorMessage(error)
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
  void employeesQuery.refetch()
}
</script>
