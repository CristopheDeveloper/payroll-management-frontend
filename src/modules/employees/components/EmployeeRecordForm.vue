<template>
  <form id="employee-record-form" novalidate @submit.prevent="submitForm">
    <div class="grid gap-x-8 gap-y-2.5 px-4 pb-4 sm:px-5 sm:pb-5 lg:grid-cols-2">
      <div :class="rowClass">
        <span :class="labelClass">Código</span>
        <p :class="readClass" class="font-semibold">
          {{ employee?.codigoEmpleado ?? 'Se asigna al salvar' }}
        </p>
      </div>
      <div :class="rowClass">
        <label for="emp-genero" :class="labelClass">Género</label>
        <select id="emp-genero" v-model="form.genero" :class="inputClass" class="cursor-pointer">
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
        </select>
      </div>
      <div :class="rowClass">
        <label for="emp-nombres" :class="labelClass">Nombres</label>
        <input id="emp-nombres" v-model="form.nombres" :class="inputClass" maxlength="100" />
      </div>
      <div :class="rowClass">
        <label for="emp-apellidos" :class="labelClass">Apellidos</label>
        <input id="emp-apellidos" v-model="form.apellidos" :class="inputClass" maxlength="100" />
      </div>
      <div :class="rowClass">
        <label for="emp-dpi" :class="labelClass">DPI</label>
        <input id="emp-dpi" :value="form.dpi" :class="inputClass" inputmode="numeric" pattern="[0-9]*"
          @input="onDpiInput" placeholder="13 dígitos" />
      </div>
      <div :class="rowClass">
        <label for="emp-puesto" :class="labelClass">Puesto</label>
        <select id="emp-puesto" v-model.number="form.idPuesto" :class="inputClass" class="cursor-pointer">
          <option :value="0" disabled>Selecciona un puesto</option>
          <option v-for="item in positionOptions" :key="item.id" :value="item.id">
            {{ item.nombre }}
          </option>
        </select>
      </div>
      <div :class="rowClass">
        <label for="emp-departamento" :class="labelClass">Departamento</label>
        <select id="emp-departamento" v-model.number="form.idDepartamento" :class="inputClass" class="cursor-pointer">
          <option :value="0" disabled>Selecciona un departamento</option>
          <option v-for="item in departmentOptions" :key="item.id" :value="item.id">
            {{ item.nombre }}
          </option>
        </select>
      </div>
      <div :class="rowClass">
        <label for="emp-ingreso" :class="labelClass">Fecha ingreso</label>
        <input v-if="!employee" id="emp-ingreso" v-model="form.fechaIngreso" type="date" :max="today"
          :class="inputClass" />
        <p v-else :class="readClass">{{ formatDate(lastPeriod?.fechaIngreso ?? null) }}</p>
      </div>
      <div v-if="employee" :class="rowClass">
        <span :class="labelClass">Fecha egreso</span>
        <p :class="readClass">
          {{ lastPeriod?.fechaBaja ? formatDate(lastPeriod.fechaBaja) : '—' }}
        </p>
      </div>
    </div>

    <slot name="tabs" />

    <div v-show="section === 'personal'" class="grid gap-x-8 gap-y-2.5 p-4 sm:p-5 lg:grid-cols-2">
      <div :class="rowClass">
        <label for="emp-nacimiento" :class="labelClass">Nacimiento</label>
        <input id="emp-nacimiento" v-model="form.fechaNacimiento" type="date" :max="today" :class="inputClass" />
      </div>
      <div :class="rowClass">
        <label for="emp-nit" :class="labelClass">NIT</label>
        <input id="emp-nit" v-model="form.nit" :class="inputClass" maxlength="15" @input="onNitInput" />
      </div>
      <div :class="rowClass">
        <label for="emp-igss" :class="labelClass">No. IGSS</label>
        <input id="emp-igss" v-model="form.numeroIgss" :class="inputClass" maxlength="20" inputmode="numeric" @input="soloDigitos($event, 'numeroIgss')" />
      </div>
      <div :class="rowClass">
        <label for="emp-pasaporte" :class="labelClass">Pasaporte</label>
        <input id="emp-pasaporte" v-model="form.pasaporte" :class="inputClass" maxlength="20" @input="onPasaporteInput" />
      </div>
      <div :class="rowClass">
        <label for="emp-telefono" :class="labelClass">Teléfono</label>
        <input id="emp-telefono" v-model="form.telefono" type="tel" :class="inputClass" maxlength="15" inputmode="numeric" @input="soloDigitos($event, 'telefono')" />
      </div>
      <div :class="rowClass">
        <label for="emp-correo" :class="labelClass">Correo</label>
        <input id="emp-correo" v-model="form.correo" type="email" :class="inputClass" maxlength="100" />
      </div>
      <div :class="rowClass" class="lg:col-span-2">
        <label for="emp-direccion" :class="labelClass">Dirección</label>
        <input id="emp-direccion" v-model="form.direccion" :class="inputClass" maxlength="200" />
      </div>
    </div>

    <div v-show="section === 'params'" class="grid gap-x-8 gap-y-2.5 p-4 sm:p-5 lg:grid-cols-2">
      <div :class="rowClass">
        <label for="emp-salario" :class="labelClass">Salario (Q)</label>
        <div>
          <input id="emp-salario" v-model.number="form.salario" type="number" min="0" step="0.01" :class="inputClass"
            class="text-right tabular-nums" @keydown="bloquearCaracteresNumericos" :aria-describedby="belowMinimum ? 'emp-salario-aviso' : undefined" />
          <p v-if="belowMinimum" id="emp-salario-aviso" class="mt-1 text-xs text-amber-700">
            Menor al salario mínimo ({{ formatMoney(minimumWageQuery.data.value) }}).
          </p>
        </div>
      </div>
      <div :class="rowClass">
        <label for="emp-isr" :class="labelClass">Retención ISR (Q)</label>
        <input id="emp-isr" v-model.number="form.retencionIsr" type="number" min="0" step="0.01" :class="inputClass" @keydown="bloquearCaracteresNumericos"
          class="text-right tabular-nums" />
      </div>
      <div :class="rowClass">
        <label for="emp-bonificacion" :class="labelClass" title="Bonificación incentivo">Bonificación (Q)</label>
        <input id="emp-bonificacion" v-model.number="form.bonificacionIncentivo" type="number" min="0" step="0.01"
          :class="inputClass" @keydown="bloquearCaracteresNumericos" class="text-right tabular-nums" />
      </div>
    </div>

    <div v-show="section === 'payment'" class="grid gap-x-8 gap-y-2.5 p-4 sm:p-5 lg:grid-cols-2">
      <div :class="rowClass">
        <label for="emp-pago" :class="labelClass">Forma de pago</label>
        <select id="emp-pago" v-model="form.tipoPago" :class="inputClass" class="cursor-pointer">
          <option v-for="(label, value) in paymentTypeLabels" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
      </div>
      <template v-if="form.tipoPago === 'TRANSFERENCIA'">
        <div :class="rowClass">
          <label for="emp-banco" :class="labelClass">Banco</label>
          <select id="emp-banco" v-model="form.banco" :class="inputClass" class="cursor-pointer">
            <option value="" disabled>Seleccione un banco</option>
            <option v-for="banco in BANCOS_GUATEMALA" :key="banco" :value="banco">
              {{ banco }}
            </option>
          </select>
        </div>
        <div :class="rowClass">
          <label for="emp-cuenta" :class="labelClass">Cuenta</label>
          <input id="emp-cuenta" v-model="form.cuentaBancaria" :class="inputClass" maxlength="30" inputmode="numeric" @input="soloDigitos($event, 'cuentaBancaria')" />
        </div>
      </template>
    </div>

    <slot />

    <p v-if="error || serverError"
      class="mx-4 mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 sm:mx-5" role="alert">
      {{ error || serverError }}
    </p>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  useDefaultBonusQuery,
  useMinimumWageQuery,
} from '@/modules/employees/composables/useEmployees'
import type {
  CreateEmployeeRequest,
  EmployeeDetail,
  PaymentType,
} from '@/modules/employees/types/employee.types'
import { BANCOS_GUATEMALA } from '../constants/banks'
import { paymentTypeLabels, todayIso } from '@/modules/employees/utils/employee.format'
import { formatDate, formatMoney } from '@/modules/payrolls/utils/payroll.format'

