<template>
  <form
    id="payroll-record-form"
    class="grid gap-x-8 gap-y-2.5 lg:grid-cols-2"
    novalidate
    @submit.prevent="submitForm"
  >
    <div v-if="codeEditable" :class="rowClass">
      <label for="record-code" :class="labelClass">Planilla</label>
      <input
        v-if="codeEditable"
        id="record-code"
        v-model="form.codigo"
        :class="inputClass"
        class="uppercase"
        maxlength="30"
        @input="edited.codigo = true"
      />
      <p v-else :class="readClass" class="font-semibold">{{ payroll?.codigo }}</p>
    </div>

    <div :class="rowClass">
      <span :class="labelClass">Período</span>
      <div v-if="isNew" class="grid grid-cols-[1fr_6rem] gap-2">
        <select
          v-model.number="form.mes"
          :class="inputClass"
          class="cursor-pointer"
          aria-label="Mes"
        >
          <option
            v-for="month in months"
            :key="month.value"
            :value="month.value"
            :disabled="!available(form.anio, month.value)"
          >
            {{ month.label
            }}{{ sameMonth(form.anio, month.value).length ? ' (ya tiene planilla)' : '' }}
          </option>
        </select>
        <input
          v-model.number="form.anio"
          type="number"
          :min="minYear"
          :max="maxYear"
          step="1"
          inputmode="numeric"
          :class="inputClass"
          class="tabular-nums"
          aria-label="Año"
        />
      </div>
      <p v-else :class="readClass">
        del {{ formatDate(payroll?.fechaInicio ?? null) }} al
        {{ formatDate(payroll?.fechaFin ?? null) }}
      </p>
    </div>

    <div :class="rowClass">
      <label for="record-type" :class="labelClass">Tipo</label>
      <select
        v-if="isNew"
        id="record-type"
        v-model.number="form.idTipoPlanilla"
        :class="inputClass"
        class="cursor-pointer"
      >
        <option v-for="type in activeTypes" :key="type.idTipoPlanilla" :value="type.idTipoPlanilla">
          {{ type.nombre }}
        </option>
      </select>
      <p v-else :class="readClass">{{ payroll?.nombreTipoPlanilla }}</p>
    </div>

    <p
      v-if="isNew && !validYear(form.anio)"
      class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 lg:col-span-2"
      role="status"
    >
      Escribe un año entre {{ minYear }} y {{ maxYear }}.
    </p>

    <p
      v-if="isNew && sameMonth(form.anio, form.mes).length"
      class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 lg:col-span-2"
    >
      {{
        sameMonth(form.anio, form.mes).length === 1 ? 'Hay otra planilla' : 'Hay otras planillas'
      }}
      para este mes: {{ sameMonth(form.anio, form.mes).join(', ') }}.
    </p>

    <div :class="rowClass" class="lg:col-span-2">
      <label for="record-description" :class="labelClass">Descripción</label>
      <input
        v-if="editable"
        id="record-description"
        v-model="form.descripcion"
        :class="inputClass"
        maxlength="150"
        @input="edited.descripcion = true"
      />
      <p v-else :class="readClass">{{ payroll?.descripcion }}</p>
    </div>

    <div v-if="editable || payroll?.comentario" :class="rowClass" class="lg:col-span-2">
      <label for="record-comment" :class="labelClass">Comentario</label>
      <input
        v-if="editable"
        id="record-comment"
        v-model="form.comentario"
        :class="inputClass"
        maxlength="250"
      />
      <p v-else :class="readClass">{{ payroll?.comentario }}</p>
    </div>

    <p
      v-if="error || serverError"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 lg:col-span-2"
      role="alert"
    >
      {{ error || serverError }}
    </p>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type {
  CreatePayrollRequest,
  EditPayrollRequest,
  Payroll,
  PayrollType,
} from '@/modules/payrolls/types/payroll.types'
import { formatDate, formatPeriod } from '@/modules/payrolls/utils/payroll.format'

const props = withDefaults(
  defineProps<{
    payroll?: Payroll | null
    types?: PayrollType[]
    existing?: Payroll[]
    editable?: boolean
    serverError?: string
  }>(),
  { payroll: null, types: () => [], existing: () => [], editable: false, serverError: '' },
)

const emit = defineEmits<{
  create: [values: CreatePayrollRequest]
  save: [values: EditPayrollRequest]
  dirty: [value: boolean]
}>()

const rowClass = 'grid gap-1 sm:grid-cols-[7rem_1fr] sm:items-center sm:gap-3'
const labelClass = 'text-sm text-slate-600'
const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25'
const readClass = 'flex min-h-9 items-center text-sm text-slate-800'
const today = new Date()
const minYear = 2000
const maxYear = today.getFullYear() + 1
const months = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: formatPeriod(2000, index + 1).replace(' 2000', ''),
}))

const form = reactive({
  idTipoPlanilla: 0,
  anio: today.getFullYear(),
  mes: today.getMonth() + 1,
  codigo: '',
  descripcion: '',
  comentario: '',
})
const edited = reactive({ codigo: false, descripcion: false })
const error = ref('')

