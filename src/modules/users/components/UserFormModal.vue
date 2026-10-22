<template>
  <BaseModal
    :open="open"
    :title="mode === 'create' ? 'Crear usuario' : 'Editar usuario'"
    :description="
      mode === 'create'
        ? 'Registra una nueva cuenta de acceso.'
        : 'Actualiza los datos generales y el rol asignado.'
    "
    size="lg"
    :close-on-backdrop="!loading"
    @close="$emit('close')"
  >
    <form id="user-form" class="grid gap-4 md:grid-cols-2" novalidate @submit.prevent="submitForm">
      <div class="grid gap-2">
        <label for="user-name" class="text-sm font-semibold text-slate-700"
          >Nombre de usuario</label
        >
        <input
          id="user-name"
          v-model.trim="form.nombreUsuario"
          type="text"
          maxlength="50"
          autocomplete="username"
          :disabled="mode === 'edit'"
          class="h-11 rounded-xl border border-[#a7dbd8] px-3.5 text-sm text-slate-800 outline-none transition focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25 disabled:bg-slate-100 disabled:text-slate-500"
          placeholder="Ej. jperez"
        />
        <p v-if="errors.nombreUsuario" class="text-xs text-red-600">{{ errors.nombreUsuario }}</p>
        <p v-else-if="mode === 'create'" class="text-xs text-slate-400">
          Letras, números, punto, guion y guion bajo.
        </p>
      </div>

      <div class="grid gap-2">
        <label for="full-name" class="text-sm font-semibold text-slate-700">Nombre completo</label>
        <input
          id="full-name"
          v-model.trim="form.nombreCompleto"
          type="text"
          maxlength="150"
          autocomplete="name"
          class="h-11 rounded-xl border border-[#a7dbd8] px-3.5 text-sm text-slate-800 outline-none transition focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
          placeholder="Nombre y apellidos"
        />
        <p v-if="errors.nombreCompleto" class="text-xs text-red-600">{{ errors.nombreCompleto }}</p>
      </div>

      <div class="grid gap-2">
        <label for="role" class="text-sm font-semibold text-slate-700">Rol</label>
        <select
          id="role"
          v-model="form.idRol"
          class="h-11 cursor-pointer rounded-xl border border-[#a7dbd8] bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
        >
          <option :value="null" disabled>Selecciona un rol</option>
          <option v-for="role in roles" :key="role.idRol" :value="role.idRol">
            {{ role.nombre }}
          </option>
        </select>
        <p v-if="errors.idRol" class="text-xs text-red-600">{{ errors.idRol }}</p>
      </div>

      <div v-if="mode === 'create'" class="grid gap-2">
        <label for="password" class="text-sm font-semibold text-slate-700"
          >Contraseña temporal</label
        >
        <div class="relative">
          <input
            id="password"
            v-model="form.contrasena"
            :type="showPassword ? 'text' : 'password'"
            minlength="8"
            maxlength="100"
            autocomplete="new-password"
            class="h-11 w-full rounded-xl border border-[#a7dbd8] px-3.5 pr-12 text-sm text-slate-800 outline-none transition focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
            placeholder="Mínimo 8 caracteres"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-2 my-auto grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            @click="showPassword = !showPassword"
          >
            <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8" />
            </svg>
          </button>
        </div>
        <p v-if="errors.contrasena" class="text-xs text-red-600">{{ errors.contrasena }}</p>
      </div>

      <p
        v-if="serverError"
        class="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-700 md:col-span-2"
        role="alert"
      >
        {{ serverError }}
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
        form="user-form"
        type="submit"
        class="cursor-pointer rounded-lg bg-[#fa6900] px-5 py-2.5 text-sm font-bold text-[#202f33] transition hover:bg-[#f38630] disabled:cursor-wait disabled:opacity-60"
        :disabled="loading"
      >
        {{ loading ? 'Guardando...' : mode === 'create' ? 'Crear usuario' : 'Guardar cambios' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import type { Role, User, UserFormValues } from '@/modules/users/types/user.types'

const props = withDefaults(
  defineProps<{
    open: boolean
    mode: 'create' | 'edit'
    user?: User | null
    roles: Role[]
    loading?: boolean
    serverError?: string
  }>(),
  { user: null, loading: false, serverError: '' },
)

const emit = defineEmits<{ close: []; submit: [values: UserFormValues] }>()
const form = reactive<UserFormValues>({
  nombreUsuario: '',
  nombreCompleto: '',
  idRol: null,
  contrasena: '',
})
const errors = reactive<Record<keyof UserFormValues, string>>({
  nombreUsuario: '',
  nombreCompleto: '',
  idRol: '',
  contrasena: '',
})
const showPassword = ref(false)

watch(
  () => [props.open, props.user, props.mode] as const,
  ([open]) => {
    if (!open) return
    form.nombreUsuario = props.user?.nombreUsuario ?? ''
    form.nombreCompleto = props.user?.nombreCompleto ?? ''
    form.idRol = props.user?.idRol ?? null
    form.contrasena = ''
    showPassword.value = false
    clearErrors()
  },
  { immediate: true },
)

function submitForm(): void {
  clearErrors()

  if (props.mode === 'create') {
    if (!form.nombreUsuario) errors.nombreUsuario = 'El nombre de usuario es obligatorio.'
    else if (!/^[a-zA-Z0-9._-]+$/.test(form.nombreUsuario))
      errors.nombreUsuario = 'El formato del usuario no es válido.'
    if (form.contrasena.length < 8)
      errors.contrasena = 'La contraseña debe tener al menos 8 caracteres.'
  }

  if (!form.nombreCompleto) errors.nombreCompleto = 'El nombre completo es obligatorio.'
  if (!form.idRol) errors.idRol = 'Selecciona un rol.'
  if (Object.values(errors).some(Boolean)) return

  emit('submit', { ...form })
}

function clearErrors(): void {
  Object.keys(errors).forEach((key) => (errors[key as keyof UserFormValues] = ''))
}
</script>
