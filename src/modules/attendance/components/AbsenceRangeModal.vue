<template>
  <BaseModal
    :open="open"
    title="Registrar ausencia de varios días"
    description="Falta, permiso o suspensión del IGSS para un rango de fechas. Reemplaza lo que ya estaba marcado en esos días."
    size="md"
    :close-on-backdrop="!loading"
    @close="$emit('close')"
  >
    <form
      id="absence-form"
      class="grid gap-4 md:grid-cols-2"
      novalidate
      @submit.prevent="submitForm"
    >
      <div class="grid gap-2 md:col-span-2">
        <label for="absence-employee" class="text-sm font-semibold text-slate-700">Empleado</label>
        <BaseCombobox
          id="absence-employee"
          :model-value="form.idEmpleado ?? 0"
          :options="employeeOptions"
          input-class="h-11 rounded-xl border border-[#a7dbd8] bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
          placeholder="Escribe el nombre o el código"
          @update:model-value="form.idEmpleado = $event || null"
        />
        <p v-if="errors.idEmpleado" class="text-xs text-red-600">{{ errors.idEmpleado }}</p>
      </div>

      <fieldset class="grid gap-2 md:col-span-2">
        <legend class="mb-2 text-sm font-semibold text-slate-700">Tipo de ausencia</legend>
        <div class="grid gap-2 sm:grid-cols-3">
          <label
            v-for="option in absenceOptions"
            :key="option.value"
            class="flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition"
            :class="
              form.estado === option.value
                ? 'border-[#fa6900] bg-[#fa6900]/5'
                : 'border-[#a7dbd8] hover:bg-slate-50'
            "
          >
            <input
              v-model="form.estado"
              type="radio"
              name="absence-status"
              :value="option.value"
              class="mt-1 accent-[#fa6900]"
            />
            <span>
              <span class="block text-sm font-semibold text-slate-800">{{ option.label }}</span>
              <span class="block text-xs text-slate-600">{{ option.hint }}</span>
            </span>
          </label>
        </div>
      </fieldset>

      <div class="grid gap-2">
        <label for="absence-from" class="text-sm font-semibold text-slate-700">Desde</label>
        <input
          id="absence-from"
          v-model="form.desde"
          type="date"
          :max="maxSelectable"
          class="h-11 rounded-xl border border-[#a7dbd8] px-3.5 text-sm text-slate-800 outline-none transition focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
        />
        <p v-if="errors.desde" class="text-xs text-red-600">{{ errors.desde }}</p>
      </div>

      <div class="grid gap-2">
        <label for="absence-to" class="text-sm font-semibold text-slate-700">Hasta</label>
        <input
          id="absence-to"
          v-model="form.hasta"
          type="date"
          :min="form.desde || undefined"
          :max="maxSelectable"
          class="h-11 rounded-xl border border-[#a7dbd8] px-3.5 text-sm text-slate-800 outline-none transition focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
        />
        <p v-if="errors.hasta" class="text-xs text-red-600">{{ errors.hasta }}</p>
      </div>

      <label
        v-if="form.estado !== 'SUSPENSION_IGSS'"
        class="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700 md:col-span-2"
      >
        <input v-model="form.soloDiasHabiles" type="checkbox" class="h-4 w-4 accent-[#fa6900]" />
        Solo días hábiles (sin sábados ni domingos)
      </label>
      <p v-else class="text-sm text-slate-600 md:col-span-2">
        La suspensión del IGSS marca todos los días del calendario, incluidos fines de semana.
      </p>

      <div class="grid gap-2 md:col-span-2">
        <label for="absence-note" class="text-sm font-semibold text-slate-700">Observación</label>
        <input
          id="absence-note"
          v-model.trim="form.observacion"
          type="text"
          maxlength="200"
          class="h-11 rounded-xl border border-[#a7dbd8] px-3.5 text-sm text-slate-800 outline-none transition focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
          placeholder="Opcional"
        />
        <p v-if="errors.observacion" class="text-xs text-red-600">{{ errors.observacion }}</p>
      </div>

      <p
        v-if="serverError"
        class="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-700 md:col-span-2"
        role="alert"
      >
        {{ serverError }}
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
        form="absence-form"
        type="submit"
        class="cursor-pointer rounded-lg bg-[#fa6900] px-5 py-2.5 text-sm font-bold text-[#202f33] transition hover:bg-[#f38630] disabled:cursor-wait disabled:opacity-60"
        :disabled="loading"
      >
        {{ loading ? 'Registrando...' : 'Registrar' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import BaseCombobox from '@/components/BaseCombobox.vue'
import type {
  AbsenceFormValues,
  AbsenceStatus,
  AttendanceEmployee,
} from '@/modules/attendance/types/attendance.types'
import { toIsoDate, todayIso } from '@/modules/attendance/utils/attendance.format'

const props = withDefaults(
  defineProps<{
    open: boolean
    employees: AttendanceEmployee[]
    loading?: boolean
    serverError?: string
  }>(),
  { loading: false, serverError: '' },
)

const emit = defineEmits<{ close: []; submit: [values: AbsenceFormValues] }>()
const absenceOptions: { value: AbsenceStatus; label: string; hint: string }[] = [
  { value: 'FALTA', label: 'Falta', hint: 'No se paga' },
  { value: 'PERMISO', label: 'Permiso', hint: 'Se paga' },
  { value: 'SUSPENSION_IGSS', label: 'Suspensión IGSS', hint: 'No se paga' },
]
const nextYear = new Date()
nextYear.setFullYear(nextYear.getFullYear() + 1)
const maxDate = toIsoDate(nextYear)
const form = reactive<AbsenceFormValues>({
  idEmpleado: null,
  estado: 'FALTA',
  desde: '',
  hasta: '',
  soloDiasHabiles: true,
  observacion: '',
})
const employeeOptions = computed(() =>
  [...props.employees]
    .sort(
      (a, b) =>
        Number(b.activo) - Number(a.activo) || a.nombreCompleto.localeCompare(b.nombreCompleto),
    )
    .map((employee) => ({
      value: employee.idEmpleado,
      label: `${employee.codigoEmpleado} · ${employee.nombreCompleto}`,
      hint: employee.activo ? undefined : '(de baja)',
    })),
)
const maxSelectable = computed(() => (form.estado === 'FALTA' ? todayIso() : maxDate))
const errors = reactive<Record<'idEmpleado' | 'desde' | 'hasta' | 'observacion', string>>({
  idEmpleado: '',
  desde: '',
  hasta: '',
  observacion: '',
})

watch(
  () => props.open,
  (open) => {
    if (!open) return
    form.idEmpleado = null
    form.estado = 'FALTA'
    form.desde = todayIso()
    form.hasta = todayIso()
    form.soloDiasHabiles = true
    form.observacion = ''
    clearErrors()
  },
  { immediate: true },
)

function submitForm(): void {
  clearErrors()

  if (!form.idEmpleado) errors.idEmpleado = 'Selecciona un empleado.'
  if (!form.desde) errors.desde = 'La fecha inicial es obligatoria.'
  if (!form.hasta) errors.hasta = 'La fecha final es obligatoria.'
  else if (form.desde && form.hasta < form.desde)
    errors.hasta = 'La fecha final no puede ser anterior a la inicial.'
  else if (form.estado === 'FALTA' && form.hasta > todayIso())
    errors.hasta = 'Las faltas no se pueden registrar en fechas futuras.'
  if (form.observacion.length > 200)
    errors.observacion = 'La observación debe tener como máximo 200 caracteres.'
  if (Object.values(errors).some(Boolean)) return

  emit('submit', { ...form })
}

function clearErrors(): void {
  Object.keys(errors).forEach((key) => (errors[key as keyof typeof errors] = ''))
}
</script>
