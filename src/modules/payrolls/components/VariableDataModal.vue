<template>
  <BaseModal
    :open="open"
    :title="`Datos por variable · ${payrollCode}`"
    size="xl"
    fit-screen
    tinted
    :close-on-backdrop="!saving"
    @close="close"
  >
    <div class="flex min-h-0 flex-1 flex-col gap-3">
      <div class="grid shrink-0 gap-2">
        <input
          v-model="search"
          type="search"
          class="bg-white h-10 rounded-xl border border-[#a7dbd8] px-3.5 text-sm outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
          placeholder="Buscar variable..."
          aria-label="Buscar variable"
        />
        <ul
          class="max-h-36 overflow-y-auto rounded-xl border border-slate-300 bg-white py-1"
          role="listbox"
          aria-label="Variables"
        >
          <li
            v-for="variable in filteredVariables"
            :key="variable.key"
            role="option"
            :aria-selected="selected === variable.key"
            class="flex cursor-pointer items-center justify-between gap-3 px-3.5 py-1.5 text-sm transition"
            :class="
              selected === variable.key
                ? 'bg-[#245f69] font-semibold text-white'
                : 'text-slate-700 hover:bg-slate-50'
            "
            @click="select(variable.key)"
          >
            <span>{{ variable.label }}</span>
            <span
              class="text-xs"
              :class="selected === variable.key ? 'text-white/80' : 'text-slate-500'"
              >{{ variable.group }}</span
            >
          </li>
        </ul>
      </div>

      <p v-if="!editable" class="text-sm text-slate-600">
        Solo lectura. La planilla está {{ statusLabel?.toLowerCase() }}.
      </p>
      <p v-else-if="blocked" class="text-sm font-semibold text-amber-700" role="alert">
        Salva o descarta los cambios antes de cambiar de variable.
      </p>
      <p v-else class="text-sm text-slate-600">{{ hint }}</p>

      <div class="min-h-0 flex-1 overflow-auto rounded-xl border border-slate-300 bg-white">
        <table class="w-full min-w-[46rem] border-collapse text-left text-sm">
          <thead
            class="sticky top-0 z-10 bg-[#e4f2f1] text-xs font-bold tracking-wider text-[#245f69] uppercase"
          >
            <tr>
              <th class="px-3 py-2.5">Departamento</th>
              <th class="px-3 py-2.5">Empleado</th>
              <th class="px-3 py-2.5">Nombre</th>
              <th class="px-3 py-2.5">
                {{ isConcept ? 'Descripción' : selected === 'DIAS_PAGAR' ? 'Asistencia' : '' }}
              </th>
              <th class="w-36 px-3 py-2.5 text-right">Valor</th>
            </tr>
          </thead>
          <tbody v-for="group in groups" :key="group.name" class="border-b border-slate-300">
            <tr
              v-for="(row, index) in group.rows"
              :key="row.idEmpleado"
              :class="{ 'bg-amber-50/50': isChanged(row) }"
            >
              <td class="px-3 py-1.5 align-top font-bold text-slate-700">
                {{ index === 0 ? group.name : '' }}
              </td>
              <td class="px-3 py-1.5 text-slate-600">{{ row.codigoEmpleado }}</td>
              <td class="px-3 py-1.5 font-medium text-slate-800">{{ row.nombreCompleto }}</td>
              <td class="px-3 py-1.5">
                <input
                  v-if="
                    isConcept &&
                    editable &&
                    (Number(drafts[row.idEmpleado]!.valor || 0) !== 0 ||
                      drafts[row.idEmpleado]!.descripcion)
                  "
                  v-model="drafts[row.idEmpleado]!.descripcion"
                  maxlength="200"
                  placeholder="Descripción (opcional)"
                  class="h-8 w-full rounded-lg border border-slate-300 px-2 text-sm outline-none placeholder:text-slate-300 focus:border-[#69d2e7] focus:ring-2 focus:ring-[#69d2e7]/25"
                  :aria-label="`Descripción de ${row.nombreCompleto}`"
                />
                <span v-else-if="isConcept && !editable" class="text-slate-600">{{
                  current(row).descripcion || ''
                }}</span>
                <span v-else-if="!isConcept" class="text-xs text-slate-500">{{
                  reference(row)
                }}</span>
              </td>
              <td class="px-3 py-1.5 text-right">
                <input
                  v-if="editable"
                  v-model.number="drafts[row.idEmpleado]!.valor"
                  type="number"
                  min="0"
                  :step="selected === 'DIAS_PAGAR' ? 1 : 0.01"
                  placeholder="0"
                  class="h-8 w-32 rounded-lg border border-[#a7dbd8] px-2 text-right text-sm tabular-nums outline-none placeholder:text-slate-300 focus:border-[#69d2e7] focus:ring-2 focus:ring-[#69d2e7]/25"
                  :aria-label="`Valor de ${row.nombreCompleto}`"
                />
                <span v-else class="text-slate-800 tabular-nums">{{
                  formatValue(current(row).valor)
                }}</span>
              </td>
            </tr>
          </tbody>
          <tfoot class="sticky bottom-0 bg-[#e4f2f1] font-bold text-slate-800">
            <tr>
              <td class="px-3 py-2.5" colspan="4">Total · {{ employees.length }} empleados</td>
              <td class="px-3 py-2.5 text-right tabular-nums">
                {{ selected === 'DIAS_PAGAR' ? total : formatAmount(total) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p
        v-if="serverError"
        class="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700"
        role="alert"
      >
        {{ serverError }}
      </p>
    </div>

    <template #footer>
      <span v-if="changes.length" class="mr-auto text-sm text-slate-600"
        >{{ changes.length }} {{ changes.length === 1 ? 'cambio' : 'cambios' }} sin salvar</span
      >
      <button
        v-if="editable && changes.length"
        type="button"
        class="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        :disabled="saving"
        @click="reset"
      >
        Descartar
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
        v-if="editable"
        type="button"
        class="cursor-pointer rounded-lg bg-[#fa6900] px-5 py-2.5 text-sm font-bold text-[#202f33] transition hover:bg-[#f38630] disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!changes.length || saving"
        @click="save"
      >
        {{ saving ? 'Salvando...' : 'Salvar' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import type {
  PayrollConcept,
  PayrollEmployee,
  SaveVariableRequest,
} from '@/modules/payrolls/types/payroll.types'
import { formatAmount } from '@/modules/payrolls/utils/payroll.format'

type Draft = { valor: number | string; descripcion: string }

const props = withDefaults(
  defineProps<{
    open: boolean
    payrollCode: string
    employees: PayrollEmployee[]
    concepts: PayrollConcept[]
    editable: boolean
    statusLabel?: string
    saving?: boolean
    serverError?: string
  }>(),
  { saving: false, serverError: '' },
)

const emit = defineEmits<{ close: []; submit: [payload: SaveVariableRequest] }>()
const selected = ref('DIAS_PAGAR')
const search = ref('')
const blocked = ref(false)
const drafts = reactive<Record<number, Draft>>({})

const variables = computed(() => [
  { key: 'DIAS_PAGAR', label: 'Días trabajados', group: 'Dato del mes' },
  { key: 'HORAS_EXTRA', label: 'Horas extra', group: 'Dato del mes' },
  { key: 'ISR', label: 'ISR', group: 'Descuento' },
  ...props.concepts
    .filter(
      (concept) =>
        concept.activo ||
        props.employees.some((row) =>
          row.valores.some((value) => value.idRubro === concept.idRubro),
        ),
    )
    .map((concept) => ({
      key: `R${concept.idRubro}`,
      label: concept.nombre,
      group: concept.tipo === 'INGRESO' ? 'Ingreso' : 'Descuento',
    })),
])
const filteredVariables = computed(() => {
  const term = search.value.trim().toLocaleLowerCase()
  return variables.value.filter(
    (variable) => !term || variable.label.toLocaleLowerCase().includes(term),
  )
})
const isConcept = computed(() => selected.value.startsWith('R'))
const conceptId = computed(() => (isConcept.value ? Number(selected.value.slice(1)) : null))
const concept = computed(() => props.concepts.find((item) => item.idRubro === conceptId.value))
const hint = computed(() => {
  if (selected.value === 'DIAS_PAGAR')
    return 'Por defecto, los días según la asistencia (sin faltas ni suspensiones). Cámbialos si hace falta.'
  if (selected.value === 'HORAS_EXTRA') return 'Horas extra a pagar este mes.'
  if (selected.value === 'ISR')
    return 'ISR a retener este mes; por defecto, el de la ficha del empleado.'
  if (!concept.value) return ''
  return concept.value.tipo === 'INGRESO'
    ? `Ingreso ${concept.value.afectoIgss ? 'afecto al IGSS' : 'no afecto al IGSS'}. Deja 0 a quien no le corresponde.`
    : 'Descuento que se resta del líquido. Deja 0 a quien no le corresponde.'
})
const groups = computed(() => {
  const map = new Map<string, PayrollEmployee[]>()
  for (const row of props.employees) {
    const name = row.nombreDepartamento ?? 'Sin departamento'
    map.set(name, [...(map.get(name) ?? []), row])
  }
  return [...map.entries()].map(([name, rows]) => ({ name, rows }))
})
const changes = computed(() => props.employees.filter((row) => isChanged(row)))
const total = computed(() =>
  props.employees.reduce(
    (sum, row) =>
      sum + Number((props.editable ? drafts[row.idEmpleado]?.valor : current(row).valor) || 0),
    0,
  ),
)

watch(() => [props.employees, selected.value], reset, { immediate: true })
watch(
  () => props.open,
  (open) => {
    if (!open) return
    search.value = ''
    blocked.value = false
  },
)

function select(key: string): void {
  if (key === selected.value) return
  if (changes.value.length) {
    blocked.value = true
    return
  }
  blocked.value = false
  selected.value = key
}

function current(row: PayrollEmployee): { valor: number; descripcion: string } {
  if (selected.value === 'DIAS_PAGAR') return { valor: row.diasPagar, descripcion: '' }
  if (selected.value === 'HORAS_EXTRA') return { valor: row.horasExtra, descripcion: '' }
  if (selected.value === 'ISR') return { valor: row.isr, descripcion: '' }
  const value = row.valores.find((item) => item.idRubro === conceptId.value)
  return { valor: value?.monto ?? 0, descripcion: value?.descripcion ?? '' }
}

function reference(row: PayrollEmployee): string {
  return selected.value === 'DIAS_PAGAR' ? `${row.diasPagarSugeridos} de ${row.diasPeriodo}` : ''
}

function formatValue(value: number): string {
  if (selected.value === 'DIAS_PAGAR') return String(value)
  return value === 0 ? '' : formatAmount(value)
}

function reset(): void {
  blocked.value = false
  for (const key of Object.keys(drafts)) delete drafts[Number(key)]
  for (const row of props.employees) {
    const base = current(row)
    drafts[row.idEmpleado] = {
      valor: base.valor === 0 && selected.value !== 'DIAS_PAGAR' ? '' : base.valor,
      descripcion: base.descripcion,
    }
  }
}

function isChanged(row: PayrollEmployee): boolean {
  const draft = drafts[row.idEmpleado]
  if (!props.editable || !draft) return false
  const base = current(row)
  return (
    Number(draft.valor || 0) !== base.valor ||
    (isConcept.value && draft.descripcion.trim() !== base.descripcion)
  )
}

function save(): void {
  emit('submit', {
    variable: isConcept.value ? 'RUBRO' : (selected.value as SaveVariableRequest['variable']),
    idRubro: conceptId.value,
    valores: changes.value.map((row) => ({
      idEmpleado: row.idEmpleado,
      valor: Number(drafts[row.idEmpleado]!.valor || 0),
      descripcion: drafts[row.idEmpleado]!.descripcion.trim() || null,
    })),
  })
}

function close(): void {
  reset()
  emit('close')
}
</script>