type Section = 'header' | 'personal' | 'params' | 'payment'
type CatalogItem = { id: number; nombre: string; activo: boolean }

const props = withDefaults(
  defineProps<{
    section: string
    employee?: EmployeeDetail | null
    positions: CatalogItem[]
    departments: CatalogItem[]
    serverError?: string
  }>(),
  { employee: null, serverError: '' },
)

const emit = defineEmits<{
  submit: [values: CreateEmployeeRequest]
  dirty: [value: boolean]
  invalid: [section: Section]
}>()

const rowClass = 'grid gap-1 sm:grid-cols-[8rem_1fr] sm:items-center sm:gap-3'
const labelClass = 'text-sm text-slate-600'
const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25'
const readClass = 'flex min-h-9 items-center text-sm text-slate-800'
const today = todayIso()

const form = reactive({
  nombres: '',
  apellidos: '',
  dpi: '',
  pasaporte: '',
  nit: '',
  numeroIgss: '',
  fechaNacimiento: '',
  genero: 'M' as 'M' | 'F',
  direccion: '',
  telefono: '',
  correo: '',
  tipoPago: 'TRANSFERENCIA' as PaymentType,
  banco: '',
  cuentaBancaria: '',
  idPuesto: 0,
  idDepartamento: 0,
  salario: '' as number | string,
  retencionIsr: 0 as number | string,
  bonificacionIncentivo: '' as number | string,
  fechaIngreso: today,
})
const error = ref('')
const snapshot = ref('')
const defaultBonusQuery = useDefaultBonusQuery(() => !props.employee)
const minimumWageQuery = useMinimumWageQuery()
const belowMinimum = computed(() => {
  const salary = Number(form.salario)
  const minimum = minimumWageQuery.data.value
  return minimum !== undefined && form.salario !== '' && salary > 0 && salary < minimum
})

