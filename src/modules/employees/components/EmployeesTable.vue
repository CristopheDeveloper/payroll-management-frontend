<template>
  <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
    <table class="w-full min-w-[1050px] border-collapse text-left text-sm">
      <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th class="px-4 py-3 font-semibold">Código</th>
          <th class="px-4 py-3 font-semibold">Empleado</th>
          <th class="px-4 py-3 font-semibold">DPI</th>
          <th class="px-4 py-3 font-semibold">Puesto</th>
          <th class="px-4 py-3 font-semibold">Departamento</th>
          <th class="px-4 py-3 font-semibold">Tipo de pago</th>
          <th class="px-4 py-3 text-right font-semibold">Salario</th>
          <th class="px-4 py-3 text-center font-semibold">Estado</th>
          <th class="px-4 py-3 text-right font-semibold">Acciones</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-100">
        <tr v-if="loading">
          <td colspan="9" class="px-4 py-10 text-center text-slate-500">
            Cargando empleados...
          </td>
        </tr>

        <tr v-else-if="employees.length === 0">
          <td colspan="9" class="px-4 py-10 text-center text-slate-500">
            {{ emptyMessage }}
          </td>
        </tr>

        <tr
          v-for="employee in employees"
          v-else
          :key="employee.idEmpleado"
          class="transition hover:bg-slate-50/80"
        >
          <td class="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
            {{ employee.codigoEmpleado }}
          </td>
          <td class="px-4 py-3 font-medium text-slate-800">
            {{ employee.nombreCompleto }}
          </td>
          <td class="whitespace-nowrap px-4 py-3 text-slate-600">
            {{ employee.dpi }}
          </td>
          <td class="px-4 py-3 text-slate-600">{{ employee.puesto }}</td>
          <td class="px-4 py-3 text-slate-600">{{ employee.departamento }}</td>
          <td class="px-4 py-3 text-slate-600">{{ employee.tipoPago }}</td>
          <td class="whitespace-nowrap px-4 py-3 text-right text-slate-700">
            {{ formatCurrency(employee.salario) }}
          </td>
          <td class="px-4 py-3 text-center">
            <span
              class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="employee.activo
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-600'"
            >
              {{ employee.activo ? 'Activo' : 'De baja' }}
            </span>
          </td>
          <td class="px-4 py-3">
            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="action-button"
                title="Ver detalle"
                @click="$emit('detail', employee)"
              >
                Ver
              </button>
              <button
                type="button"
                class="action-button"
                title="Editar empleado"
                @click="$emit('edit', employee)"
              >
                Editar
              </button>
              <button
                v-if="employee.activo"
                type="button"
                class="action-button text-red-700 hover:bg-red-50"
                title="Dar de baja"
                @click="$emit('terminate', employee)"
              >
                Baja
              </button>
              <button
                v-else
                type="button"
                class="action-button text-emerald-700 hover:bg-emerald-50"
                title="Reingresar empleado"
                @click="$emit('rehire', employee)"
              >
                Reingreso
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Employee } from '@/modules/employees/types/employee.types'

defineProps<{
  employees: Employee[]
  loading?: boolean
  emptyMessage?: string
}>()

defineEmits<{
  detail: [employee: Employee]
  edit: [employee: Employee]
  terminate: [employee: Employee]
  rehire: [employee: Employee]
}>()

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(value)
}
</script>

<style scoped>
.action-button {
  cursor: pointer;
  border-radius: 0.5rem;
  padding: 0.4rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #334155;
  transition: background-color 0.15s;
}

.action-button:hover {
  background-color: #f1f5f9;
}
</style>
