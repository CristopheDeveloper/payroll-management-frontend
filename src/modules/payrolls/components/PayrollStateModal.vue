<template>
  <BaseModal
    :open="open"
    title="Cambio de estado de la planilla"
    :description="description"
    size="lg"
    :close-on-backdrop="!loading"
    @close="$emit('close')"
  >
    <div class="grid gap-5">
      <div
        class="flex flex-col items-stretch gap-2 rounded-2xl border border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center sm:p-5"
      >
        <template v-for="(node, index) in nodes" :key="node.status">
          <div
            class="grid min-h-14 flex-1 place-items-center rounded-full border-2 px-3 text-center text-sm font-semibold transition"
            :class="nodeClass(node.status)"
          >
            <span>
              {{ node.label }}
              <span v-if="node.status === status" class="block text-xs font-medium">(actual)</span>
            </span>
          </div>
          <div
            v-if="index < nodes.length - 1"
            class="flex justify-center gap-1.5 sm:flex-col"
            :aria-label="`Entre ${node.label} y ${nodes[index + 1]!.label}`"
          >
            <button
              v-for="arrow in arrowsBetween(index)"
              :key="arrow.action"
              type="button"
              class="h-9 min-w-11 cursor-pointer rounded-lg border px-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-30"
              :class="
                selected === arrow.action
                  ? 'border-[#fa6900] bg-[#fa6900] text-[#202f33]'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-[#f38630]'
              "
              :disabled="!arrow.allowed"
              :title="arrow.title"
              :aria-label="arrow.title"
              :aria-pressed="selected === arrow.action"
              @click="selected = arrow.action"
            >
              {{ arrow.glyph }}
            </button>
          </div>
        </template>
      </div>

      <button
        v-if="status === 'PREPARADA'"
        type="button"
        class="inline-flex items-center gap-2 justify-self-start rounded-lg border px-3 py-2 text-sm font-semibold transition"
        :class="
          selected === 'reprepare'
            ? 'border-[#fa6900] bg-[#fa6900] text-[#202f33]'
            : 'cursor-pointer border-slate-300 bg-white text-slate-600 hover:border-[#f38630]'
        "
        :aria-pressed="selected === 'reprepare'"
        @click="selected = 'reprepare'"
      >
        <PayrollIcon name="refresh" />
        Volver a preparar
      </button>

      <div
        v-if="selected"
        class="rounded-xl border px-5 py-4 text-sm leading-6"
        :class="
          danger
            ? 'border-amber-200 bg-amber-50 text-amber-800'
            : 'border-[#a7dbd8] bg-[#69d2e7]/10 text-[#245f69]'
        "
      >
        <strong>{{ texts[selected].title }}.</strong> {{ texts[selected].message }}
      </div>
      <p v-else class="text-sm text-slate-600">
        Elige la flecha del paso al que quieres llevar la planilla.
      </p>

      <ul
        v-if="selected === 'close' && blockers.length"
        class="list-disc rounded-xl border border-red-200 bg-red-50 py-3 pr-4 pl-9 text-sm text-red-700"
      >
        <li v-for="(blocker, index) in blockers" :key="index">{{ blocker }}</li>
      </ul>

      <div v-if="selected === 'reopen'" class="grid gap-2">
        <label for="state-reason" class="text-sm font-semibold text-slate-700"
          >Motivo de la reapertura</label
        >
        <textarea
          id="state-reason"
          v-model.trim="reason"
          rows="2"
          maxlength="200"
          class="resize-none rounded-xl border border-[#a7dbd8] px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
          placeholder="Ej. Faltó registrar una suspensión del IGSS"
        ></textarea>
        <p class="text-xs text-slate-500">{{ reason.length }}/200 caracteres.</p>
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
      <button
        type="button"
        class="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        :disabled="loading"
        @click="$emit('close')"
      >
        Cancelar
      </button>
      <button
        type="button"
        class="cursor-pointer rounded-lg bg-[#fa6900] px-5 py-2.5 text-sm font-bold text-[#202f33] transition hover:bg-[#f38630] disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!canAccept || loading"
        @click="accept"
      >
        {{ loading ? 'Procesando...' : 'Aceptar' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import type { PayrollStatus } from '@/modules/payrolls/types/payroll.types'
import PayrollIcon from '@/modules/payrolls/components/PayrollIcon.vue'

export type StateAction = 'prepare' | 'reprepare' | 'generate' | 'back' | 'close' | 'reopen'

const props = withDefaults(
  defineProps<{
    open: boolean
    status: PayrollStatus
    description?: string
    isAdmin?: boolean
    blockers?: string[]
    loading?: boolean
    serverError?: string
  }>(),
  { description: '', isAdmin: false, blockers: () => [], loading: false, serverError: '' },
)

const emit = defineEmits<{ close: []; accept: [action: StateAction, reason: string] }>()

const nodes: { status: PayrollStatus; label: string }[] = [
  { status: 'CREADA', label: 'Recién creada' },
  { status: 'PREPARADA', label: 'Preparada' },
  { status: 'GENERADA', label: 'Generada' },
  { status: 'CERRADA', label: 'Cerrada' },
]
const texts: Record<StateAction, { title: string; message: string; target: PayrollStatus }> = {
  prepare: {
    title: 'Preparar',
    message:
      'Se traen los empleados del periodo con su salario y se calculan los días y horas extra según la asistencia.',
    target: 'PREPARADA',
  },
  reprepare: {
    title: 'Volver a preparar',
    message:
      'Se vuelven a traer empleados, salarios y asistencia. Lo que cambiaste a mano y los datos capturados se conservan.',
    target: 'PREPARADA',
  },
  generate: {
    title: 'Generar',
    message: 'Se calcula la planilla rubro por rubro con los datos capturados.',
    target: 'GENERADA',
  },
  back: {
    title: 'Regresar a preparada',
    message:
      'Se borra el cálculo; los datos capturados se conservan. Tendrás que generarla de nuevo.',
    target: 'PREPARADA',
  },
  close: {
    title: 'Cerrar',
    message:
      'Ya no se podrá modificar, ni la asistencia de ese mes, y los reportes saldrán como definitivos.',
    target: 'CERRADA',
  },
  reopen: {
    title: 'Reabrir',
    message:
      'La planilla vuelve a generada. Hazlo solo para corregir un error; el motivo queda registrado.',
    target: 'GENERADA',
  },
}

const selected = ref<StateAction | null>(null)
const reason = ref('')

const danger = computed(
  () => selected.value === 'back' || selected.value === 'close' || selected.value === 'reopen',
)
const canAccept = computed(() => {
  if (!selected.value) return false
  if (selected.value === 'close') return props.blockers.length === 0
  if (selected.value === 'reopen') return reason.value.length >= 5
  return true
})

watch(
  () => props.open,
  (open) => {
    if (!open) return
    reason.value = ''
    selected.value =
      (
        {
          CREADA: 'prepare',
          PREPARADA: 'generate',
          GENERADA: props.isAdmin ? 'close' : null,
          CERRADA: null,
        } as const
      )[props.status] ?? null
  },
  { immediate: true },
)

function arrowsBetween(index: number) {
  const from = nodes[index]!.status
  const to = nodes[index + 1]!.status
  const forward = (
    { CREADA: 'prepare', PREPARADA: 'generate', GENERADA: 'close' } as Record<string, StateAction>
  )[from]!
  const backward = (
    { PREPARADA: null, GENERADA: 'back', CERRADA: 'reopen' } as Record<string, StateAction | null>
  )[to]
  const list = [
    {
      action: forward,
      glyph: '>>',
      title: `Pasar a ${nodes[index + 1]!.label}`,
      allowed: props.status === from && (forward !== 'close' || props.isAdmin),
    },
  ]
  if (backward)
    list.push({
      action: backward,
      glyph: '<<',
      title: `Regresar a ${nodes[index]!.label}`,
      allowed: props.status === to && (backward !== 'reopen' || props.isAdmin),
    })
  return list
}

function nodeClass(status: PayrollStatus): string {
  if (selected.value && texts[selected.value].target === status && status !== props.status)
    return 'border-[#fa6900] bg-white text-[#a34200] shadow-md'
  if (status === props.status) return 'border-[#245f69] bg-white text-slate-900'
  return 'border-slate-300 bg-white text-slate-500'
}

function accept(): void {
  if (selected.value && canAccept.value) emit('accept', selected.value, reason.value)
}
</script>
