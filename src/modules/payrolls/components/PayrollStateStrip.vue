<template>
  <ol class="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Estado de la planilla">
    <li
      v-for="(state, index) in states"
      :key="state.status"
      class="flex h-8 items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition"
      :class="classes(index)"
      :aria-current="index === currentIndex ? 'step' : undefined"
    >
      <PayrollIcon
        v-if="index < currentIndex || (index === currentIndex && status === 'CERRADA')"
        name="check"
        size-class="h-3.5 w-3.5"
      />
      {{ state.label }}
    </li>
  </ol>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PayrollStatus } from '@/modules/payrolls/types/payroll.types'
import PayrollIcon from '@/modules/payrolls/components/PayrollIcon.vue'

const props = defineProps<{ status: PayrollStatus }>()

const states: { status: PayrollStatus; label: string }[] = [
  { status: 'CREADA', label: 'Recién creada' },
  { status: 'PREPARADA', label: 'Preparada' },
  { status: 'GENERADA', label: 'Generada' },
  { status: 'CERRADA', label: 'Cerrada' },
]

const currentIndex = computed(() => states.findIndex((state) => state.status === props.status))

function classes(index: number): string {
  if (index === currentIndex.value)
    return props.status === 'CERRADA'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
      : 'border-[#fa6900] bg-[#fa6900]/10 text-[#a34200] shadow-sm'
  if (index < currentIndex.value) return 'border-transparent bg-transparent text-[#245f69]'
  return 'border-slate-300 bg-slate-50 text-slate-500'
}
</script>