const isNew = computed(() => !props.payroll)
const codeEditable = computed(
  () => props.editable && (isNew.value || props.payroll?.estado === 'CREADA'),
)
const activeTypes = computed(() => props.types.filter((type) => type.activo))
const dirty = computed(() => {
  const current = props.payroll
  if (!current || !props.editable) return false
  return (
    form.codigo.trim().toUpperCase() !== current.codigo ||
    form.descripcion.trim() !== current.descripcion ||
    form.comentario.trim() !== (current.comentario ?? '')
  )
})

watch(dirty, (value) => emit('dirty', value))
watch(() => props.payroll, reset, { immediate: true })
watch(activeTypes, () => {
  if (isNew.value && !form.idTipoPlanilla) {
    form.idTipoPlanilla = activeTypes.value[0]?.idTipoPlanilla ?? 0
    pickFreeMonth()
  }
})
watch(() => props.existing, pickFreeMonth)
watch(() => form.idTipoPlanilla, pickFreeMonth)
watch(() => [form.anio, form.mes, form.idTipoPlanilla, props.existing], suggest)

function sameMonth(year: number, month: number): string[] {
  return props.existing
    .filter(
      (item) =>
        item.idTipoPlanilla === form.idTipoPlanilla && item.anio === year && item.mes === month,
    )
    .map((item) => item.codigo)
}

function monthKey(year: number, month: number): number {
  return year * 12 + month - 1
}

function validYear(year: number): boolean {
  return Number.isInteger(year) && year >= minYear && year <= maxYear
}

function available(year: number, month: number): boolean {
  if (!validYear(year)) return false
  return monthKey(year, month) <= monthKey(today.getFullYear(), today.getMonth() + 2)
}

function pickFreeMonth(): void {
  if (
    !isNew.value ||
    !validYear(form.anio) ||
    (available(form.anio, form.mes) && !sameMonth(form.anio, form.mes).length)
  )
    return
  const current = monthKey(form.anio, form.mes)
  const candidates = [...Array(24).keys()]
    .flatMap((offset) => [current + offset, current - offset])
    .filter((key) => key >= monthKey(minYear, 1) && key <= monthKey(maxYear, 12))
  const free =
    candidates.find((key) => {
      const year = Math.floor(key / 12)
      const month = (key % 12) + 1
      return available(year, month) && !sameMonth(year, month).length
    }) ?? candidates.find((key) => available(Math.floor(key / 12), (key % 12) + 1))
  if (free === undefined) return
  form.anio = Math.floor(free / 12)
  form.mes = (free % 12) + 1
}

function reset(): void {
  error.value = ''
  const current = props.payroll
  if (current) {
    form.codigo = current.codigo
    form.descripcion = current.descripcion
    form.comentario = current.comentario ?? ''
    return
  }
  form.idTipoPlanilla = activeTypes.value[0]?.idTipoPlanilla ?? 0
  edited.codigo = false
  edited.descripcion = false
  form.anio = today.getFullYear()
  form.mes = today.getMonth() + 1
  pickFreeMonth()
  suggest()
}

function suggest(): void {
  if (!isNew.value || !validYear(form.anio)) return
  const month = String(form.mes).padStart(2, '0')
  const prefix =
    activeTypes.value.find((type) => type.idTipoPlanilla === form.idTipoPlanilla)?.codigo ===
    'MENSUAL'
      ? 'MEN'
      : 'PLA'
  const monthName = formatPeriod(form.anio, form.mes).toLocaleLowerCase()
  const base = `${prefix}-${form.anio}-${month}`
  const taken = new Set(props.existing.map((item) => item.codigo))
  let code = base
  for (let number = 2; taken.has(code); number++) code = `${base}-${number}`
  if (!edited.codigo) form.codigo = code
  if (!edited.descripcion) form.descripcion = `Salario correspondiente al mes de ${monthName}`
}

function submitForm(): void {
  error.value = ''
  const codigo = form.codigo.trim().toUpperCase()
  if (isNew.value && !form.idTipoPlanilla) error.value = 'Selecciona el tipo de planilla.'
  else if (isNew.value && !validYear(form.anio))
    error.value = `El año debe estar entre ${minYear} y ${maxYear}.`
  else if (isNew.value && !available(form.anio, form.mes))
    error.value = 'Solo se pueden crear planillas hasta el mes siguiente.'
  else if (!codigo) error.value = 'El código es obligatorio.'
  else if (!/^[A-Z0-9_-]+$/.test(codigo))
    error.value = 'El código solo puede tener letras sin tilde, números, guion y guion bajo.'
  else if (!form.descripcion.trim()) error.value = 'La descripción es obligatoria.'
  if (error.value) return

  form.codigo = codigo
  const common = {
    codigo,
    descripcion: form.descripcion.trim(),
    comentario: form.comentario.trim() || null,
  }
  if (props.payroll) emit('save', { ...common, fechaPago: props.payroll.fechaPago.slice(0, 10) })
  else
    emit('create', {
      ...common,
      fechaPago: null,
      idTipoPlanilla: form.idTipoPlanilla,
      anio: form.anio,
      mes: form.mes,
    })
}

defineExpose({ reset })
</script>
