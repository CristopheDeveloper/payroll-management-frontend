<template>
  <Transition name="loading-fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-[9999] grid place-items-center bg-[#f7f9fa]/95 px-6 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="flex flex-col items-center text-center">
        <div class="relative grid h-24 w-24 place-items-center" aria-hidden="true">
          <span class="absolute inset-0 animate-ping rounded-full bg-[#69d2e7]/20"></span>
          <span class="absolute inset-2 rounded-full border-4 border-[#a7dbd8]/60"></span>
          <span
            class="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-t-[#69d2e7] border-r-[#fa6900]"
          ></span>
          <svg class="h-9 w-9 text-[#203f45]" viewBox="0 0 32 32" fill="none">
            <path
              d="M8 9.5h16M8 15.5h16M8 21.5h9"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
            />
            <path
              d="M22 20v5m-2.5-2.5h5"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
            />
            <rect
              x="4"
              y="4"
              width="24"
              height="24"
              rx="7"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </div>

        <p class="mt-6 text-lg font-bold text-[#203f45]">{{ message }}</p>
        <p class="mt-2 text-sm text-slate-500">Por favor, espera un momento.</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    visible: boolean
    message?: string
  }>(),
  {
    message: 'Cargando información...',
  },
)
</script>

<style scoped>
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 250ms ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
