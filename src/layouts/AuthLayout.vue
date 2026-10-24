<template>
  <div class="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(22.5rem,46%)_1fr]">
    <aside
      class="relative flex min-h-20 overflow-hidden bg-linear-to-br from-[#203f45] via-[#356f76] to-[#69d2e7] px-6 py-5 text-white lg:min-h-screen lg:flex-col lg:justify-between lg:p-[clamp(2rem,5vw,4.5rem)]"
      aria-label="Identidad del sistema"
    >
      <div
        class="pointer-events-none absolute -top-40 -right-28 h-80 w-80 rounded-full bg-[#a7dbd8]/25"
        aria-hidden="true"
      ></div>
      <div
        class="pointer-events-none absolute top-[44%] -left-24 hidden h-48 w-48 rounded-full bg-[#f69e3d]/10 lg:block"
        aria-hidden="true"
      ></div>
      <div
        class="pointer-events-none absolute -right-52 -bottom-60 hidden h-[31rem] w-[31rem] rounded-full border border-white/10 shadow-[0_0_0_5rem_rgb(255_255_255/0.025),0_0_0_10rem_rgb(255_255_255/0.02)] lg:block"
        aria-hidden="true"
      ></div>

      <div class="relative z-10 flex min-h-0 flex-col lg:min-h-[calc(100vh-10rem)]">
        <button
          type="button"
          class="group inline-flex w-fit cursor-pointer items-center rounded-xl text-inherit outline-none focus-visible:ring-3 focus-visible:ring-white/45"
          aria-label="Reiniciar formulario de inicio de sesión"
          title="Reiniciar formulario"
          @click="resetLoginForm"
        >
          <span
            class="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#0e3441] shadow-[0_10px_30px_rgb(0_0_0/0.12)] transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_34px_rgb(0_0_0/0.18)] group-active:translate-y-0 lg:h-12 lg:w-12"
          >
            <svg class="h-7 w-7 lg:h-8 lg:w-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
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
          </span>
        </button>

        <div class="mt-auto mb-10 hidden max-w-xl lg:block">
          <h1
            class="m-0 text-[clamp(2.2rem,4vw,4.2rem)] leading-[1.05] font-bold tracking-[-0.055em]"
          >
            Bienvenido
          </h1>
          <p class="mt-6 max-w-lg text-[clamp(.98rem,1.35vw,1.1rem)] leading-7 text-white/70">
            Accede al sistema con tus credenciales.
          </p>
        </div>
      </div>

      <p class="relative z-10 mt-12 hidden text-xs text-white/40 lg:block">
        © {{ currentYear }} · Todos los derechos reservados
      </p>
    </aside>

    <main
      class="flex min-h-[calc(100vh-5rem)] min-w-0 flex-col bg-[#f7f8f0] px-6 py-10 lg:min-h-screen lg:p-[clamp(2rem,5vw,5rem)]"
    >
      <div class="grid flex-1 place-items-center">
        <RouterView :key="loginFormKey" />
      </div>

      <footer class="mt-10 flex justify-between text-[.68rem] text-slate-400 lg:hidden">
        <span>© {{ currentYear }}</span>
        <span>Acceso seguro</span>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'

const currentYear = new Date().getFullYear()
const loginFormKey = ref(0)

function resetLoginForm(): void {
  loginFormKey.value += 1
}
</script>
