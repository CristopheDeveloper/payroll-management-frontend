<template>
  <BaseModal
    :open="open"
    :title="`Importar de Excel · ${payrollCode}`"
    size="xl"
    fit-screen
    tinted
    :close-on-backdrop="!saving"
    @close="close"
  >
    <div class="flex min-h-0 flex-1 flex-col gap-3">
      <div class="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <p class="text-sm text-slate-600">
          Primera fila: <strong>Código</strong> y el nombre de cada variable. Desde la segunda fila:
          el código del empleado y sus valores. Las celdas vacías no cambian nada.
        </p>
        <button
          type="button"
          class="inline-flex h-9 cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          @click="copyTemplate"
        >
          {{ copied ? 'Plantilla copiada' : 'Copiar plantilla' }}
        </button>
      </div>

      <textarea
        v-model="text"
        rows="4"
        spellcheck="false"
        class="shrink-0 resize-none rounded-xl border bg-white border-[#a7dbd8] px-3.5 py-2.5 font-mono text-xs text-slate-700 outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
        placeholder="Copia las celdas en Excel y pégalas aquí (Ctrl+V)"
        aria-label="Datos pegados de Excel"
      ></textarea>

      <ul
        v-if="result.errors.length"
        class="max-h-28 shrink-0 list-disc overflow-y-auto rounded-lg border border-red-200 bg-red-50 py-2 pr-4 pl-8 text-sm text-red-700"
        role="alert"
      >
        <li v-for="(item, index) in result.errors" :key="index">{{ item }}</li>
      </ul>
      <p v-else-if="result.valueCount" class="shrink-0 text-sm font-semibold text-[#245f69]">
        {{ result.rows.length }} {{ result.rows.length === 1 ? 'empleado' : 'empleados' }} ·
        {{ result.requests.length }} {{ result.requests.length === 1 ? 'variable' : 'variables' }} ·
        {{ result.valueCount }} {{ result.valueCount === 1 ? 'valor' : 'valores' }} listos para
        importar.
      </p>

      <div
        v-if="result.rows.length"
        class="min-h-0 flex-1 overflow-auto rounded-xl border border-slate-300 bg-white"
      >
        <table class="w-full border-collapse text-left text-sm">
          <thead
            class="sticky top-0 z-10 bg-[#e4f2f1] text-xs font-bold tracking-wider text-[#245f69] uppercase"
          >
            <tr>
              <th class="px-3 py-2">Código</th>
              <th class="px-3 py-2">Nombre</th>
              <th
                v-for="(column, index) in result.columns"
                :key="index"
                class="px-3 py-2 text-right whitespace-nowrap"
                :class="{ 'text-red-600': !column }"
              >
                {{ column?.label ?? '¿?' }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="row in result.rows" :key="row.line">
              <td
                class="px-3 py-1.5 tabular-nums"
                :class="row.employee ? 'text-slate-600' : 'text-red-600'"
              >
                {{ row.code || '—' }}
              </td>
              <td class="px-3 py-1.5 font-medium text-slate-800">
                {{ row.employee?.nombreCompleto ?? 'No está en la planilla' }}
              </td>
              <td
                v-for="(column, index) in result.columns"
                :key="index"
                class="px-3 py-1.5 text-right tabular-nums"
                :class="cellClass(row.cells[index], row.values[index])"
              >
                {{ display(row.cells[index], row.values[index]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p
        v-if="serverError"
        class="shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
        role="alert"
      >
        {{ serverError }}
      </p>
    </div>

    <template #footer>
      <button
        v-if="text"
        type="button"
        class="mr-auto cursor-pointer rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800"
        :disabled="saving"
        @click="text = ''"
      >
        Limpiar
      </button>
      <button
        type="button"
        class="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        :disabled="saving"
        @click="close"
      >
        Cerrar
      </button>
      <button
        type="button"
        class="cursor-pointer rounded-lg bg-[#fa6900] px-5 py-2.5 text-sm font-bold text-[#202f33] transition hover:bg-[#f38630] disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="saving || result.errors.length > 0 || result.valueCount === 0"
        @click="$emit('submit', result.requests)"
      >
        {{ saving ? 'Importando...' : 'Importar' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import type {
  PayrollConcept,
  PayrollEmployee,
  SaveVariableRequest,
} from '@/modules/payrolls/types/payroll.types'
import { formatAmount } from '@/modules/payrolls/utils/payroll.format'
import { importTemplate, parseClipboard } from '@/modules/payrolls/utils/payroll.import'

const props = withDefaults(
  defineProps<{
    open: boolean
    payrollCode: string
    employees: PayrollEmployee[]
    concepts: PayrollConcept[]
    saving?: boolean
    serverError?: string
  }>(),
  { saving: false, serverError: '' },
)

const emit = defineEmits<{ close: []; submit: [variables: SaveVariableRequest[]] }>()
const text = ref('')
const copied = ref(false)

const result = computed(() => parseClipboard(text.value, props.employees, props.concepts))

watch(
  () => props.open,
  (open) => {
    if (open) copied.value = false
  },
)

function display(raw: string | undefined, value: number | null | undefined): string {
  if (value !== null && value !== undefined) return formatAmount(value)
  return raw?.trim() ?? ''
}

function cellClass(raw: string | undefined, value: number | null | undefined): string {
  if (value == null && raw?.trim()) return 'bg-red-50 text-red-600'
  return value == null ? 'text-slate-400' : 'text-slate-800'
}

async function copyTemplate(): Promise<void> {
  try {
    await navigator.clipboard.writeText(importTemplate(props.employees, props.concepts))
    copied.value = true
  } catch {
    copied.value = false
  }
}

function close(): void {
  text.value = ''
  emit('close')
}

defineExpose({ clear: () => (text.value = '') })
</script>
