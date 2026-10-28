<template>
  <section class="w-full px-3 py-5 sm:px-4 lg:px-5 lg:py-6 2xl:px-6">
    <RouterLink
      :to="{ name: 'payrolls' }"
      class="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-[#b34700]"
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
      Planillas
    </RouterLink>

    <article class="mt-3 rounded-2xl border border-slate-300 bg-white shadow-md shadow-slate-900/5">
      <div class="grid gap-4 p-4 sm:p-5">
        <h1 class="text-xl font-bold tracking-tight text-slate-900">Nueva planilla</h1>
        <PayrollStateStrip status="CREADA" />
        <div
          v-if="typesQuery.isPending.value || payrollsQuery.isPending.value"
          class="h-40 animate-pulse rounded-xl bg-slate-100"
        ></div>
        <PayrollRecordForm
          v-else
          :types="typesQuery.data.value ?? []"
          :existing="payrollsQuery.data.value ?? []"
          editable
          :server-error="formError"
          @create="createPayroll"
        />
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            form="payroll-record-form"
            class="inline-flex h-9 cursor-pointer items-center rounded-lg bg-[#fa6900] px-4 text-sm font-bold text-[#202f33] transition hover:bg-[#f38630] disabled:cursor-wait disabled:opacity-60"
            :disabled="createMutation.isPending.value || typesQuery.isPending.value"
          >
            {{ createMutation.isPending.value ? 'Salvando...' : 'Salvar' }}
          </button>
          <RouterLink
            :to="{ name: 'payrolls' }"
            class="inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancelar
          </RouterLink>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import PayrollRecordForm from '@/modules/payrolls/components/PayrollRecordForm.vue'
import PayrollStateStrip from '@/modules/payrolls/components/PayrollStateStrip.vue'
import {
  usePayrollMutations,
  usePayrollsQuery,
  usePayrollTypesQuery,
} from '@/modules/payrolls/composables/usePayrolls'
import type { CreatePayrollRequest } from '@/modules/payrolls/types/payroll.types'

const router = useRouter()
const typesQuery = usePayrollTypesQuery()
const payrollsQuery = usePayrollsQuery()
const { createMutation } = usePayrollMutations()
const formError = ref('')

async function createPayroll(values: CreatePayrollRequest): Promise<void> {
  formError.value = ''
  try {
    const payroll = await createMutation.mutateAsync(values)
    await router.replace({ name: 'payroll-detail', params: { id: payroll.idNomina } })
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
  }
}
</script>
