<template>
  <div v-if="loading" class="grid gap-2 p-5">
    <div v-for="item in 3" :key="item" class="h-9 animate-pulse rounded-lg bg-slate-100"></div>
  </div>
  <p v-else-if="!payments.length" class="px-5 py-10 text-center text-sm text-slate-600">
    Todavía no tiene planillas cerradas.
  </p>
  <div v-else class="overflow-x-auto">
    <table class="w-full min-w-[44rem] border-collapse text-sm">
      <thead class="bg-[#e4f2f1] text-xs font-bold tracking-wider text-[#245f69] uppercase">
        <tr>
          <th class="px-4 py-2.5 text-left">Planilla</th>
          <th class="px-4 py-2.5 text-left">Periodo</th>
          <th class="px-4 py-2.5 text-right">Días</th>
          <th class="px-4 py-2.5 text-right">Ingresos</th>
          <th class="px-4 py-2.5 text-right">Descuentos</th>
          <th class="px-4 py-2.5 text-right">Líquido</th>
        </tr>
      </thead>
      <tbody v-for="payment in payments" :key="payment.idNomina" class="border-b border-slate-200">
        <tr
          class="cursor-pointer transition hover:bg-slate-50"
          :aria-expanded="!!expanded[payment.idNomina]"
          @click="expanded[payment.idNomina] = !expanded[payment.idNomina]"
        >
          <td class="px-4 py-2">
            <svg
              class="mr-1.5 inline h-4 w-4 align-[-3px] text-slate-500 transition"
              :class="{ 'rotate-90': expanded[payment.idNomina] }"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="m9 6 6 6-6 6"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="font-semibold text-slate-800">{{ payment.codigo }}</span>
          </td>
          <td class="px-4 py-2 whitespace-nowrap text-slate-700">
            {{ formatPeriod(payment.anio, payment.mes) }}
          </td>
          <td class="px-4 py-2 text-right text-slate-700 tabular-nums">{{ payment.diasPagar }}</td>
          <td class="px-4 py-2 text-right text-slate-700 tabular-nums">
            {{ formatAmount(payment.totalIngresos) }}
          </td>
          <td class="px-4 py-2 text-right text-red-600 tabular-nums">
            −{{ formatAmount(payment.totalDescuentos) }}
          </td>
          <td class="px-4 py-2 text-right font-bold text-slate-900 tabular-nums">
            {{ formatAmount(payment.liquido) }}
          </td>
        </tr>
        <template v-if="expanded[payment.idNomina]">
          <tr
            v-for="line in payment.rubros.filter((item) => item.tipo !== 'PATRONAL')"
            :key="line.codigo"
            class="bg-slate-50"
          >
            <td class="py-1 pr-4 pl-11 text-slate-700" colspan="5">
              {{ line.nombre }}
              <span v-if="line.descripcion" class="text-xs text-slate-500"
                >({{ line.descripcion }})</span
              >
            </td>
            <td
              class="px-4 py-1 text-right tabular-nums"
              :class="line.tipo === 'DESCUENTO' ? 'text-red-600' : 'text-slate-800'"
            >
              {{ line.tipo === 'DESCUENTO' ? '−' : '' }}{{ formatAmount(line.monto) }}
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { EmployeePayment } from '@/modules/employees/types/employee.types'
import { formatAmount, formatPeriod } from '@/modules/payrolls/utils/payroll.format'

withDefaults(defineProps<{ payments: EmployeePayment[]; loading?: boolean }>(), {
  loading: false,
})

const expanded = reactive<Record<number, boolean>>({})
</script>
