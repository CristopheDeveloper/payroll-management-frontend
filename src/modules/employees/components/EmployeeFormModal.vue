<template>
  <BaseModal
    :open="open"
    :title="mode === 'create' ? 'Registrar empleado' : 'Editar empleado'"
    :description="mode === 'create'
      ? 'Ingresa los datos personales, laborales y salariales.'
      : 'Actualiza la información del empleado.'"
    size="lg"
    :close-on-backdrop="!loading"
    @close="$emit('close')"
  >
    <form
      id="employee-form"
      class="grid gap-4 md:grid-cols-2"
      novalidate
      @submit.prevent="submitForm"
    >
      <div class="grid gap-2">
        <label for="emp-nombres" class="text-sm font-semibold text-slate-700">Nombres *</label>
        <input id="emp-nombres" v-model.trim="form.nombres" maxlength="100" required class="field" />
        <p v-if="errors.nombres" class="text-xs text-red-600">{{ errors.nombres }}</p>
      </div>

      <div class="grid gap-2">
        <label for="emp-apellidos" class="text-sm font-semibold text-slate-700">Apellidos *</label>
        <input id="emp-apellidos" v-model.trim="form.apellidos" maxlength="100" required class="field" />
        <p v-if="errors.apellidos" class="text-xs text-red-600">{{ errors.apellidos }}</p>
      </div>

      <div class="grid gap-2">
        <label for="emp-dpi" class="text-sm font-semibold text-slate-700">DPI *</label>
        <input id="emp-dpi" v-model.trim="form.dpi" maxlength="13" required inputmode="numeric" placeholder="13 dígitos" class="field" />
        <p v-if="errors.dpi" class="text-xs text-red-600">{{ errors.dpi }}</p>
      </div>

      <div class="grid gap-2">
        <label for="emp-pasaporte" class="text-sm font-semibold text-slate-700">Pasaporte</label>
        <input id="emp-pasaporte" v-model.trim="form.pasaporte" maxlength="20" class="field" />
      </div>

      <div class="grid gap-2">
        <label for="emp-nit" class="text-sm font-semibold text-slate-700">NIT</label>
        <input id="emp-nit" v-model.trim="form.nit" maxlength="15" class="field" />
      </div>

      <div class="grid gap-2">
        <label for="emp-igss" class="text-sm font-semibold text-slate-700">Número de IGSS</label>
        <input id="emp-igss" v-model.trim="form.numeroIgss" maxlength="20" class="field" />
      </div>

      <div class="grid gap-2">
        <label for="emp-nacimiento" class="text-sm font-semibold text-slate-700">Fecha de nacimiento *</label>
        <input id="emp-nacimiento" v-model="form.fechaNacimiento" type="date" required class="field" />
        <p v-if="errors.fechaNacimiento" class="text-xs text-red-600">{{ errors.fechaNacimiento }}</p>
      </div>

      <div class="grid gap-2">
        <label for="emp-genero" class="text-sm font-semibold text-slate-700">Género *</label>
        <select id="emp-genero" v-model="form.genero" required class="field">
          <option value="" disabled>Selecciona</option>
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
        </select>
        <p v-if="errors.genero" class="text-xs text-red-600">{{ errors.genero }}</p>
      </div>

      <div class="grid gap-2 md:col-span-2">
        <label for="emp-direccion" class="text-sm font-semibold text-slate-700">Dirección *</label>
        <input id="emp-direccion" v-model.trim="form.direccion" maxlength="200" required class="field" />
        <p v-if="errors.direccion" class="text-xs text-red-600">{{ errors.direccion }}</p>
      </div>

      <div class="grid gap-2">
        <label for="emp-telefono" class="text-sm font-semibold text-slate-700">Teléfono</label>
        <input id="emp-telefono" v-model.trim="form.telefono" maxlength="15" class="field" />
      </div>

      <div class="grid gap-2">
        <label for="emp-correo" class="text-sm font-semibold text-slate-700">Correo</label>
        <input id="emp-correo" v-model.trim="form.correo" type="email" maxlength="100" class="field" />
      </div>

      <div class="grid gap-2">
        <label for="emp-departamento" class="text-sm font-semibold text-slate-700">Departamento *</label>
        <select id="emp-departamento" v-model.number="form.idDepartamento" required class="field">
          <option :value="0" disabled>Selecciona un departamento</option>
          <option v-for="department in departments" :key="department.idDepartamento" :value="department.idDepartamento">
            {{ department.nombre }}
          </option>
        </select>
        <p v-if="errors.idDepartamento" class="text-xs text-red-600">{{ errors.idDepartamento }}</p>
      </div>

      <div class="grid gap-2">
        <label for="emp-puesto" class="text-sm font-semibold text-slate-700">Puesto *</label>
        <select id="emp-puesto" v-model.number="form.idPuesto" required class="field">
          <option :value="0" disabled>Selecciona un puesto</option>
          <option v-for="position in positions" :key="position.idPuesto" :value="position.idPuesto">
            {{ position.nombre }}
          </option>
        </select>
        <p v-if="errors.idPuesto" class="text-xs text-red-600">{{ errors.idPuesto }}</p>
      </div>

      <div class="grid gap-2">
        <label for="emp-salario" class="text-sm font-semibold text-slate-700">Salario *</label>
        <input id="emp-salario" v-model.number="form.salario" type="number" min="0.01" max="999999.99" step="0.01" required class="field" />
        <p v-if="errors.salario" class="text-xs text-red-600">{{ errors.salario }}</p>
      </div>

      <div class="grid gap-2">
        <label for="emp-isr" class="text-sm font-semibold text-slate-700">Retención ISR *</label>
        <input id="emp-isr" v-model.number="form.retencionIsr" type="number" min="0" max="999999.99" step="0.01" required class="field" />
        <p v-if="errors.retencionIsr" class="text-xs text-red-600">{{ errors.retencionIsr }}</p>
      </div>

      <div class="grid gap-2">
        <label for="emp-tipopago" class="text-sm font-semibold text-slate-700">Forma de pago *</label>
        <select id="emp-tipopago" v-model="form.tipoPago" required class="field">
          <option value="" disabled>Selecciona la forma de pago</option>
          <option value="EFECTIVO">Efectivo</option>
          <option value="CHEQUE">Cheque</option>
          <option value="TRANSFERENCIA">Transferencia</option>
        </select>
        <p v-if="errors.tipoPago" class="text-xs text-red-600">{{ errors.tipoPago }}</p>
      </div>

      <div class="grid gap-2">
        <label for="emp-banco" class="text-sm font-semibold text-slate-700">Banco</label>
        <input id="emp-banco" v-model.trim="form.banco" maxlength="50" class="field" />
      </div>

      <div class="grid gap-2">
        <label for="emp-cuenta" class="text-sm font-semibold text-slate-700">Cuenta bancaria</label>
        <input id="emp-cuenta" v-model.trim="form.cuentaBancaria" maxlength="30" class="field" />
      </div>

      <div v-if="mode === 'create'" class="grid gap-2">
        <label for="emp-ingreso" class="text-sm font-semibold text-slate-700">Fecha de ingreso *</label>
        <input id="emp-ingreso" v-model="form.fechaIngreso" type="date" required class="field" />
        <p v-if="errors.fechaIngreso" class="text-xs text-red-600">{{ errors.fechaIngreso }}</p>
      </div>

      <p v-if="serverError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2" role="alert">
        {{ serverError }}
      </p>
    </form>

    <template #footer>
      <button type="button" class="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60" :disabled="loading" @click="$emit('close')">
        Cancelar
      </button>
      <button form="employee-form" type="submit" class="rounded-lg bg-[#fa6900] px-5 py-2.5 text-sm font-bold text-[#202f33] hover:bg-[#f38630] disabled:opacity-60" :disabled="loading">
        {{ loading ? 'Guardando...' : mode === 'create' ? 'Registrar empleado' : 'Guardar cambios' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import type {
  EmployeeDetail,
  EmployeePayload,
  CreateEmployeePayload,
  Department,
  Position,
} from '@/modules/employees/types/employee.types'

type EmployeeFormState = EmployeePayload & { fechaIngreso: string }

const props = withDefaults(
  defineProps<{
    open: boolean
    mode: 'create' | 'edit'
    employee?: EmployeeDetail | null
    departments: Department[]
    positions: Position[]
    loading?: boolean
    serverError?: string
  }>(),
  {
    employee: null,
    loading: false,
    serverError: '',
  },
)

const emit = defineEmits<{
  close: []
  submit: [values: EmployeePayload | CreateEmployeePayload]
}>()

const emptyForm = (): EmployeeFormState => ({
  nombres: '',
  apellidos: '',
  dpi: '',
  pasaporte: '',
  nit: '',
  numeroIgss: '',
  fechaNacimiento: '',
  genero: 'M',
  direccion: '',
  telefono: '',
  correo: '',
  tipoPago: 'EFECTIVO',
  banco: '',
  cuentaBancaria: '',
  idPuesto: 0,
  idDepartamento: 0,
  salario: 0,
  retencionIsr: 0,
  fechaIngreso: '',
})

const form = reactive<EmployeeFormState>(emptyForm())
const errors = reactive<Record<string, string>>({})

watch(
  () => [props.open, props.employee, props.mode] as const,
  ([open]) => {
    if (!open) return
    Object.assign(form, emptyForm())

    const employee = props.employee
    if (employee) {
      Object.assign(form, {
        nombres: employee.nombres ?? '',
        apellidos: employee.apellidos ?? '',
        dpi: employee.dpi ?? '',
        pasaporte: employee.pasaporte ?? '',
        nit: employee.nit ?? '',
        numeroIgss: employee.numeroIgss ?? '',
        fechaNacimiento: employee.fechaNacimiento ?? '',
        genero: employee.genero === 'F' ? 'F' : 'M',
        direccion: employee.direccion ?? '',
        telefono: employee.telefono ?? '',
        correo: employee.correo ?? '',
        tipoPago: employee.tipoPago ?? 'EFECTIVO',
        banco: employee.banco ?? '',
        cuentaBancaria: employee.cuentaBancaria ?? '',
        idPuesto: employee.idPuesto,
        idDepartamento: employee.idDepartamento,
        salario: employee.salario,
        retencionIsr: employee.retencionIsr,
      })
    }
    clearErrors()
  },
  { immediate: true },
)

function clearErrors(): void {
  Object.keys(errors).forEach(key => delete errors[key])
}

function submitForm(): void {
  clearErrors()

  if (!form.nombres) errors.nombres = 'Los nombres son obligatorios.'
  if (!form.apellidos) errors.apellidos = 'Los apellidos son obligatorios.'
  if (!/^[0-9]{13}$/.test(form.dpi)) errors.dpi = 'El DPI debe tener 13 dígitos.'
  if (!form.fechaNacimiento) errors.fechaNacimiento = 'La fecha de nacimiento es obligatoria.'
  if (!['M', 'F'].includes(form.genero)) errors.genero = 'Selecciona un género.'
  if (!form.direccion) errors.direccion = 'La dirección es obligatoria.'
  if (form.idDepartamento <= 0) errors.idDepartamento = 'Selecciona un departamento.'
  if (form.idPuesto <= 0) errors.idPuesto = 'Selecciona un puesto.'
  if (!Number.isFinite(form.salario) || form.salario < 0.01 || form.salario > 999999.99)
    errors.salario = 'El salario debe estar entre 0.01 y 999999.99.'
  if (!Number.isFinite(form.retencionIsr) || form.retencionIsr < 0 || form.retencionIsr > 999999.99)
    errors.retencionIsr = 'La retención ISR debe estar entre 0 y 999999.99.'
  if (!['EFECTIVO', 'CHEQUE', 'TRANSFERENCIA'].includes(form.tipoPago))
    errors.tipoPago = 'Selecciona una forma de pago.'
  if (props.mode === 'create' && !form.fechaIngreso)
    errors.fechaIngreso = 'La fecha de ingreso es obligatoria.'

  if (Object.keys(errors).length) return

  const { fechaIngreso, ...payload } = form
  emit(
    'submit',
    props.mode === 'create'
      ? { ...payload, fechaIngreso } as CreateEmployeePayload
      : payload,
  )
}
</script>

<style scoped>
.field {
  min-height: 2.75rem;
  width: 100%;
  border: 1px solid #a7dbd8;
  border-radius: 0.75rem;
  background: white;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  color: #1e293b;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field:focus {
  border-color: #69d2e7;
  box-shadow: 0 0 0 3px rgb(105 210 231 / 25%);
}
</style>
