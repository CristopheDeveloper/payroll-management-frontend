<template>
  <div
    class="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <p class="text-sm text-slate-500">
      Mostrando <span class="font-semibold text-slate-700">{{ startItem }}-{{ endItem }}</span> de
      <span class="font-semibold text-slate-700">{{ totalItems }}</span>
    </p>

    <nav class="flex items-center gap-1" aria-label="Paginación">
      <button
        type="button"
        class="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-[#a7dbd8] text-slate-600 transition hover:border-[#fa6900] hover:bg-[#f38630] hover:text-[#202f33] disabled:cursor-not-allowed disabled:opacity-35"
        :disabled="page <= 1"
        aria-label="Página anterior"
        @click="$emit('update:page', page - 1)"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m15 18-6-6 6-6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <button
        v-for="pageNumber in visiblePages"
        :key="pageNumber"
        type="button"
        class="h-9 min-w-9 cursor-pointer rounded-lg px-2 text-sm font-semibold transition"
        :class="
          pageNumber === page
            ? 'bg-[#fa6900] text-[#202f33]'
            : 'text-slate-600 hover:bg-[#f38630] hover:text-[#202f33]'
        "
        :aria-current="pageNumber === page ? 'page' : undefined"
        @click="$emit('update:page', pageNumber)"
      >
        {{ pageNumber }}
      </button>

      <button
        type="button"
        class="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-[#a7dbd8] text-slate-600 transition hover:border-[#fa6900] hover:bg-[#f38630] hover:text-[#202f33] disabled:cursor-not-allowed disabled:opacity-35"
        :disabled="page >= totalPages"
        aria-label="Página siguiente"
        @click="$emit('update:page', page + 1)"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m9 18 6-6-6-6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  pageSize: number
  totalItems: number
}>()

defineEmits<{ 'update:page': [page: number] }>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.pageSize)))
const startItem = computed(() =>
  props.totalItems === 0 ? 0 : (props.page - 1) * props.pageSize + 1,
)
const endItem = computed(() => Math.min(props.page * props.pageSize, props.totalItems))
const visiblePages = computed(() => {
  const start = Math.max(1, Math.min(props.page - 2, totalPages.value - 4))
  const end = Math.min(totalPages.value, start + 4)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})
</script>
