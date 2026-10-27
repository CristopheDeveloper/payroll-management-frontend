<template>
  <div class="inline-flex flex-wrap gap-1" role="radiogroup" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="modelValue === option.value"
      class="h-8 cursor-pointer rounded-lg border px-2.5 text-xs font-semibold whitespace-nowrap transition"
      :class="
        modelValue === option.value
          ? `${statusClasses[option.value]} border-current`
          : 'border-slate-300 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-700'
      "
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.short }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { AttendanceStatus } from '@/modules/attendance/types/attendance.types'
import { statusClasses } from '@/modules/attendance/utils/attendance.format'

defineProps<{ modelValue: AttendanceStatus; label: string }>()
defineEmits<{ 'update:modelValue': [value: AttendanceStatus] }>()

const options: { value: AttendanceStatus; short: string }[] = [
  { value: 'PRESENTE', short: 'Presente' },
  { value: 'FALTA', short: 'Falta' },
  { value: 'PERMISO', short: 'Permiso' },
  { value: 'SUSPENSION_IGSS', short: 'Susp. IGSS' },
]
</script>
