<template>
  <BaseModal
    :open="open"
    title="Reingresar empleado"
    :description="`Registra el reingreso de ${employeeName || 'este empleado'}.`"
    size="md"
    :close-on-backdrop="!loading"
    @close="$emit('close')"
  >
    <form
      id="employee-rehire-form"
      class="grid gap-4"
      novalidate
      @submit.prevent="submitForm"
    >
      <div class="rounded-xl border border-[#a7dbd8] bg-[#eaf8f7] p-4 text-sm text-slate-700">
        Ingresa los datos laborales para el nuevo período del empleado.
      </div>

      <div class="grid gap-2">
        <label for="rehire-date" class="text-sm font-semibold text-slate-700">
          Fecha de ingreso *
        </label>
        <input
          id="rehire-date"
          v-model="form.fechaIngreso"
          type="date"
          required
          class="field"
        />
        <p v-if="errors.fechaIngreso" class="text-xs text-red-600">
          {{ errors.fechaIngreso }}
        </p>
      </div>

      <div class="grid gap-2">
        <label for="rehire-department" class="text-sm font-semibold text-slate-700">
          Departamento *
        </label>
        <select
          id="rehire-department"
          v-model.number="form.idDepartamento"
          required
          class="field"
        >
          <option :value="0" disabled>Selecciona un departamento</option>
          <option
            v-for="department in departments"
            :key="department.idDepartamento"
            :value="department.idDepartamento"
          >
            {{ department.nombre }}
          </option>
        </select>
        <p v-if="errors.idDepartamento" class="text-xs text-red-600">
          {{ errors.idDepartamento }}
        </p>
      </div>

      <div class="grid gap-2">
        <label for="rehire-position" class="text-sm font-semibold text-slate-700">
          Puesto *
        </label>
        <select
          id="rehire-position"
          v-model.number="form.idPuesto"
          required
          class="field"
        >
          <option :value="0" disabled>Selecciona un puesto</option>
          <option
            v-for="position in positions"
            :key="position.idPuesto"
            :value="position.idPuesto"
          >
            {{ position.nombre }}
          </option>
        </select>
        <p v-if="errors.idPuesto" class="text-xs text-red-600">
          {{ errors.idPuesto }}
        </p>
      </div>

      <div class="grid gap-2">
        <label for="rehire-salary" class="text-sm font-semibold text-slate-700">
          Salario *
        </label>
        <input
          id="rehire-salary"
          v-model.number="form.salario"
          type="number"
          min="0.01"
          max="999999.99"
          step="0.01"
          required
          class="field"
        />
        <p v-if="errors.salario" class="text-xs text-red-600">
          {{ errors.salario }}
        </p>
      </div>

      <p
        v-if="serverError"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        role="alert"
      >
        {{ serverError }}
      </p>
    </form>

    <template #footer>
      <button
        type="button"
        class="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        :disabled="loading"
        @click="$emit('close')"
      >
        Cancelar
      </button>
      <button
        form="employee-rehire-form"
        type="submit"
        class="rounded-lg bg-[#fa6900] px-5 py-2.5 text-sm font-bold text-[#202f33] hover:bg-[#f38630] disabled:opacity-60"
        :disabled="loading"
      >
        {{ loading ? 'Procesando...' : 'Confirmar reingreso' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import type {
  Department,
  Position,
  ReingresoPayload,
} from '@/modules/employees/types/employee.types'

interface RehireForm extends ReingresoPayload {
  idPuesto: number
  idDepartamento: number
  salario: number
}

const props = withDefaults(
  defineProps<{
    open: boolean
    employeeName?: string
    departments: Department[]
    positions: Position[]
    loading?: boolean
    serverError?: string
  }>(),
  {
    employeeName: '',
    loading: false,
    serverError: '',
  },
)

const emit = defineEmits<{
  close: []
  submit: [payload: RehireForm]
}>()

const form = reactive<RehireForm>({
  fechaIngreso: '',
  idPuesto: 0,
  idDepartamento: 0,
  salario: 0,
})

const errors = reactive<Record<string, string>>({})

watch(
  () => props.open,
  (open) => {
    if (!open) return
    form.fechaIngreso = ''
    form.idPuesto = 0
    form.idDepartamento = 0
    form.salario = 0
    clearErrors()
  },
)

function clearErrors(): void {
  Object.keys(errors).forEach((key) => delete errors[key])
}

function submitForm(): void {
  clearErrors()

  if (!form.fechaIngreso) {
    errors.fechaIngreso = 'La fecha de ingreso es obligatoria.'
  }

  if (form.idDepartamento <= 0) {
    errors.idDepartamento = 'Selecciona un departamento.'
  }

  if (form.idPuesto <= 0) {
    errors.idPuesto = 'Selecciona un puesto.'
  }

  if (
    !Number.isFinite(form.salario) ||
    form.salario < 0.01 ||
    form.salario > 999999.99
  ) {
    errors.salario = 'El salario debe estar entre 0.01 y 999999.99.'
  }

  if (Object.keys(errors).length > 0) return

  emit('submit', { ...form })
}
</script>

<style scoped>
.field {
  width: 100%;
  min-height: 2.75rem;
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
