<template>
  <section
    class="mx-auto w-full max-w-[29rem] lg:max-w-[32rem] xl:max-w-[35rem]"
    aria-labelledby="login-title"
  >
    <div class="mb-9 lg:mb-11">
      <span
        class="mb-4 inline-flex items-center gap-2 rounded-full bg-[#69d2e7]/15 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#267e91]"
      >
        <span class="h-2 w-2 rounded-full bg-[#f38630]"></span>
        ACCESO AL SISTEMA
      </span>
      <h2
        id="login-title"
        class="text-4xl font-bold tracking-tight text-[#203f45] sm:text-5xl xl:text-[3.5rem]"
      >
        Bienvenido<span class="text-[#fa6900]">.</span>
      </h2>
      <p class="mt-3 text-sm leading-relaxed text-slate-500 lg:text-base">
        Ingresa tus credenciales para continuar.
      </p>
    </div>

    <LoginForm />

    <div
      class="mt-8 flex items-center gap-3 rounded-xl border border-[#a7dbd8]/60 bg-[#e0e4cc]/25 px-4 py-3 lg:mt-10 lg:px-5 lg:py-4"
    >
      <svg
        class="h-5 w-5 shrink-0 text-[#267e91]"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 3 5 6v5c0 4.5 2.9 8.1 7 10 4.1-1.9 7-5.5 7-10V6l-7-3Z"
          stroke="currentColor"
          stroke-width="1.8"
        />
        <path
          d="m9 12 2 2 4-4"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <p class="text-xs text-[#54747a]">Acceso exclusivo para usuarios autorizados.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import LoginForm from '@/modules/auth/components/LoginForm.vue'
</script>
