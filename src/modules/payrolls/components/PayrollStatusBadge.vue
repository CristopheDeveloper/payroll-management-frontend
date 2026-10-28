<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
    :class="classes.badge"
    ><span class="h-1.5 w-1.5 rounded-full" :class="classes.dot"></span
    >{{ statusLabels[status] }}</span
  >
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PayrollStatus } from '@/modules/payrolls/types/payroll.types'
import { statusLabels } from '@/modules/payrolls/utils/payroll.format'

const props = defineProps<{ status: PayrollStatus }>()

const classes = computed(
  () =>
    ({
      CREADA: { badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
      PREPARADA: { badge: 'bg-[#69d2e7]/20 text-[#245f69]', dot: 'bg-[#69d2e7]' },
      GENERADA: { badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
      CERRADA: { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
    })[props.status],
)
</script>
