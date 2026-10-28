<template>
  <BaseModal
    :open="open"
    title="Dar de baja"
    :description="employeeName"
    size="sm"
    :close-on-backdrop="!loading"
    @close="$emit('close')"
  >
    <form id="terminate-form" class="grid gap-4" novalidate @submit.prevent="submitForm">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="grid gap-1.5">
          <label for="baja-fecha" class="text-sm font-semibold text-slate-700">Fecha de baja</label>
          <input
            id="baja-fecha"
            v-model="form.fechaBaja"
            type="date"
            :max="today"
            :class="inputClass"
          />
        </div>
        <div class="grid gap-1.5">
          <label for="baja-tipo" class="text-sm font-semibold text-slate-700">Tipo</label>
          <select id="baja-tipo" v-model="form.tipoBaja" :class="inputClass" class="cursor-pointer">
            <option v-for="(label, value) in terminationTypeLabels" :key="value" :value="value">
              {{ label }}
            </option>
          </select>
        </div>
      </div>
      <div class="grid gap-1.5">
        <label for="baja-motivo" class="text-sm font-semibold text-slate-700"
          >Motivo
          <span class="font-normal text-slate-500">{{
            form.tipoBaja === 'OTRO' ? '(obligatorio)' : '(opcional)'
          }}</span></label
        >
        <input id="baja-motivo" v-model="form.motivoBaja" :class="inputClass" maxlength="200" />
      </div>
      <p
        v-if="confirmCode"
        class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800"
      >
        {{ serverError }}
      </p>
      <p
        v-else-if="error || serverError"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
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
        form="terminate-form"
        type="submit"
        class="cursor-pointer rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
        :disabled="loading"
      >
        {{
          loading
            ? 'Procesando...'
            : confirmCode
              ? 'Eliminar ausencias y dar de baja'
              : 'Dar de baja'
        }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import type {
  TerminateEmployeeRequest,
  TerminationType,
} from '@/modules/employees/types/employee.types'
import { terminationTypeLabels, todayIso } from '@/modules/employees/utils/employee.format'

const props = withDefaults(
  defineProps<{
    open: boolean
    employeeName: string
    loading?: boolean
    serverError?: string
    confirmCode?: boolean
  }>(),
  { loading: false, serverError: '', confirmCode: false },
)

const emit = defineEmits<{ close: []; submit: [values: TerminateEmployeeRequest] }>()
const inputClass =
  'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25'
const today = todayIso()
const form = reactive({ fechaBaja: today, tipoBaja: 'RENUNCIA' as TerminationType, motivoBaja: '' })
const error = ref('')

watch(
  () => props.open,
  (open) => {
    if (!open) return
    form.fechaBaja = today
    form.tipoBaja = 'RENUNCIA'
    form.motivoBaja = ''
    error.value = ''
  },
)

function submitForm(): void {
  error.value = ''
  if (!form.fechaBaja) error.value = 'La fecha de baja es obligatoria.'
  else if (form.fechaBaja > today) error.value = 'La fecha de baja no puede ser futura.'
  else if (form.tipoBaja === 'OTRO' && !form.motivoBaja.trim())
    error.value = 'El motivo es obligatorio cuando el tipo de baja es Otro.'
  if (error.value) return
  emit('submit', {
    fechaBaja: form.fechaBaja,
    tipoBaja: form.tipoBaja,
    motivoBaja: form.motivoBaja.trim() || null,
    eliminarAusenciasProgramadas: props.confirmCode,
  })
}
</script>
