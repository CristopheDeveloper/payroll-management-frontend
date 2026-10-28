<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[9000] overflow-y-auto bg-slate-950/55 p-2 backdrop-blur-[2px] sm:p-4"
        @mousedown.self="emitBackdropClose"
      >
        <div class="flex min-h-full items-center justify-center">
          <section
            class="w-full overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-950/20"
            :class="[
              sizeClasses,
              fitScreen && 'flex max-h-[calc(100dvh-1rem)] flex-col sm:max-h-[calc(100dvh-2rem)]',
            ]"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
          >
            <header
              class="flex shrink-0 items-start justify-between gap-5 border-b border-slate-200 px-4 py-4 sm:px-5"
            >
              <div>
                <h2 :id="titleId" class="text-xl font-bold text-slate-900">{{ title }}</h2>
                <p v-if="description" class="mt-1 text-sm leading-6 text-slate-500">
                  {{ description }}
                </p>
              </div>
              <button
                type="button"
                class="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Cerrar"
                @click="emitClose"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="m6 6 12 12M18 6 6 18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </header>

            <div
              class="px-4 py-5 sm:px-5"
              :class="[fitScreen && 'flex min-h-0 flex-1 flex-col', tinted && 'bg-[#f1f3ea]']"
            >
              <slot />
            </div>

            <footer
              v-if="$slots.footer"
              class="flex shrink-0 flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3.5 sm:px-5"
            >
              <slot name="footer" />
            </footer>
          </section>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    closeOnBackdrop?: boolean
    fitScreen?: boolean
    tinted?: boolean
  }>(),
  {
    description: '',
    size: 'md',
    closeOnBackdrop: true,
    fitScreen: false,
    tinted: false,
  },
)

const emit = defineEmits<{ close: [] }>()
const titleId = `modal-title-${Math.random().toString(36).slice(2)}`
const sizeClasses = computed(
  () =>
    ({
      sm: 'max-w-xl',
      md: 'max-w-3xl',
      lg: 'max-w-5xl',
      xl: 'max-w-6xl',
    })[props.size],
)

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

function emitClose(): void {
  emit('close')
}

function emitBackdropClose(): void {
  if (props.closeOnBackdrop) emitClose()
}
</script>
