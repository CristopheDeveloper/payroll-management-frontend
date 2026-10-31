
<template>
  <p v-if="!generated" class="px-5 py-10 text-center text-sm text-slate-600">
    La planilla todavía no está generada.
  </p>

  <div v-else class="overflow-hidden">
    <div class="max-h-[60vh] overflow-auto">
      <table class="w-full min-w-[48rem] border-collapse text-sm">
        <thead
          class="sticky top-0 z-10 bg-[#e4f2f1] text-xs font-bold tracking-wider text-[#245f69] uppercase"
        >
          <tr>
            <th class="border border-slate-300 px-3 py-3 text-left">
              Nombre / Concepto
              <button
                type="button"
                class="ml-3 cursor-pointer font-semibold tracking-normal normal-case hover:underline"
                @click="toggleAll(!allOpen)"
              >
                {{ allOpen ? 'Contraer todo' : 'Expandir todo' }}
              </button>
            </th>
            <th class="w-40 border border-slate-300 px-3 py-3 text-right">
              Ingresos (Q)
            </th>
            <th class="w-40 border border-slate-300 px-3 py-3 text-right">
              Descuentos (Q)
            </th>
          </tr>
        </thead>

        <tbody
          v-for="row in employees"
          :key="row.idEmpleado"
          class="border-b-2 border-slate-300"
        >
          <tr
            class="cursor-pointer bg-white transition hover:bg-slate-50"
            :aria-expanded="!!expanded[row.idEmpleado]"
            @click="expanded[row.idEmpleado] = !expanded[row.idEmpleado]"
          >
            <td class="border border-slate-300 px-3 py-2 font-semibold text-slate-800">
              <PayrollIcon
                name="chevron"
                class="mr-1.5 inline align-[-3px] text-slate-500 transition"
                :class="{ 'rotate-90': expanded[row.idEmpleado] }"
              />
              {{ row.nombreCompleto }}
              <span class="font-normal text-slate-500">
                [{{ row.codigoEmpleado }}]
              </span>

              <span
                v-if="row.advertencias.length"
                class="ml-1"
                :class="
                  row.advertencias.some((item) => item.bloquea)
                    ? 'text-red-500'
                    : 'text-amber-500'
                "
                :title="row.advertencias.map((item) => item.mensaje).join(' ')"
              >
                <PayrollIcon
                  name="warning"
                  size-class="inline h-4 w-4 align-[-3px]"
                />
              </span>
            </td>

            <td class="border border-slate-300 px-3 py-2 text-right font-semibold tabular-nums">
              {{ formatAmount(row.totalIngresos) }}
            </td>

            <td class="border border-slate-300 px-3 py-2 text-right font-semibold tabular-nums">
              {{ formatAmount(row.totalDescuentos) }}
            </td>
          </tr>

          <template v-if="expanded[row.idEmpleado]">
            <tr
              v-for="line in detailLines(row)"
              :key="`${line.tipo}-${line.codigo}`"
              class="bg-slate-50/60"
            >
              <td class="border border-slate-200 py-1.5 pr-3 pl-11 text-slate-700">
                {{ line.nombre }}
                <span v-if="line.detalle" class="text-xs text-slate-500">
                  ({{ line.detalle }})
                </span>
              </td>

              <td class="border border-slate-200 px-3 py-1.5 text-right tabular-nums">
                {{
                  line.tipo === 'INGRESO'
                    ? formatAmount(line.monto)
                    : '—'
                }}
              </td>

              <td class="border border-slate-200 px-3 py-1.5 text-right tabular-nums">
                {{
                  line.tipo === 'DESCUENTO'
                    ? formatAmount(line.monto)
                    : '—'
                }}
              </td>
            </tr>

            <tr class="bg-[#e4f2f1]/60 font-semibold text-slate-800">
              <td class="border border-slate-300 py-2 pr-3 pl-11">
                Total empleado
              </td>
              <td class="border border-slate-300 px-3 py-2 text-right tabular-nums">
                {{ formatAmount(row.totalIngresos) }}
              </td>
              <td class="border border-slate-300 px-3 py-2 text-right tabular-nums">
                {{ formatAmount(row.totalDescuentos) }}
              </td>
            </tr>

            <tr class="bg-slate-50 font-semibold text-slate-900">
              <td class="border border-slate-300 py-2 pr-3 pl-11">
                Líquido a pagar
              </td>
              <td
                colspan="2"
                class="border border-slate-300 px-3 py-2 text-right font-bold tabular-nums"
                :class="row.liquido < 0 ? 'text-red-600' : 'text-slate-900'"
              >
                Q {{ formatAmount(row.liquido) }}
              </td>
            </tr>

            <tr
              v-if="row.totalPatronal"
              class="bg-white text-xs text-slate-500"
            >
              <td class="border border-slate-200 py-1.5 pr-3 pl-11">
                Cuota patronal (informativo)
              </td>
              <td
                colspan="2"
                class="border border-slate-200 px-3 py-1.5 text-right tabular-nums"
              >
                {{ formatAmount(row.totalPatronal) }}
              </td>
            </tr>
          </template>
        </tbody>

        <tfoot class="sticky bottom-0 bg-[#e4f2f1] font-bold text-slate-900">
          <tr>
            <td class="border border-slate-300 px-3 py-3">
              TOTAL GENERAL · {{ employees.length }}
              {{ employees.length === 1 ? 'empleado' : 'empleados' }}
            </td>
            <td class="border border-slate-300 px-3 py-3 text-right tabular-nums">
              {{ formatAmount(payroll.totalIngresos) }}
            </td>
            <td class="border border-slate-300 px-3 py-3 text-right tabular-nums">
              {{ formatAmount(payroll.totalDescuentos) }}
            </td>
          </tr>
          <tr>
            <td
              colspan="3"
              class="border border-slate-300 px-3 py-2.5"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <span>
                  Líquido total:
                  <strong class="ml-1 text-base tabular-nums">
                    Q {{ formatAmount(totalLiquido) }}
                  </strong>
                </span>
                <span class="text-xs font-medium text-slate-600">
                  Cuota patronal:
                  {{ formatAmount(payroll.totalPatronal) }}
                </span>
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
  () =>
    props.employees.length > 0 &&
    props.employees.every((row) => expanded[row.idEmpleado]),
)

const totalLiquido = computed(() =>
  props.employees.reduce((sum, row) => sum + row.liquido, 0),
)

function toggleAll(open: boolean): void {
  for (const row of props.employees) {
    expanded[row.idEmpleado] = open
  }
}

function detailLines(row: PayrollEmployee) {
  return row.rubros
    .filter((line) => line.tipo === 'INGRESO' || line.tipo === 'DESCUENTO')
    .map((line) => ({
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
}
</script>
