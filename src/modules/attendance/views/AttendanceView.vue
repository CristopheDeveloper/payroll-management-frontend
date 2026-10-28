<template>
  <section class="w-full px-3 py-5 sm:px-4 lg:px-5 lg:py-6 2xl:px-6">
    <header>
      <div
        class="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-[#b34700] uppercase"
      >
        <span class="h-px w-6 bg-[#fa6900]"></span>
        Nómina
      </div>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">Asistencia</h1>
    </header>

    <div
      class="mt-4 overflow-clip rounded-2xl border border-slate-300 bg-white shadow-md shadow-slate-900/5"
    >
      <div class="flex gap-1 overflow-x-auto border-b border-slate-300 px-3 pt-3 sm:px-4">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="min-h-10 cursor-pointer border-b-2 px-4 pt-1 pb-3 text-sm font-semibold whitespace-nowrap transition"
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

      <template v-if="activeTab === 'day'">
        <div
          class="grid gap-2 border-b border-slate-300 p-3 sm:p-4 lg:grid-cols-[auto_minmax(14rem,1fr)_auto_auto]"
        >
          <div class="flex flex-wrap items-center gap-1">
            <button
              type="button"
              class="grid h-11 w-10 cursor-pointer place-items-center rounded-xl border border-[#a7dbd8] text-slate-600 transition hover:bg-[#f38630] hover:text-[#202f33]"
              title="Día anterior"
              aria-label="Día anterior"
              @click="moveDay(-1)"
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
            </button>
            <input
              :value="selectedDate"
              type="date"
              :max="today"
              class="h-11 rounded-xl border border-[#a7dbd8] px-3 text-sm text-slate-700 outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
              aria-label="Fecha"
              @change="changeDate(($event.target as HTMLInputElement).value)"
            />
            <button
              type="button"
              class="grid h-11 w-10 cursor-pointer place-items-center rounded-xl border border-[#a7dbd8] text-slate-600 transition hover:bg-[#f38630] hover:text-[#202f33] disabled:cursor-not-allowed disabled:opacity-35"
              title="Día siguiente"
              aria-label="Día siguiente"
              :disabled="selectedDate >= today"
              @click="moveDay(1)"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="m9 18 6-6-6-6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <span class="ml-1 text-sm text-slate-600 capitalize">{{ weekday }}</span>
            <span
              v-if="dayStatus"
              class="ml-1 rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap"
              :class="dayStatus.className"
              :title="dayStatus.title"
              >{{ dayStatus.label }}</span
            >
          </div>
          <label class="relative block">
            <span class="sr-only">Buscar empleado</span>
            <svg
              class="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" />
              <path
                d="m16 16 4 4"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
            <input
              v-model="search"
              type="search"
              class="h-11 w-full rounded-xl border border-[#a7dbd8] pr-4 pl-10 text-sm outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
              placeholder="Buscar empleado..."
            />
          </label>
          <label
            class="flex h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-slate-300 px-3.5 text-sm text-slate-600"
          >
            <input v-model="onlyExceptions" type="checkbox" class="h-4 w-4 accent-[#fa6900]" />
            Solo ausencias
          </label>
          <button
            type="button"
            class="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            title="Marcar varios días seguidos de un empleado"
            @click="openRange"
          >
            Ausencia de varios días
          </button>
        </div>

        <div
          v-if="dayQuery.isPending.value"
          class="grid gap-3 p-5"
          aria-label="Cargando asistencia"
        >
          <div
            v-for="item in 4"
            :key="item"
            class="h-14 animate-pulse rounded-xl bg-slate-100"
          ></div>
        </div>
        <div
          v-else-if="dayQuery.error.value"
          class="grid place-items-center px-6 py-14 text-center"
        >
          <div class="grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-500">
            <span class="text-xl font-bold">!</span>
          </div>
          <h2 class="mt-4 font-bold text-slate-800">No fue posible cargar la asistencia</h2>
          <p class="mt-1 text-sm text-slate-600">{{ getErrorMessage(dayQuery.error.value) }}</p>
          <button
            type="button"
            class="mt-5 cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            @click="refetchDay"
          >
            Reintentar
          </button>
        </div>
        <div
          v-else-if="filteredRows.length === 0"
          class="grid place-items-center px-6 py-14 text-center"
        >
          <h2 class="font-bold text-slate-800">
            {{
              !rows.length
                ? 'No hay empleados en esta fecha'
                : search.trim()
                  ? 'Ningún empleado coincide con la búsqueda'
                  : 'Sin ausencias este día'
            }}
          </h2>
          <p v-if="rows.length && !search.trim()" class="mt-1 text-sm text-slate-600">
            Para registrar una, busca al empleado.
          </p>
        </div>
        <div v-else class="divide-y divide-slate-200">
          <div
            class="hidden grid-cols-[minmax(12rem,1.2fr)_minmax(8rem,0.8fr)_17.5rem_minmax(10rem,1fr)] gap-4 bg-[#e4f2f1] px-4 py-2.5 text-xs font-bold tracking-wider text-[#245f69] uppercase md:grid sm:px-5"
          >
            <span>Empleado</span>
            <span>Departamento</span>
            <span>Estado</span>
            <span>Observación</span>
          </div>
          <div
            v-for="row in filteredRows"
            :key="row.idEmpleado"
            class="grid gap-2 px-4 py-2.5 transition sm:px-5 md:grid-cols-[minmax(12rem,1.2fr)_minmax(8rem,0.8fr)_17.5rem_minmax(10rem,1fr)] md:items-center md:gap-4"
            :class="isChanged(row) ? 'bg-[#69d2e7]/10' : 'hover:bg-slate-50/80'"
          >
            <div>
              <span class="font-semibold text-slate-800">{{ row.nombreCompleto }}</span>
              <span class="ml-2 text-xs text-slate-600">{{ row.codigoEmpleado }}</span>
              <span class="ml-2 text-xs text-slate-600 md:hidden">· {{ row.departamento }}</span>
            </div>
            <span class="hidden text-slate-600 md:block">{{ row.departamento }}</span>
            <AttendanceStatusPicker
              v-model="row.estado"
              :label="`Estado de ${row.nombreCompleto}`"
              @update:model-value="onStatusChange(row)"
            />
            <input
              v-if="row.estado !== 'PRESENTE' || row.observacion || notes[row.idEmpleado]"
              v-model="row.observacion"
              type="text"
              maxlength="200"
              class="h-9 w-full rounded-lg border border-[#a7dbd8] px-3 text-sm text-slate-800 outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
              placeholder="Observación (opcional)"
              :aria-label="`Observación de ${row.nombreCompleto}`"
            />
            <button
              v-else
              type="button"
              class="-my-2 justify-self-start py-2 text-sm font-semibold text-slate-600 transition hover:text-[#245f69]"
              @click="notes[row.idEmpleado] = true"
            >
              Agregar nota
            </button>
          </div>
        </div>

        <div
          v-if="pendingChanges"
          class="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-slate-300 bg-white/95 px-3 py-3 backdrop-blur sm:px-4"
        >
          <span class="mr-auto text-sm font-semibold text-[#b34700]">
            {{ pendingChanges }}
            {{ pendingChanges === 1 ? 'cambio sin guardar' : 'cambios sin guardar' }}
          </span>
          <button
            type="button"
            class="inline-flex h-10 cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            :disabled="saveDayMutation.isPending.value"
            @click="loadRows"
          >
            Descartar
          </button>
          <button
            type="button"
            class="inline-flex h-10 cursor-pointer items-center rounded-lg bg-[#fa6900] px-5 text-sm font-bold text-[#202f33] transition hover:bg-[#f38630] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="saveDayMutation.isPending.value"
            @click="saveDay"
          >
            {{ saveDayMutation.isPending.value ? 'Guardando...' : 'Guardar día' }}
          </button>
        </div>
      </template>

      <template v-else>
        <div
          class="flex flex-col gap-3 border-b border-slate-300 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
        >
          <input
            v-model="summaryMonth"
            type="month"
            :max="today.slice(0, 7)"
            class="h-11 rounded-xl border border-[#a7dbd8] px-3 text-sm text-slate-700 outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25 sm:w-56"
            aria-label="Mes"
          />
        </div>

        <div v-if="summaryQuery.isPending.value" class="grid gap-3 p-5">
          <div
            v-for="item in 4"
            :key="item"
            class="h-14 animate-pulse rounded-xl bg-slate-100"
          ></div>
        </div>
        <div
          v-else-if="summaryQuery.error.value"
          class="grid place-items-center px-6 py-14 text-center"
        >
          <h2 class="font-bold text-slate-800">No fue posible cargar el resumen</h2>
          <p class="mt-1 text-sm text-slate-600">{{ getErrorMessage(summaryQuery.error.value) }}</p>
        </div>
        <div
          v-else-if="withAbsences.length === 0"
          class="grid place-items-center px-6 py-14 text-center"
        >
          <h2 class="font-bold text-slate-800">Sin ausencias en {{ summaryPeriod }}</h2>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead class="bg-[#e4f2f1] text-xs font-bold tracking-wider text-[#245f69] uppercase">
              <tr>
                <th class="px-5 py-3.5">Empleado</th>
                <th class="px-5 py-3.5 text-right">Faltas</th>
                <th class="px-5 py-3.5 text-right">Permisos</th>
                <th class="px-5 py-3.5 text-right">Suspensión IGSS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr
                v-for="item in withAbsences"
                :key="item.idEmpleado"
                class="cursor-pointer transition hover:bg-slate-50/80"
                title="Ver o eliminar los registros del mes"
                @click="openRecords(item.idEmpleado, item.nombreCompleto)"
              >
                <td class="px-5 py-3.5">
                  <p class="font-semibold text-slate-800">{{ item.nombreCompleto }}</p>
                  <p class="mt-0.5 text-xs text-slate-600">{{ item.codigoEmpleado }}</p>
                </td>
                <td
                  class="px-5 py-3.5 text-right tabular-nums"
                  :class="item.faltas ? 'font-bold text-red-600' : 'text-slate-500'"
                >
                  {{ item.faltas }}
                </td>
                <td class="px-5 py-3.5 text-right text-slate-600 tabular-nums">
                  {{ item.permisos }}
                </td>
                <td class="px-5 py-3.5 text-right text-slate-600 tabular-nums">
                  {{ item.suspensionIgss }}
                </td>
              </tr>
            </tbody>
            <tfoot class="border-t-2 border-slate-300 bg-[#e4f2f1] font-bold text-slate-800">
              <tr>
                <td class="px-5 py-3.5">Totales</td>
                <td class="px-5 py-3.5 text-right tabular-nums">{{ totals.faltas }}</td>
                <td class="px-5 py-3.5 text-right tabular-nums">{{ totals.permisos }}</td>
                <td class="px-5 py-3.5 text-right tabular-nums">{{ totals.suspensionIgss }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </template>
    </div>
  </section>

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

  <AbsenceRangeModal
    :open="rangeOpen"
    :employees="employeesQuery.data.value ?? []"
    :loading="rangeMutation.isPending.value"
    :server-error="rangeError"
    @close="rangeOpen = false"
    @submit="saveRange"
  />
  <EmployeeRecordsModal
    :open="recordsOpen"
    :employee-name="recordsEmployee.name"
    :period="summaryPeriod"
    :records="recordsQuery.data.value ?? []"
    :loading="recordsQuery.isPending.value"
    :deleting="deleteMutation.isPending.value"
    :server-error="recordsError"
    @close="recordsOpen = false"
    @delete="deleteRecord"
  />
  <ConfirmDialog
    :open="pendingDate !== null"
    title="Cambios sin guardar"
    :description="formatLongDate(selectedDate)"
    :message="`Tienes ${pendingChanges} ${pendingChanges === 1 ? 'cambio' : 'cambios'} sin guardar en este día. Si cambias de fecha se perderán.`"
    confirm-label="Descartar cambios"
    danger
    @close="pendingDate = null"
    @confirm="discardAndGo"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import AbsenceRangeModal from '@/modules/attendance/components/AbsenceRangeModal.vue'
import AttendanceStatusPicker from '@/modules/attendance/components/AttendanceStatusPicker.vue'
import EmployeeRecordsModal from '@/modules/attendance/components/EmployeeRecordsModal.vue'
import {
  useAttendanceEmployeesQuery,
  useAttendanceMutations,
  useDayQuery,
  useEmployeeRecordsQuery,
  useSummaryQuery,
} from '@/modules/attendance/composables/useAttendance'
import type {
  AbsenceFormValues,
  DayAttendanceRow,
} from '@/modules/attendance/types/attendance.types'
import { formatLongDate, toIsoDate, todayIso } from '@/modules/attendance/utils/attendance.format'

type Tab = 'day' | 'summary'

const tabs: { value: Tab; label: string }[] = [
  { value: 'day', label: 'Ausencias del día' },
  { value: 'summary', label: 'Resumen del mes' },
]
const today = todayIso()
const activeTab = ref<Tab>('day')
const selectedDate = ref(today)
const pendingDate = ref<string | null>(null)
const search = ref('')
const onlyExceptions = ref(true)
const rows = ref<DayAttendanceRow[]>([])
const originals = ref<Record<number, string>>({})
const notice = reactive<{ type: 'success' | 'error'; message: string }>({
  type: 'success',
  message: '',
})

const dayQuery = useDayQuery(selectedDate)
const { saveDayMutation, rangeMutation, deleteMutation } = useAttendanceMutations()

const signature = (row: DayAttendanceRow) =>
  `${row.estado}|${Number(row.horasExtra || 0)}|${(row.observacion ?? '').trim()}`
const isChanged = (row: DayAttendanceRow) => originals.value[row.idEmpleado] !== signature(row)
const pendingChanges = computed(() => rows.value.filter(isChanged).length)
const notes = reactive<Record<number, boolean>>({})
const isWeekend = computed(() => {
  const [year, month, day] = selectedDate.value.split('-').map(Number)
  const weekdayNumber = new Date(year ?? 2000, (month ?? 1) - 1, day ?? 1).getDay()
  return weekdayNumber === 0 || weekdayNumber === 6
})
const dayStatus = computed(() => {
  if (!rows.value.length || dayQuery.isPending.value) return null
  const absences = rows.value.filter((row) => row.estado !== 'PRESENTE').length
  if (absences)
    return {
      label: absences === 1 ? '1 ausencia' : `${absences} ausencias`,
      className: 'bg-amber-50 text-amber-800',
      title: 'Faltas, permisos y suspensiones de este día',
    }
  if (isWeekend.value)
    return {
      label: 'No laborable',
      className: 'bg-slate-100 text-slate-600',
      title: 'Fin de semana',
    }
  return null
})
const weekday = computed(() => {
  const [year, month, day] = selectedDate.value.split('-').map(Number)
  return new Intl.DateTimeFormat('es-GT', { weekday: 'long' }).format(
    new Date(year ?? 2000, (month ?? 1) - 1, day ?? 1),
  )
})
const filteredRows = computed(() => {
  const term = search.value.trim().toLocaleLowerCase()
  return rows.value.filter(
    (row) =>
      (!term ||
        `${row.codigoEmpleado} ${row.nombreCompleto} ${row.departamento}`
          .toLocaleLowerCase()
          .includes(term)) &&
      (!!term || !onlyExceptions.value || row.estado !== 'PRESENTE' || isChanged(row)),
  )
})

watch(() => dayQuery.data.value, loadRows, { immediate: true })

function loadRows(): void {
  for (const key of Object.keys(notes)) delete notes[Number(key)]
  rows.value = (dayQuery.data.value?.empleados ?? []).map((row) => ({
    ...row,
    horasExtra: Number(row.horasExtra ?? 0),
    observacion: row.observacion ?? '',
  }))
  originals.value = Object.fromEntries(rows.value.map((row) => [row.idEmpleado, signature(row)]))
}

function changeDate(value: string): void {
  if (!value || value === selectedDate.value) return
  if (value > today) value = today
  if (pendingChanges.value) {
    pendingDate.value = value
    return
  }
  selectedDate.value = value
}

function moveDay(offset: number): void {
  const [year, month, day] = selectedDate.value.split('-').map(Number)
  changeDate(toIsoDate(new Date(year ?? 2000, (month ?? 1) - 1, (day ?? 1) + offset)))
}

function discardAndGo(): void {
  if (pendingDate.value) selectedDate.value = pendingDate.value
  pendingDate.value = null
}

function onStatusChange(row: DayAttendanceRow): void {
  if (row.estado !== 'PRESENTE') row.horasExtra = 0
}

async function saveDay(): Promise<void> {
  const day = dayQuery.data.value
  if (!day) return
  notice.message = ''

  try {
    await saveDayMutation.mutateAsync({
      fecha: selectedDate.value,
      version: day.version,
      registros: rows.value.map((row) => ({
        idEmpleado: row.idEmpleado,
        estado: row.estado,
        horasExtra: row.estado === 'PRESENTE' ? Number(row.horasExtra || 0) : 0,
        observacion: (row.observacion ?? '').trim() || null,
      })),
    })
    showNotice(
      'success',
      `Asistencia del ${formatLongDate(selectedDate.value).toLowerCase()} guardada.`,
    )
  } catch (error) {
    showNotice('error', getErrorMessage(error))
  }
}

const rangeOpen = ref(false)
const rangeError = ref('')
const employeesQuery = useAttendanceEmployeesQuery(rangeOpen)

function openRange(): void {
  rangeError.value = ''
  rangeOpen.value = true
}

async function saveRange(values: AbsenceFormValues): Promise<void> {
  rangeError.value = ''
  try {
    const records = await rangeMutation.mutateAsync({
      idEmpleado: values.idEmpleado!,
      estado: values.estado,
      desde: values.desde,
      hasta: values.hasta,
      soloDiasHabiles: values.estado === 'SUSPENSION_IGSS' ? false : values.soloDiasHabiles,
      observacion: values.observacion || null,
    })
    rangeOpen.value = false
    showNotice(
      'success',
      `Se registraron ${records.length} ${records.length === 1 ? 'día' : 'días'} correctamente.`,
    )
  } catch (error) {
    rangeError.value = getErrorMessage(error)
  }
}

const summaryMonth = ref(today.slice(0, 7))
const summaryYear = computed(() => Number(summaryMonth.value.split('-')[0]))
const summaryMonthNumber = computed(() => Number(summaryMonth.value.split('-')[1]))
const summaryQuery = useSummaryQuery(
  summaryYear,
  summaryMonthNumber,
  () => activeTab.value === 'summary',
)
const summary = computed(() => summaryQuery.data.value ?? [])
const withAbsences = computed(() =>
  summary.value.filter((item) => item.faltas + item.permisos + item.suspensionIgss > 0),
)
const summaryPeriod = computed(() => {
  const name = new Intl.DateTimeFormat('es-GT', { month: 'long', year: 'numeric' }).format(
    new Date(summaryYear.value, summaryMonthNumber.value - 1, 1),
  )
  return name.charAt(0).toUpperCase() + name.slice(1)
})
const totals = computed(() =>
  summary.value.reduce(
    (sum, item) => ({
      faltas: sum.faltas + item.faltas,
      permisos: sum.permisos + item.permisos,
      suspensionIgss: sum.suspensionIgss + item.suspensionIgss,
    }),
    { faltas: 0, permisos: 0, suspensionIgss: 0 },
  ),
)

const recordsOpen = ref(false)
const recordsError = ref('')
const recordsEmployee = reactive({ id: 0, name: '' })
const recordsQuery = useEmployeeRecordsQuery(
  () => recordsEmployee.id,
  summaryYear,
  summaryMonthNumber,
  recordsOpen,
)

function openRecords(id: number, name: string): void {
  recordsEmployee.id = id
  recordsEmployee.name = name
  recordsError.value = ''
  recordsOpen.value = true
}

async function deleteRecord(id: number): Promise<void> {
  recordsError.value = ''
  try {
    await deleteMutation.mutateAsync(id)
  } catch (error) {
    recordsError.value = getErrorMessage(error)
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

function refetchDay(): void {
  void dayQuery.refetch()
}
</script>
