<template>
  <BaseModal
    :open="open"
    title="Restablecer contraseña"
    :description="`Define una nueva contraseña para ${userName}.`"
    size="md"
    :close-on-backdrop="!loading"
    @close="$emit('close')"
  >
    <form
      id="password-form"
      class="grid gap-4 md:grid-cols-2"
      novalidate
      @submit.prevent="submitForm"
    >
      <div class="grid gap-2">
        <label for="new-password" class="text-sm font-semibold text-slate-700"
          >Nueva contraseña</label
        >
        <input
          id="new-password"
          v-model="password"
          type="password"
          minlength="8"
          maxlength="100"
          autocomplete="new-password"
          class="h-11 rounded-xl border border-[#a7dbd8] px-3.5 text-sm outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
          placeholder="Mínimo 8 caracteres"
        />
      </div>
      <div class="grid gap-2">
        <label for="confirm-password" class="text-sm font-semibold text-slate-700"
          >Confirmar contraseña</label
        >
        <input
          id="confirm-password"
          v-model="confirmation"
          type="password"
          minlength="8"
          maxlength="100"
          autocomplete="new-password"
          class="h-11 rounded-xl border border-[#a7dbd8] px-3.5 text-sm outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
          placeholder="Repite la contraseña"
        />
      </div>
      <p
        v-if="error"
        class="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-700 md:col-span-2"
        role="alert"
      >
        {{ error }}
      </p>
    </form>

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
        form="password-form"
        type="submit"
        class="cursor-pointer rounded-lg bg-[#fa6900] px-5 py-2.5 text-sm font-bold text-[#202f33] transition hover:bg-[#f38630] disabled:cursor-wait disabled:opacity-60"
        :disabled="loading"
      >
        {{ loading ? 'Actualizando...' : 'Actualizar contraseña' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'

const props = withDefaults(
  defineProps<{ open: boolean; userName: string; loading?: boolean; serverError?: string }>(),
  { loading: false, serverError: '' },
)
const emit = defineEmits<{ close: []; submit: [password: string] }>()
const password = ref('')
const confirmation = ref('')
const error = ref('')

watch(
  () => [props.open, props.serverError] as const,
  ([open, serverError]) => {
    if (open && !serverError) {
      password.value = ''
      confirmation.value = ''
    }
    error.value = serverError
  },
  { immediate: true },
)

function submitForm(): void {
  error.value = ''
  if (password.value.length < 8) error.value = 'La contraseña debe tener al menos 8 caracteres.'
  else if (password.value !== confirmation.value) error.value = 'Las contraseñas no coinciden.'
  else emit('submit', password.value)
}
</script>
