<template>
  <BaseModal
    :open="open"
    title="Corregir fecha de ingreso"
    :description="employeeName"
    size="sm"
    :close-on-backdrop="!loading"
    @close="$emit('close')"
  >
    <form id="hire-date-form" class="grid gap-3" novalidate @submit.prevent="submitForm">
      <div class="grid gap-1.5">
        <label for="hire-date" class="text-sm font-semibold text-slate-700"
          >Fecha de ingreso del periodo actual</label
        >
        <input
          id="hire-date"
          v-model="date"
          type="date"
          :max="today"
          class="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25 sm:w-56"
        />
      </div>
      <p
        v-if="error || serverError"
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
        form="hire-date-form"
        type="submit"
        class="cursor-pointer rounded-lg bg-[#fa6900] px-5 py-2.5 text-sm font-bold text-[#202f33] transition hover:bg-[#f38630] disabled:cursor-wait disabled:opacity-60"
        :disabled="loading"
      >
        {{ loading ? 'Guardando...' : 'Guardar' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import { todayIso } from '@/modules/employees/utils/employee.format'

const props = withDefaults(
  defineProps<{
    open: boolean
    employeeName: string
    currentDate: string
    loading?: boolean
    serverError?: string
  }>(),
  { loading: false, serverError: '' },
)

const emit = defineEmits<{ close: []; submit: [fechaIngreso: string] }>()
const today = todayIso()
const date = ref('')
const error = ref('')

watch(
  () => props.open,
  (open) => {
    if (!open) return
    date.value = props.currentDate
    error.value = ''
  },
)

function submitForm(): void {
  error.value = ''
  if (!date.value) error.value = 'La fecha de ingreso es obligatoria.'
  else if (date.value > today) error.value = 'La fecha de ingreso no puede ser futura.'
  if (error.value) return
  emit('submit', date.value)
}
</script>
