<template>
  <p v-if="!generated" class="px-5 py-10 text-center text-sm text-slate-600">
    La planilla todavía no está generada.
  </p>
  <div v-else>
    <div class="max-h-[60vh] overflow-auto">
      <table class="w-full min-w-[36rem] border-collapse text-sm">
        <thead
          class="sticky top-0 z-10 bg-[#e4f2f1] text-xs font-bold tracking-wider text-[#245f69] uppercase"
        >
          <tr>
            <th class="px-3 py-2 text-left">
              Nombre
              <button
                type="button"
                class="ml-3 cursor-pointer font-semibold tracking-normal text-[#245f69] normal-case hover:underline"
                @click="toggleAll(!allOpen)"
              >
                {{ allOpen ? 'Contraer todo' : 'Expandir todo' }}
              </button>
            </th>
            <th class="w-40 px-3 py-2.5 text-right">Cantidad</th>
          </tr>
        </thead>
        <tbody v-for="row in employees" :key="row.idEmpleado" class="border-b border-slate-200">
          <tr
            class="cursor-pointer transition hover:bg-slate-50"
            :aria-expanded="!!expanded[row.idEmpleado]"
            @click="expanded[row.idEmpleado] = !expanded[row.idEmpleado]"
          >
            <td class="px-3 py-1.5 text-slate-800">
              <PayrollIcon
                name="chevron"
                class="mr-1.5 inline align-[-3px] text-slate-500 transition"
                :class="{ 'rotate-90': expanded[row.idEmpleado] }"
              />
              {{ row.nombreCompleto }}
              <span class="text-slate-500">[{{ row.codigoEmpleado }}]</span>
              <span
                v-if="row.advertencias.length"
                class="ml-1"
                :class="
                  row.advertencias.some((item) => item.bloquea) ? 'text-red-500' : 'text-amber-500'
                "
                :title="row.advertencias.map((item) => item.mensaje).join(' ')"
                ><PayrollIcon name="warning" size-class="inline h-4 w-4 align-[-3px]"
              /></span>
            </td>
            <td
              class="px-3 py-1.5 text-right font-semibold tabular-nums"
              :class="row.liquido < 0 ? 'text-red-600' : 'text-slate-800'"
            >
              {{ formatAmount(row.liquido) }}
            </td>
          </tr>
          <template v-if="expanded[row.idEmpleado]">
            <template v-for="section in breakdown(row)" :key="section.title">
              <tr v-for="line in section.lines" :key="line.codigo" class="bg-slate-50/60">
                <td class="py-1 pr-3 pl-12 text-slate-600">
                  {{ line.nombre }}
                  <span v-if="line.detalle" class="text-xs text-slate-500"
                    >({{ line.detalle }})</span
                  >
                </td>
                <td class="px-3 py-1 text-right tabular-nums" :class="section.amountClass">
                  {{ section.sign }}{{ formatAmount(line.monto) }}
                </td>
              </tr>
              <tr class="bg-slate-50/60">
                <td
                  class="py-1 pr-3 pl-12 text-xs font-bold tracking-wider text-[#245f69] uppercase"
                >
                  {{ section.title }}
                </td>
                <td
                  class="border-t border-dashed border-slate-300 px-3 py-1 text-right font-semibold tabular-nums"
                  :class="section.amountClass"
                >
                  {{ section.sign }}{{ formatAmount(section.total) }}
                </td>
              </tr>
            </template>
          </template>
        </tbody>
        <tfoot class="sticky bottom-0 bg-[#e4f2f1] text-slate-900">
          <tr>
            <td colspan="2" class="px-3 py-2.5">
              <div class="flex flex-wrap items-baseline justify-end gap-x-6 gap-y-1 text-sm">
                <span class="mr-auto font-bold">Total · {{ employees.length }} empleados</span>
                <span
                  >Ingresos
                  <strong class="tabular-nums">{{
                    formatAmount(payroll.totalIngresos)
                  }}</strong></span
                >
                <span
                  >Descuentos
                  <strong class="text-red-600 tabular-nums"
                    >−{{ formatAmount(payroll.totalDescuentos) }}</strong
                  ></span
                >
                <span
                  >Líquido
                  <strong class="text-base tabular-nums">{{
                    formatAmount(totalLiquido)
                  }}</strong></span
                >
                <span class="text-slate-600"
                  >Cuota patronal
                  <strong class="tabular-nums">{{
                    formatAmount(payroll.totalPatronal)
                  }}</strong></span
                >
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { Payroll, PayrollEmployee } from '@/modules/payrolls/types/payroll.types'
import { formatAmount } from '@/modules/payrolls/utils/payroll.format'
import PayrollIcon from '@/modules/payrolls/components/PayrollIcon.vue'

const props = defineProps<{
  payroll: Payroll
  employees: PayrollEmployee[]
}>()

const expanded = reactive<Record<number, boolean>>({})

const generated = computed(
  () => props.payroll.estado === 'GENERADA' || props.payroll.estado === 'CERRADA',
)
const allOpen = computed(
  () => props.employees.length > 0 && props.employees.every((row) => expanded[row.idEmpleado]),
)
const totalLiquido = computed(() => props.employees.reduce((sum, row) => sum + row.liquido, 0))

function toggleAll(open: boolean): void {
  for (const row of props.employees) expanded[row.idEmpleado] = open
}

function breakdown(row: PayrollEmployee) {
  const lines = row.rubros.map((line) => ({
    codigo: line.codigo,
    nombre: line.nombre,
    monto: line.monto,
    tipo: line.tipo,
    detalle:
      line.codigo === 'SALARIO_ORDINARIO'
        ? `${row.diasPagar} días`
        : line.codigo === 'HORAS_EXTRA'
          ? `${row.horasExtra} h`
          : line.base !== null
            ? `base ${formatAmount(line.base)}`
            : line.descripcion,
  }))
  return [
    {
      title: 'Total ingresos',
      type: 'INGRESO',
      total: row.totalIngresos,
      sign: '',
      amountClass: 'text-slate-800',
    },
    {
      title: 'Total descuentos',
      type: 'DESCUENTO',
      total: row.totalDescuentos,
      sign: '−',
      amountClass: 'text-red-600',
    },
    {
      title: 'Cuota patronal',
      type: 'PATRONAL',
      total: row.totalPatronal,
      sign: '',
      amountClass: 'text-slate-500',
    },
  ]
    .map((section) => ({ ...section, lines: lines.filter((line) => line.tipo === section.type) }))
    .filter((section) => section.lines.length)
}
</script>
