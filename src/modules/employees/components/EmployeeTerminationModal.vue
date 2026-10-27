<template>
  <BaseModal
    :open="open"
    title="Dar de baja al empleado"
    :description="`Registra la baja de ${employeeName || 'este empleado'}.`"
    size="md"
    :close-on-backdrop="!loading"
    @close="$emit('close')"
  >
    <form
      id="employee-termination-form"
      class="grid gap-4"
      novalidate
      @submit.prevent="submitForm"
    >
      <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Esta operación registra una baja laboral. Verifica la fecha y el motivo antes de continuar.
      </div>

      <div class="grid gap-2">
        <label for="termination-date" class="text-sm font-semibold text-slate-700">
          Fecha de baja *
        </label>
        <input
          id="termination-date"
          v-model="form.fechaBaja"
          type="date"
          required
          class="field"
        />
        <p v-if="errors.fechaBaja" class="text-xs text-red-600">
          {{ errors.fechaBaja }}
        </p>
      </div>

      <div class="grid gap-2">
        <label for="termination-type" class="text-sm font-semibold text-slate-700">
          Tipo de baja *
        </label>
        <select
          id="termination-type"
          v-model="form.tipoBaja"
          required
          class="field"
        >
          <option value="" disabled>Selecciona el tipo de baja</option>
          <option value="RENUNCIA">Renuncia</option>
          <option value="DESPIDO">Despido</option>
          <option value="FIN_CONTRATO">Fin de contrato</option>
          <option value="OTRO">Otro</option>
        </select>
        <p v-if="errors.tipoBaja" class="text-xs text-red-600">
          {{ errors.tipoBaja }}
        </p>
      </div>

      <div class="grid gap-2">
        <label for="termination-reason" class="text-sm font-semibold text-slate-700">
          Motivo
        </label>
        <textarea
          id="termination-reason"
          v-model.trim="form.motivoBaja"
          maxlength="200"
          rows="3"
          class="field"
          placeholder="Describe el motivo de la baja"
        />
        <p class="text-xs text-slate-400">
          Máximo 200 caracteres.
        </p>
        <p v-if="errors.motivoBaja" class="text-xs text-red-600">
          {{ errors.motivoBaja }}
        </p>
      </div>

      <label class="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3">
        <input
          v-model="form.eliminarAusenciasProgramadas"
          type="checkbox"
          class="mt-1 h-4 w-4 accent-[#fa6900]"
        />
        <span class="grid gap-1">
          <span class="text-sm font-semibold text-slate-700">
            Eliminar ausencias programadas
          </span>
          <span class="text-xs text-slate-500">
            Solicita al backend eliminar las ausencias programadas asociadas, según las reglas del sistema.
          </span>
        </span>
      </label>

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
        form="employee-termination-form"
        type="submit"
        class="rounded-lg bg-[#fa6900] px-5 py-2.5 text-sm font-bold text-[#202f33] hover:bg-[#f38630] disabled:opacity-60"
        :disabled="loading"
      >
        {{ loading ? 'Procesando...' : 'Confirmar baja' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import type { BajaPayload } from '@/modules/employees/types/employee.types'

const props = withDefaults(
  defineProps<{
    open: boolean
    employeeName?: string
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
  submit: [payload: BajaPayload]
}>()

const form = reactive<BajaPayload>({
  fechaBaja: '',
  tipoBaja: 'RENUNCIA',
  motivoBaja: '',
  eliminarAusenciasProgramadas: false,
})

const errors = reactive<Record<string, string>>({})

watch(
  () => props.open,
  (open) => {
    if (!open) return
    form.fechaBaja = ''
    form.tipoBaja = 'RENUNCIA'
    form.motivoBaja = ''
    form.eliminarAusenciasProgramadas = false
    clearErrors()
  },
)

function clearErrors(): void {
  Object.keys(errors).forEach((key) => delete errors[key])
}

function submitForm(): void {
  clearErrors()

  if (!form.fechaBaja) {
    errors.fechaBaja = 'La fecha de baja es obligatoria.'
  }

  if (!['RENUNCIA', 'DESPIDO', 'FIN_CONTRATO', 'OTRO'].includes(form.tipoBaja)) {
    errors.tipoBaja = 'Selecciona un tipo de baja válido.'
  }

  if (form.motivoBaja.length > 200) {
    errors.motivoBaja = 'El motivo no puede superar 200 caracteres.'
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
