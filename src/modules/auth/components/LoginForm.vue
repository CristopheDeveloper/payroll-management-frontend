<template>
  <form class="grid gap-5 lg:gap-6" novalidate @submit.prevent="handleLogin">
    <div class="grid gap-2">
      <label class="text-sm font-semibold text-[#263b46] lg:text-base" for="username"
        >Usuario</label
      >
      <div class="relative flex items-center">
        <svg
          class="pointer-events-none absolute left-4 h-5 w-5 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.7" />
          <path
            d="M4.5 20c.8-4 3.3-6 7.5-6s6.7 2 7.5 6"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
          />
        </svg>
        <input
          id="username"
          v-model.trim="username"
          class="h-[3.35rem] w-full rounded-xl border border-[#a7dbd8] bg-white pr-4 pl-12 text-[#203f45] shadow-xs outline-none transition placeholder:text-slate-400 focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25 aria-invalid:border-red-300 lg:h-15 lg:text-base"
          type="text"
          autocomplete="username"
          placeholder="Ingresa tu usuario"
          :aria-invalid="!!usernameError"
          :aria-describedby="usernameError ? 'username-error' : undefined"
          @blur="validateUsername"
          @input="clearUsernameError"
        />
      </div>
      <p v-if="usernameError" id="username-error" class="m-0 text-xs text-red-600" role="alert">
        {{ usernameError }}
      </p>
    </div>

    <div class="grid gap-2">
      <label class="text-sm font-semibold text-[#263b46] lg:text-base" for="password"
        >Contraseña</label
      >
      <div class="relative flex items-center">
        <svg
          class="pointer-events-none absolute left-4 h-5 w-5 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="5"
            y="10"
            width="14"
            height="11"
            rx="2"
            stroke="currentColor"
            stroke-width="1.7"
          />
          <path
            d="M8 10V7a4 4 0 0 1 8 0v3"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
          />
        </svg>
        <input
          id="password"
          v-model="password"
          class="h-[3.35rem] w-full rounded-xl border border-[#a7dbd8] bg-white pr-12 pl-12 text-[#203f45] shadow-xs outline-none transition placeholder:text-slate-400 focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25 aria-invalid:border-red-300 lg:h-15 lg:text-base"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          placeholder="Ingresa tu contraseña"
          :aria-invalid="!!passwordError"
          :aria-describedby="passwordError ? 'password-error' : undefined"
          @blur="validatePassword"
          @input="clearPasswordError"
        />
        <button
          type="button"
          class="absolute right-3 grid h-8 w-8 cursor-pointer place-items-center rounded-md text-slate-500 transition hover:bg-[#a7dbd8]/50 hover:text-[#203f45]"
          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          :aria-pressed="showPassword"
          :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          @click="togglePassword"
        >
          <svg
            v-if="!showPassword"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8" />
          </svg>
          <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 3 21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            <path
              d="M9.8 6.3A10 10 0 0 1 12 6c6 0 9.5 6 9.5 6a13 13 0 0 1-3 3.4M6.2 8A13 13 0 0 0 2.5 12s3.5 6 9.5 6a10 10 0 0 0 3-.5"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
      <p v-if="passwordError" id="password-error" class="m-0 text-xs text-red-600" role="alert">
        {{ passwordError }}
      </p>
    </div>

    <p
      v-if="error"
      class="m-0 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
      aria-live="polite"
    >
      <svg class="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
        <path d="M12 8v5m0 3h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
      {{ error }}
    </p>

    <button
      type="submit"
      class="flex min-h-[3.35rem] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#fa6900] px-5 py-3 font-bold text-[#202f33] shadow-[0_10px_24px_rgb(250_105_0/0.22)] transition hover:-translate-y-px hover:bg-[#f38630] hover:shadow-[0_13px_28px_rgb(243_134_48/0.3)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#fa6900]/35 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0 lg:min-h-15 lg:text-base"
      :disabled="submitting"
    >
      <span>{{ submitting ? 'Ingresando...' : 'Iniciar sesión' }}</span>
      <svg
        v-if="submitting"
        class="h-5 w-5 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle class="opacity-30" cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>
      <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 12h14m-5-5 5 5-5 5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const submitting = ref(false)
const usernameError = ref('')
const passwordError = ref('')
const error = ref('')

function validateUsername(): boolean {
  usernameError.value = username.value ? '' : 'El usuario es obligatorio.'
  return !usernameError.value
}

function validatePassword(): boolean {
  passwordError.value = password.value ? '' : 'La contraseña es obligatoria.'
  return !passwordError.value
}

function clearUsernameError() {
  usernameError.value = ''
  error.value = ''
}

function clearPasswordError() {
  passwordError.value = ''
  error.value = ''
}

function togglePassword() {
  showPassword.value = !showPassword.value
}

async function handleLogin() {
  error.value = ''

  if (!validateUsername() || !validatePassword() || submitting.value) return

  submitting.value = true

  try {
    const authenticated = await authStore.login({
      username: username.value,
      password: password.value,
    })

    if (!authenticated) {
      error.value = 'Usuario o contraseña incorrectos.'
      return
    }

    await router.replace({ name: 'home' })
  } catch (loginError) {
    error.value =
      loginError instanceof Error ? loginError.message : 'No fue posible iniciar sesión.'
  } finally {
    submitting.value = false
  }
}
</script>