const positionOptions = computed(() =>
  props.positions.filter((item) => item.activo || item.id === props.employee?.idPuesto),
)
const departmentOptions = computed(() =>
  props.departments.filter((item) => item.activo || item.id === props.employee?.idDepartamento),
)
const lastPeriod = computed(
  () =>
    [...(props.employee?.periodos ?? [])].sort((a, b) =>
      b.fechaIngreso.localeCompare(a.fechaIngreso),
    )[0] ?? null,
)
const dirty = computed(() => !!props.employee && JSON.stringify(values()) !== snapshot.value)

watch(dirty, (value) => emit('dirty', value))
watch(() => props.employee, reset, { immediate: true })
watch(
  () => defaultBonusQuery.data.value,
  (value) => {
    if (!props.employee && form.bonificacionIncentivo === '' && value !== undefined)
      form.bonificacionIncentivo = value
  },
  { immediate: true },
)

function reset(): void {
  error.value = ''
  const current = props.employee
  form.nombres = current?.nombres ?? ''
  form.apellidos = current?.apellidos ?? ''
  form.dpi = current?.dpi ?? ''
  form.pasaporte = current?.pasaporte ?? ''
  form.nit = current?.nit ?? ''
  form.numeroIgss = current?.numeroIgss ?? ''
  form.fechaNacimiento = current?.fechaNacimiento ?? ''
  form.genero = current?.genero ?? 'M'
  form.direccion = current?.direccion ?? ''
  form.telefono = current?.telefono ?? ''
  form.correo = current?.correo ?? ''
  form.tipoPago = current?.tipoPago ?? 'TRANSFERENCIA'
  form.banco = current?.banco ?? ''
  form.cuentaBancaria = current?.cuentaBancaria ?? ''
  form.idPuesto = current?.idPuesto ?? 0
  form.idDepartamento = current?.idDepartamento ?? 0
  form.salario = current?.salario ?? ''
  form.retencionIsr = current?.retencionIsr ?? 0
  form.bonificacionIncentivo = current?.bonificacionIncentivo ?? defaultBonusQuery.data.value ?? ''
  form.fechaIngreso = today
  snapshot.value = JSON.stringify(values())
}

function onDpiInput(event: Event): void {
  const input = event.target as HTMLInputElement
  const digits = input.value.replace(/\D/g, '').slice(0, 13)
  input.value = digits
  form.dpi = digits
}

function soloDigitos(event: Event, campo: 'numeroIgss' | 'telefono' | 'cuentaBancaria'): void {
  const input = event.target as HTMLInputElement
  const valor = input.value.replace(/\D/g, '')

  input.value = valor
  form[campo] = valor
}

