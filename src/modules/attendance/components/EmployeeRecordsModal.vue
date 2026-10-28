<template>
  <BaseModal
    :open="open"
    :title="employeeName"
    :description="`Registros de ${period}. Los días sin registro cuentan como trabajados.`"
    size="md"
    @close="$emit('close')"
  >
    <div v-if="loading" class="grid gap-2">
      <div v-for="item in 3" :key="item" class="h-12 animate-pulse rounded-xl bg-slate-100"></div>
    </div>
    <p v-else-if="records.length === 0" class="py-8 text-center text-sm text-slate-600">
      No hay registros en este mes.
    </p>
    <div v-else class="overflow-x-auto rounded-xl border border-slate-300">
      <table class="w-full min-w-[34rem] border-collapse text-left text-sm">
        <thead class="bg-[#e4f2f1] text-xs font-bold tracking-wider text-[#245f69] uppercase">
          <tr>
            <th class="px-4 py-3">Fecha</th>
            <th class="px-4 py-3">Estado</th>
            <th class="px-4 py-3">Observación</th>
            <th class="px-4 py-3 text-right"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="record in sortedRecords" :key="record.idAsistencia">
            <td class="px-4 py-3 text-slate-700">{{ formatDate(record.fecha) }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-lg px-2.5 py-1 text-xs font-bold"
                :class="statusClasses[record.estado]"
                >{{ statusLabels[record.estado] }}</span
              >
            </td>
            <td class="px-4 py-3 text-slate-600">{{ record.observacion || '—' }}</td>
            <td class="px-4 py-3">
              <div class="flex justify-end">
                <button
                  v-if="pendingDelete !== record.idAsistencia"
                  type="button"
                  class="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                  title="Eliminar registro"
                  aria-label="Eliminar registro"
                  @click="pendingDelete = record.idAsistencia"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
                <div v-else class="flex gap-1">
                  <button
                    type="button"
                    class="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    :disabled="deleting"
                    @click="pendingDelete = null"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    class="cursor-pointer rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
                    :disabled="deleting"
                    @click="$emit('delete', record.idAsistencia)"
                  >
                    {{ deleting ? 'Eliminando...' : 'Eliminar' }}
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p
      v-if="serverError"
      class="mt-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-700"
      role="alert"
    >
      {{ serverError }}
    </p>

    <template #footer>
      <button
        type="button"
        class="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        @click="$emit('close')"
      >
        Cerrar
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import type { AttendanceRecord } from '@/modules/attendance/types/attendance.types'
import {
  formatDate,
  statusClasses,
  statusLabels,
} from '@/modules/attendance/utils/attendance.format'

const props = withDefaults(
  defineProps<{
    open: boolean
    employeeName: string
    period: string
    records: AttendanceRecord[]
    loading?: boolean
    deleting?: boolean
    serverError?: string
  }>(),
  { loading: false, deleting: false, serverError: '' },
)

defineEmits<{ close: []; delete: [id: number] }>()
const pendingDelete = ref<number | null>(null)
const sortedRecords = computed(() =>
  [...props.records].sort((a, b) => a.fecha.localeCompare(b.fecha)),
)

watch(
  () => [props.open, props.records] as const,
  () => (pendingDelete.value = null),
)
</script>
