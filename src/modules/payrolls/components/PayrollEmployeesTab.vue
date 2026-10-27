<template>
  <div>
    <div v-if="employees.length > 15" class="border-b border-slate-300 p-3">
      <input
        v-model="search"
        type="search"
        class="h-10 w-full max-w-md rounded-xl border border-[#a7dbd8] px-3.5 text-sm outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
        placeholder="Buscar por código, nombre o departamento..."
        aria-label="Buscar empleados"
      />
    </div>

    <div v-if="loading" class="grid gap-2 p-5">
      <div v-for="item in 4" :key="item" class="h-9 animate-pulse rounded-lg bg-slate-100"></div>
    </div>
    <p v-else-if="filtered.length === 0" class="px-5 py-10 text-center text-sm text-slate-600">
      {{
        employees.length ? 'Ningún empleado coincide con la búsqueda.' : 'Sin empleados todavía.'
      }}
    </p>
    <div v-else class="max-h-[60vh] overflow-auto">
      <table class="w-full min-w-[56rem] border-collapse text-left text-sm">
        <thead
          class="sticky top-0 z-10 bg-[#e4f2f1] text-xs font-bold tracking-wider text-[#245f69] uppercase"
        >
          <tr>
            <th class="w-8 px-2 py-2.5"></th>
            <th class="px-3 py-2.5">Empleado</th>
            <th class="px-3 py-2.5">Nombre</th>
            <th class="px-3 py-2.5">Puesto</th>
            <th class="px-3 py-2.5">Departamento</th>
            <th class="px-3 py-2.5 text-right">Salario</th>
            <th class="px-3 py-2.5 text-right">Días</th>
            <th class="px-3 py-2.5 text-right">H. extra</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr
            v-for="row in filtered"
            :key="row.idEmpleado"
            class="cursor-pointer transition"
            :class="selectedId === row.idEmpleado ? 'bg-[#69d2e7]/15' : 'hover:bg-slate-50'"
            title="Doble clic para abrir sus datos"
            @click="clickRow(row)"
          >
            <td class="px-2 py-1.5 text-center">
              <span
                v-if="selectedId === row.idEmpleado"
                class="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"
                aria-hidden="true"
              ></span>
            </td>
            <td class="px-3 py-1.5 text-slate-600 tabular-nums">{{ row.codigoEmpleado }}</td>
            <td class="px-3 py-1.5 font-medium text-slate-800">
              {{ row.nombreCompleto }}
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
            <td class="px-3 py-1.5 text-slate-600">{{ row.nombrePuesto }}</td>
            <td class="px-3 py-1.5 text-slate-600">{{ row.nombreDepartamento }}</td>
            <td class="px-3 py-1.5 text-right text-slate-600 tabular-nums">
              {{ formatAmount(row.salario) }}
            </td>
            <td class="px-3 py-1.5 text-right text-slate-600 tabular-nums">{{ row.diasPagar }}</td>
            <td class="px-3 py-1.5 text-right text-slate-600 tabular-nums">{{ row.horasExtra }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PayrollEmployee } from '@/modules/payrolls/types/payroll.types'
import { formatAmount } from '@/modules/payrolls/utils/payroll.format'
import PayrollIcon from '@/modules/payrolls/components/PayrollIcon.vue'

const props = withDefaults(defineProps<{ employees: PayrollEmployee[]; loading?: boolean }>(), {
  loading: false,
})

const emit = defineEmits<{ 'open-data': [employee: PayrollEmployee] }>()

const search = ref('')
const selectedId = ref<number | null>(null)

const filtered = computed(() => {
  const term = search.value.trim().toLocaleLowerCase()
  return props.employees.filter(
    (row) =>
      !term ||
      `${row.codigoEmpleado} ${row.nombreCompleto} ${row.nombreDepartamento}`
        .toLocaleLowerCase()
        .includes(term),
  )
})

function clickRow(row: PayrollEmployee): void {
  if (selectedId.value === row.idEmpleado) emit('open-data', row)
  else selectedId.value = row.idEmpleado
}

defineExpose({ selectedId })
</script>
