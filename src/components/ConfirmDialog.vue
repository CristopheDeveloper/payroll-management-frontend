<template>
  <BaseModal
    :open="open"
    :title="title"
    :description="description"
    size="md"
    :close-on-backdrop="!loading"
    @close="$emit('close')"
  >
    <div
      class="rounded-xl border px-5 py-4 text-base leading-7"
      :class="
        danger
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-amber-200 bg-amber-50 text-amber-800'
      "
    >
      {{ message }}
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
        class="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
        :class="
          danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#fa6900] text-[#202f33] hover:bg-[#f38630]'
        "
        :disabled="loading"
        @click="$emit('confirm')"
      >
        {{ loading ? 'Procesando...' : confirmLabel }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/components/BaseModal.vue'

withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    message: string
    confirmLabel?: string
    loading?: boolean
    danger?: boolean
  }>(),
  {
    description: '',
    confirmLabel: 'Confirmar',
    loading: false,
    danger: false,
  },
)

defineEmits<{ close: []; confirm: [] }>()
</script>
