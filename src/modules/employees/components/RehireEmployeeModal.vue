<template>
  <BaseModal
    :open="open"
    title="Reingresar"
    :description="employee ? `${employee.nombres} ${employee.apellidos}` : ''"
    size="sm"
    :close-on-backdrop="!loading"
    @close="$emit('close')"
  >
    <form
      id="rehire-form"
      class="grid gap-4 sm:grid-cols-2"
      novalidate
      @submit.prevent="submitForm"
    >
      <div class="grid gap-1.5">
        <label for="re-fecha" class="text-sm font-semibold text-slate-700">Fecha de ingreso</label>
        <input
          id="re-fecha"
          v-model="form.fechaIngreso"
          type="date"
          :max="today"
          :class="inputClass"
        />
      </div>
      <div class="grid gap-1.5">
        <label for="re-salario" class="text-sm font-semibold text-slate-700">Salario (Q)</label>
        <input
          id="re-salario"
          v-model.number="form.salario"
          type="number"
          min="0"
          step="0.01"
          :class="inputClass"
          class="text-right tabular-nums"
        />
      </div>
      <div class="grid gap-1.5">
        <label for="re-puesto" class="text-sm font-semibold text-slate-700">Puesto</label>
        <select
          id="re-puesto"
          v-model.number="form.idPuesto"
          :class="inputClass"
          class="cursor-pointer"
        >
          <option v-for="item in activePositions" :key="item.id" :value="item.id">
            {{ item.nombre }}
          </option>
        </select>
      </div>
      <div class="grid gap-1.5">
        <label for="re-departamento" class="text-sm font-semibold text-slate-700"
          >Departamento</label
        >
        <select
          id="re-departamento"
          v-model.number="form.idDepartamento"
          :class="inputClass"
          class="cursor-pointer"
        >
          <option v-for="item in activeDepartments" :key="item.id" :value="item.id">
            {{ item.nombre }}
          </option>
        </select>
      </div>
      <p
        v-if="error || serverError"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 sm:col-span-2"
        role="alert"
      >
        {{ error || serverError }}
      </p>
    </form>

    <template #footer>
      <button
        type="button"
        class="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        :disabled="loading"
        @click="$emit('close')"
      >
        Cancelar
      </button>
      <button
        form="rehire-form"
        type="submit"
        class="cursor-pointer rounded-lg bg-[#fa6900] px-5 py-2.5 text-sm font-bold text-[#202f33] transition hover:bg-[#f38630] disabled:cursor-wait disabled:opacity-60"
        :disabled="loading"
      >
        {{ loading ? 'Procesando...' : 'Reingresar' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import type {
  EmployeeDetail,
  RehireEmployeeRequest,
} from '@/modules/employees/types/employee.types'
import { todayIso } from '@/modules/employees/utils/employee.format'

type CatalogItem = { id: number; nombre: string; activo: boolean }

const props = withDefaults(
  defineProps<{
    open: boolean
    employee: EmployeeDetail | null
    positions: CatalogItem[]
    departments: CatalogItem[]
    loading?: boolean
    serverError?: string
  }>(),
  { loading: false, serverError: '' },
)

const emit = defineEmits<{ close: []; submit: [values: RehireEmployeeRequest] }>()
const inputClass =
  'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25'
const today = todayIso()
const form = reactive({
  fechaIngreso: today,
  idPuesto: 0,
  idDepartamento: 0,
  salario: 0 as number | string,
})
const error = ref('')

const activePositions = computed(() => props.positions.filter((item) => item.activo))
const activeDepartments = computed(() => props.departments.filter((item) => item.activo))

watch(
  () => props.open,
  (open) => {
    if (!open || !props.employee) return
    form.fechaIngreso = today
    form.idPuesto = activePositions.value.some((item) => item.id === props.employee!.idPuesto)
      ? props.employee.idPuesto
      : (activePositions.value[0]?.id ?? 0)
    form.idDepartamento = activeDepartments.value.some(
      (item) => item.id === props.employee!.idDepartamento,
    )
      ? props.employee.idDepartamento
      : (activeDepartments.value[0]?.id ?? 0)
    form.salario = props.employee.salario
    error.value = ''
  },
)

function submitForm(): void {
  error.value = ''
  const salario = Number(form.salario || 0)
  if (!form.fechaIngreso) error.value = 'La fecha de ingreso es obligatoria.'
  else if (form.fechaIngreso > today) error.value = 'La fecha de ingreso no puede ser futura.'
  else if (!form.idPuesto || !form.idDepartamento)
    error.value = 'Selecciona el puesto y el departamento.'
  else if (!(salario > 0 && salario <= 999999.99))
    error.value = 'El salario debe estar entre 0.01 y 999,999.99.'
  if (error.value) return
  emit('submit', {
    fechaIngreso: form.fechaIngreso,
    idPuesto: form.idPuesto,
    idDepartamento: form.idDepartamento,
    salario,
  })
}
</script>
