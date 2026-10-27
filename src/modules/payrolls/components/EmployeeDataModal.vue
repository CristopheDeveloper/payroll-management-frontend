<template>
  <BaseModal
    :open="open"
    :title="`Datos por empleado · ${payrollCode}`"
    size="xl"
    fit-screen
    tinted
    :close-on-backdrop="!saving"
    @close="close"
  >
    <div class="grid min-h-0 flex-1 gap-4 lg:grid-cols-[17rem_1fr]">
      <aside class="flex min-h-0 flex-col gap-2">
        <input
          v-model="search"
          type="search"
          class="bg-white h-10 shrink-0 rounded-xl border border-[#a7dbd8] px-3.5 text-sm outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
          placeholder="Buscar empleado..."
          aria-label="Buscar empleado"
        />
        <ul
          class="max-h-40 min-h-0 flex-1 overflow-y-auto rounded-xl border border-slate-300 bg-white py-1 lg:max-h-none"
          role="listbox"
          aria-label="Empleados"
        >
          <li
            v-for="row in filteredEmployees"
            :key="row.idEmpleado"
            role="option"
            :aria-selected="selectedId === row.idEmpleado"
            class="cursor-pointer px-3.5 py-2 text-sm transition"
            :class="
              selectedId === row.idEmpleado
                ? 'bg-[#245f69] text-white'
                : 'text-slate-700 hover:bg-slate-50'
            "
            @click="select(row.idEmpleado)"
          >
            <span class="block truncate font-semibold">{{ row.nombreCompleto }}</span>
            <span
              class="block truncate text-xs"
              :class="selectedId === row.idEmpleado ? 'text-white/75' : 'text-slate-600'"
              >{{ row.codigoEmpleado }} · {{ row.nombreDepartamento }}</span
            >
          </li>
          <li v-if="!filteredEmployees.length" class="px-3.5 py-3 text-sm text-slate-600">
            Ningún empleado coincide.
          </li>
        </ul>
      </aside>

      <section v-if="employee" class="flex min-h-0 flex-col gap-3">
        <header class="flex shrink-0 flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-bold text-slate-900">
              {{ employee.nombreCompleto }}
              <span class="ml-1 text-sm font-medium text-slate-600">{{
                employee.codigoEmpleado
              }}</span>
            </h3>
            <p class="text-sm text-slate-600">
              {{ employee.nombrePuesto }} · {{ employee.nombreDepartamento }} · Salario
              {{ formatMoney(employee.salario) }}
            </p>
            <p class="text-sm text-slate-600">{{ attendanceText }}</p>
          </div>
          <div class="flex items-center gap-1">
            <button
              type="button"
              :class="navButton"
              :disabled="currentIndex <= 0"
              aria-label="Empleado anterior"
              title="Empleado anterior"
              @click="move(-1)"
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
            <span class="px-1 text-xs text-slate-600 tabular-nums"
              >{{ currentIndex + 1 }} de {{ filteredEmployees.length }}</span
            >
            <button
              type="button"
              :class="navButton"
              :disabled="currentIndex < 0 || currentIndex >= filteredEmployees.length - 1"
              aria-label="Empleado siguiente"
              title="Empleado siguiente"
              @click="move(1)"
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
          </div>
        </header>

        <p v-if="!editable" class="shrink-0 text-sm text-slate-600">
          Solo lectura. La planilla está {{ statusLabel?.toLowerCase() }}.
        </p>
        <p v-else-if="blocked" class="shrink-0 text-sm font-semibold text-amber-700" role="alert">
          Salva o descarta los cambios antes de cambiar de empleado.
        </p>

        <div class="min-h-0 flex-1 overflow-auto rounded-xl border border-slate-300 bg-white">
          <div class="divide-y divide-slate-200 text-sm">
            <div
              v-for="field in visibleMonthFields"
              :key="field.key"
              class="flex items-center justify-between gap-4 px-4 py-2"
            >
              <div>
                <span class="font-medium text-slate-800">{{ field.label }}</span>
                <span v-if="field.reference" class="ml-2 text-xs text-slate-600">{{
                  field.reference
                }}</span>
              </div>
              <input
                v-if="editable"
                v-model.number="form[field.key]"
                type="number"
                min="0"
                :max="field.key === 'diasPagar' ? employee.diasPeriodo : undefined"
                :step="field.step"
                placeholder="0"
                class="h-8 w-32 shrink-0 rounded-lg border border-[#a7dbd8] px-2 text-right text-sm tabular-nums outline-none placeholder:text-slate-300 focus:border-[#69d2e7] focus:ring-2 focus:ring-[#69d2e7]/25"
                :aria-label="field.label"
              />
              <span v-else class="font-semibold text-slate-800 tabular-nums">{{
                field.key === 'diasPagar' ? form[field.key] : amountText(form[field.key])
              }}</span>
            </div>

            <template v-for="group in visibleGroups" :key="group.type">
              <div
                class="bg-[#e4f2f1] px-4 py-1.5 text-xs font-bold tracking-wider text-[#245f69] uppercase"
              >
                {{ group.title }}
              </div>
              <div
                v-for="concept in group.concepts"
                :key="concept.idRubro"
                class="flex items-center justify-between gap-4 px-4 py-2"
              >
                <div class="min-w-0 flex-1">
                  <span class="font-medium text-slate-800">{{ concept.nombre }}</span>
                  <span v-if="!concept.activo" class="ml-1 text-xs text-slate-600">(inactivo)</span>
                  <input
                    v-if="editable && hasAmount(concept.idRubro)"
                    v-model="values[concept.idRubro]!.descripcion"
                    maxlength="200"
                    placeholder="Descripción (opcional)"
                    class="mt-1 block h-8 w-full max-w-md rounded-lg border border-slate-300 px-2 text-sm outline-none placeholder:text-slate-300 focus:border-[#69d2e7] focus:ring-2 focus:ring-[#69d2e7]/25"
                    :aria-label="`Descripción de ${concept.nombre}`"
                  />
                  <span
                    v-else-if="!editable && values[concept.idRubro]?.descripcion"
                    class="ml-2 text-xs text-slate-600"
                    >{{ values[concept.idRubro]?.descripcion }}</span
                  >
                </div>
                <input
                  v-if="editable"
                  v-model.number="values[concept.idRubro]!.monto"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  class="h-8 w-32 shrink-0 rounded-lg border border-[#a7dbd8] px-2 text-right text-sm tabular-nums outline-none placeholder:text-slate-300 focus:border-[#69d2e7] focus:ring-2 focus:ring-[#69d2e7]/25"
                  :aria-label="`Monto de ${concept.nombre}`"
                />
                <span
                  v-else
                  class="font-semibold tabular-nums"
                  :class="group.type === 'DESCUENTO' ? 'text-red-600' : 'text-slate-800'"
                  >{{ amountText(values[concept.idRubro]?.monto) }}</span
                >
              </div>
            </template>
            <p v-if="!editable && !visibleGroups.length" class="px-4 py-3 text-sm text-slate-600">
              Sin bonos ni descuentos este mes.
            </p>
          </div>
        </div>

        <div
          v-if="employee.rubros.length"
          class="flex shrink-0 flex-wrap items-baseline justify-end gap-x-6 gap-y-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm"
        >
          <span class="mr-auto font-semibold text-slate-700">Resultado</span>
          <span
            >Ingresos
            <strong class="tabular-nums">{{ formatAmount(employee.totalIngresos) }}</strong></span
          >
          <span
            >Descuentos
            <strong class="text-red-600 tabular-nums"
              >−{{ formatAmount(employee.totalDescuentos) }}</strong
            ></span
          >
          <span
            >Líquido
            <strong class="text-base tabular-nums">{{
              formatAmount(employee.liquido)
            }}</strong></span
          >
        </div>
      </section>
    </div>

    <p
      v-if="error || serverError"
      class="mt-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ error || serverError }}
    </p>

    <template #footer>
      <span v-if="dirty" class="mr-auto self-center text-sm text-slate-600"
        >Cambios sin salvar</span
      >
      <button
        v-if="editable && dirty"
        type="button"
        class="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        :disabled="saving"
        @click="load"
      >
        Descartar
      </button>
      <button
        type="button"
        class="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        :disabled="saving"
        @click="close"
      >
        Cerrar
      </button>
      <button
        v-if="editable"
        type="button"
        class="cursor-pointer rounded-lg bg-[#fa6900] px-5 py-2.5 text-sm font-bold text-[#202f33] transition hover:bg-[#f38630] disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!dirty || saving"
        @click="submitForm"
      >
        {{ saving ? 'Salvando...' : 'Salvar' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import type {
  PayrollConcept,
  PayrollEmployee,
  SaveEmployeeDataRequest,
} from '@/modules/payrolls/types/payroll.types'
import { formatAmount, formatMoney } from '@/modules/payrolls/utils/payroll.format'

type MonthField = 'diasPagar' | 'horasExtra' | 'isr'

const props = withDefaults(
  defineProps<{
    open: boolean
    payrollCode: string
    employees: PayrollEmployee[]
    initialEmployeeId?: number | null
    concepts: PayrollConcept[]
    editable: boolean
    statusLabel?: string
    saving?: boolean
    serverError?: string
  }>(),
  { initialEmployeeId: null, saving: false, serverError: '' },
)

const emit = defineEmits<{
  close: []
  submit: [idEmpleado: number, values: SaveEmployeeDataRequest]
}>()

const search = ref('')
const selectedId = ref<number | null>(null)
const blocked = ref(false)
const error = ref('')
const form = reactive<Record<MonthField, number | string>>({
  diasPagar: 0,
  horasExtra: '',
  isr: '',
})
const values = reactive<Record<number, { monto: number | string; descripcion: string }>>({})

const employee = computed(
  () => props.employees.find((row) => row.idEmpleado === selectedId.value) ?? null,
)
const filteredEmployees = computed(() => {
  const term = search.value.trim().toLocaleLowerCase()
  return props.employees.filter(
    (row) =>
      !term ||
      `${row.codigoEmpleado} ${row.nombreCompleto} ${row.nombreDepartamento}`
        .toLocaleLowerCase()
        .includes(term),
  )
})
const monthFields = computed(() => {
  const row = employee.value
  if (!row) return []
  return [
    {
      key: 'diasPagar' as const,
      label: 'Días trabajados',
      reference: '',
      step: 1,
    },
    {
      key: 'horasExtra' as const,
      label: 'Horas extra',
      reference: '',
      step: 0.25,
    },
    {
      key: 'isr' as const,
      label: 'ISR',
      reference: '',
      step: 0.01,
    },
  ]
})
const visibleConcepts = computed(() =>
  props.concepts.filter(
    (concept) =>
      concept.activo || employee.value?.valores.some((value) => value.idRubro === concept.idRubro),
  ),
)
const groups = computed(() =>
  [
    { type: 'INGRESO', title: 'Ingresos' },
    { type: 'DESCUENTO', title: 'Descuentos' },
  ].map((group) => ({
    ...group,
    concepts: visibleConcepts.value.filter((concept) => concept.tipo === group.type),
  })),
)
const navButton =
  'grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35'
const visibleMonthFields = computed(() =>
  monthFields.value.filter(
    (field) => props.editable || field.key === 'diasPagar' || Number(form[field.key] || 0) !== 0,
  ),
)
const visibleGroups = computed(() =>
  groups.value
    .map((group) => ({
      ...group,
      concepts: props.editable
        ? group.concepts
        : group.concepts.filter((concept) => Number(values[concept.idRubro]?.monto || 0) !== 0),
    }))
    .filter((group) => group.concepts.length),
)
const attendanceText = computed(() => {
  const row = employee.value
  if (!row) return ''
  const parts = [`Asistencia: ${row.diasPagarSugeridos} de ${row.diasPeriodo} días`]
  if (row.diasFalta) parts.push(row.diasFalta === 1 ? '1 falta' : `${row.diasFalta} faltas`)
  if (row.diasSuspension)
    parts.push(
      row.diasSuspension === 1 ? '1 día de suspensión' : `${row.diasSuspension} días de suspensión`,
    )
  return parts.join(' · ')
})
const currentIndex = computed(() =>
  filteredEmployees.value.findIndex((row) => row.idEmpleado === selectedId.value),
)
const dirty = computed(() => {
  const row = employee.value
  if (!row || !props.editable) return false
  if (
    Number(form.diasPagar) !== row.diasPagar ||
    Number(form.horasExtra) !== row.horasExtra ||
    Number(form.isr) !== row.isr
  )
    return true
  return props.concepts.some((concept) => {
    const saved = row.valores.find((value) => value.idRubro === concept.idRubro)
    const draft = values[concept.idRubro]
    if (!draft) return false
    return (
      Number(draft.monto || 0) !== (saved?.monto ?? 0) ||
      draft.descripcion.trim() !== (saved?.descripcion ?? '')
    )
  })
})

watch(
  () => props.open,
  (open) => {
    if (!open) return
    search.value = ''
    blocked.value = false
    selectedId.value = props.initialEmployeeId ?? props.employees[0]?.idEmpleado ?? null
    load()
  },
  { immediate: true },
)
watch(() => [props.employees, props.concepts], load)

function select(id: number): void {
  if (id === selectedId.value) return
  if (dirty.value) {
    blocked.value = true
    return
  }
  selectedId.value = id
  load()
}

function move(offset: number): void {
  const next = filteredEmployees.value[currentIndex.value + offset]
  if (next) select(next.idEmpleado)
}

function hasAmount(idRubro: number): boolean {
  const value = values[idRubro]
  return Number(value?.monto || 0) !== 0 || !!value?.descripcion.trim()
}

function amountText(value: number | string | undefined): string {
  return Number(value || 0) === 0 ? '' : formatAmount(Number(value))
}

function load(): void {
  blocked.value = false
  error.value = ''
  const row = employee.value
  if (!row) return
  form.diasPagar = row.diasPagar
  form.horasExtra = row.horasExtra || ''
  form.isr = row.isr || ''
  for (const key of Object.keys(values)) delete values[Number(key)]
  for (const concept of props.concepts) {
    const saved = row.valores.find((value) => value.idRubro === concept.idRubro)
    values[concept.idRubro] = { monto: saved?.monto || '', descripcion: saved?.descripcion ?? '' }
  }
}

function submitForm(): void {
  error.value = ''
  const row = employee.value
  if (!row) return
  const days = Number(form.diasPagar)
  const hours = Number(form.horasExtra)
  const isr = Number(form.isr)
  if (!Number.isInteger(days) || days < 0 || days > row.diasPeriodo)
    error.value = `Los días trabajados deben ser un número entero entre 0 y ${row.diasPeriodo}.`
  else if (!(hours >= 0 && hours <= 999.99))
    error.value = 'Las horas extra deben estar entre 0 y 999.99.'
  else if (!(isr >= 0)) error.value = 'El ISR no puede ser negativo.'
  if (error.value) return

  const list = Object.entries(values)
    .map(([id, value]) => ({
      idRubro: Number(id),
      monto: Number(value.monto || 0),
      descripcion: value.descripcion.trim() || null,
    }))
    .filter((value) => value.monto !== 0)
  if (list.some((value) => !(value.monto > 0 && value.monto <= 999999.99))) {
    error.value = 'Los montos deben estar entre 0 y 999,999.99.'
    return
  }

  emit('submit', row.idEmpleado, { diasPagar: days, horasExtra: hours, isr, valores: list })
}

function close(): void {
  load()
  emit('close')
}
</script>