function onPasaporteInput(event: Event): void {
  const input = event.target as HTMLInputElement
  const valor = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '')

  input.value = valor
  form.pasaporte = valor
}

function onNitInput(event: Event): void {
  const input = event.target as HTMLInputElement

  // Permite dígitos y una K únicamente al final.
  const limpio = input.value.toUpperCase().replace(/[^0-9K]/g, '')
  const numeros = limpio.replace(/K/g, '')
  const valor = (numeros + (limpio.endsWith('K') ? 'K' : '')).slice(0, 15)

  input.value = valor
  form.nit = valor
}

function bloquearCaracteresNumericos(event: KeyboardEvent): void {
  if (['e', 'E', '+', '-'].includes(event.key)) {
    event.preventDefault()
  }
}


function text(value: string): string | null {
  return value.trim() || null
}

function values(): CreateEmployeeRequest {
  const transfer = form.tipoPago === 'TRANSFERENCIA'
  return {
    nombres: form.nombres.trim(),
    apellidos: form.apellidos.trim(),
    dpi: form.dpi.trim(),
    pasaporte: text(form.pasaporte),
    nit: text(form.nit),
    numeroIgss: text(form.numeroIgss),
    fechaNacimiento: form.fechaNacimiento,
    genero: form.genero,
    direccion: form.direccion.trim(),
    telefono: text(form.telefono),
    correo: text(form.correo),
    tipoPago: form.tipoPago,
    banco: transfer ? text(form.banco) : null,
    cuentaBancaria: transfer ? text(form.cuentaBancaria) : null,
    idPuesto: form.idPuesto,
    idDepartamento: form.idDepartamento,
    salario: Number(form.salario || 0),
    retencionIsr: Number(form.retencionIsr || 0),
    bonificacionIncentivo: Number(form.bonificacionIncentivo || 0),
    fechaIngreso: form.fechaIngreso,
  }
}

function validate(data: CreateEmployeeRequest): { section: Section; message: string } | null {
  const at = (section: Section, message: string) => ({ section, message })
  if (!data.nombres) return at('header', 'Los nombres son obligatorios.')
  if (!data.apellidos) return at('header', 'Los apellidos son obligatorios.')
  if (!/^[0-9]{13}$/.test(data.dpi))
    return at('header', 'El DPI debe tener 13 dígitos, sin espacios ni guiones.')
  if (!data.idPuesto) return at('header', 'Selecciona el puesto.')
  if (!data.idDepartamento) return at('header', 'Selecciona el departamento.')
  if (!props.employee && !data.fechaIngreso)
    return at('header', 'La fecha de ingreso es obligatoria.')
  if (!props.employee && data.fechaIngreso > today)
    return at('header', 'La fecha de ingreso no puede ser futura.')
  if (!data.fechaNacimiento) return at('personal', 'La fecha de nacimiento es obligatoria.')
  if (data.fechaNacimiento >= today)
    return at('personal', 'La fecha de nacimiento debe ser anterior a hoy.')
  if (data.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo))
    return at('personal', 'El correo no tiene un formato válido.')
  if (!data.direccion) return at('personal', 'La dirección es obligatoria.')
  if (!(data.salario > 0 && data.salario <= 999999.99))
    return at('params', 'El salario debe estar entre 0.01 y 999,999.99.')
  if (data.retencionIsr < 0) return at('params', 'La retención de ISR no puede ser negativa.')
  if (data.retencionIsr >= data.salario)
    return at('params', 'La retención de ISR debe ser menor al salario.')
  if (form.bonificacionIncentivo === '')
    return at('params', 'La bonificación incentivo es obligatoria; puede ser 0.')
  if (!(data.bonificacionIncentivo >= 0 && data.bonificacionIncentivo <= 999999.99))
    return at('params', 'La bonificación incentivo debe estar entre 0 y 999,999.99.')
  if (data.tipoPago === 'TRANSFERENCIA' && (!data.banco || !data.cuentaBancaria))
    return at(
      'payment',
      'Para pagar por transferencia el banco y la cuenta bancaria son obligatorios.',
    )
  return null
}

function submitForm(): void {
  error.value = ''
  const data = values()
  const problem = validate(data)
  if (problem) {
    error.value = problem.message
    emit('invalid', problem.section)
    return
  }
  emit('submit', data)
}

defineExpose({ reset })
</script>
