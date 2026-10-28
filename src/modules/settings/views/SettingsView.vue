<template>
  <section class="w-full px-3 py-5 pb-28 sm:px-4 lg:px-5 lg:py-6 lg:pb-28 2xl:px-6">
    <header>
      <div
        class="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-[#b34700] uppercase"
      >
        <span class="h-px w-6 bg-[#fa6900]"></span>
        Sistema
      </div>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">Configuración</h1>
    </header>

    <div
      v-if="notice.message"
      class="mt-5 flex items-center justify-between gap-5 rounded-2xl border px-5 py-4 text-sm font-medium shadow-sm"
      :class="
        notice.type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-red-200 bg-red-50 text-red-700'
      "
      role="status"
    >
      <span>{{ notice.message }}</span>
      <button
        type="button"
        class="cursor-pointer font-bold"
        aria-label="Cerrar notificación"
        @click="notice.message = ''"
      >
        ×
      </button>
    </div>

    <div
      v-if="!isAdmin"
      class="mt-5 rounded-2xl border border-slate-300 bg-white px-6 py-12 text-center shadow-md shadow-slate-900/5"
    >
      <h2 class="font-bold text-slate-800">Sin acceso</h2>
      <p class="mt-1 text-sm text-slate-600">
        Solo el administrador puede ver y modificar la configuración.
      </p>
    </div>

    <div
      v-else-if="parametersQuery.isPending.value"
      class="mt-5 h-96 animate-pulse rounded-2xl bg-white"
    ></div>

    <div
      v-else-if="parametersQuery.error.value"
      class="mt-5 rounded-2xl border border-slate-300 bg-white px-6 py-12 text-center shadow-md shadow-slate-900/5"
    >
      <h2 class="font-bold text-slate-800">No fue posible cargar la configuración</h2>
      <p class="mt-1 text-sm text-slate-600">{{ errorMessage(parametersQuery.error.value) }}</p>
      <button
        type="button"
        class="mt-5 cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        @click="parametersQuery.refetch()"
      >
        Reintentar
      </button>
    </div>

    <form
      v-else
      id="settings-form"
      class="mt-5 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md shadow-slate-900/5"
      novalidate
      @submit.prevent="save"
    >
      <fieldset v-for="group in groups" :key="group.title">
        <legend
          class="w-full border-y border-slate-300 bg-[#e4f2f1] px-5 py-2.5 text-sm font-bold text-[#245f69] first-of-type:border-t-0"
        >
          {{ group.title }}
        </legend>
        <div class="grid gap-x-8 gap-y-3 p-5 lg:grid-cols-2">
          <div
            v-for="parameter in group.items"
            :key="parameter.idParametro"
            class="grid gap-1 sm:grid-cols-[11rem_1fr] sm:items-center sm:gap-3"
            :class="{ 'lg:col-span-2': isLongText(parameter) }"
          >
            <label
              :for="`param-${parameter.clave}`"
              class="text-sm text-slate-600"
              :title="parameter.descripcion"
              >{{ labelOf(parameter) }}</label
            >
            <div>
              <div class="relative" :class="isLongText(parameter) ? 'max-w-2xl' : 'max-w-48'">
                <span
                  v-if="infoOf(parameter).prefix"
                  class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-500"
                  >{{ infoOf(parameter).prefix }}</span
                >
                <input
                  :id="`param-${parameter.clave}`"
                  v-model.trim="drafts[parameter.idParametro]"
                  :type="parameter.tipoDato === 'TEXTO' ? 'text' : 'number'"
                  :step="parameter.tipoDato === 'ENTERO' ? '1' : 'any'"
                  :min="parameter.tipoDato === 'TEXTO' ? undefined : '0'"
                  :inputmode="
                    parameter.tipoDato === 'ENTERO' || infoOf(parameter).account
                      ? 'numeric'
                      : parameter.tipoDato === 'DECIMAL'
                        ? 'decimal'
                        : undefined
                  "
                  :maxlength="infoOf(parameter).account ? 4 : 100"
                  :placeholder="infoOf(parameter).account ? 'Ej. 2101' : undefined"
                  class="h-9 w-full rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none transition focus:ring-3"
                  :class="[
                    errors[parameter.idParametro]
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : changed(parameter)
                        ? 'border-[#fa6900] focus:border-[#fa6900] focus:ring-[#fa6900]/20'
                        : 'border-slate-300 focus:border-[#69d2e7] focus:ring-[#69d2e7]/25',
                    parameter.tipoDato === 'TEXTO' ? '' : 'text-right tabular-nums',
                    infoOf(parameter).prefix ? 'pl-8' : '',
                    infoOf(parameter).suffix ? 'pr-8' : '',
                  ]"
                  :aria-invalid="!!errors[parameter.idParametro]"
                  :aria-describedby="
                    errors[parameter.idParametro] ? `param-${parameter.clave}-error` : undefined
                  "
                />
                <span
                  v-if="infoOf(parameter).suffix"
                  class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-500"
                  >{{ infoOf(parameter).suffix }}</span
                >
              </div>
              <p
                v-if="errors[parameter.idParametro]"
                :id="`param-${parameter.clave}-error`"
                class="mt-1 text-xs text-red-600"
              >
                {{ errors[parameter.idParametro] }}
              </p>
            </div>
          </div>
        </div>
      </fieldset>
    </form>

    <div
      v-if="isAdmin && changedCount"
      class="fixed inset-x-0 bottom-0 z-20 border-t border-slate-300 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:left-[17rem]"
    >
      <div class="flex flex-wrap items-center justify-end gap-3">
        <p class="mr-auto text-sm text-slate-700">
          {{ changedCount === 1 ? '1 cambio sin salvar' : `${changedCount} cambios sin salvar` }}
        </p>
        <button
          type="button"
          class="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          :disabled="saving"
          @click="discard"
        >
          Descartar
        </button>
        <button
          form="settings-form"
          type="submit"
          class="cursor-pointer rounded-lg bg-[#fa6900] px-5 py-2.5 text-sm font-bold text-[#202f33] transition hover:bg-[#f38630] disabled:cursor-wait disabled:opacity-60"
          :disabled="saving"
        >
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import {
  useParameterMutation,
  useParametersQuery,
} from '@/modules/settings/composables/useSettings'
import type { SystemParameter } from '@/modules/settings/types/settings.types'

type ParameterInfo = {
  label: string
  group: string
  prefix?: string
  suffix?: string
  account?: boolean
}

const parameterInfo: Record<string, ParameterInfo> = {
  NOMBRE_EMPRESA: { label: 'Nombre de la empresa', group: 'company' },
  NIT_EMPRESA: { label: 'NIT', group: 'company' },
  DIRECCION_EMPRESA: { label: 'Dirección', group: 'company' },
  IGSS_LABORAL: { label: 'IGSS laboral', group: 'payroll', suffix: '%' },
  IGSS_PATRONAL: { label: 'IGSS patronal', group: 'payroll', suffix: '%' },
  FACTOR_HORA_EXTRA: { label: 'Factor de hora extra', group: 'payroll', suffix: '×' },
  DIAS_MES: { label: 'Días del mes', group: 'payroll' },
  HORAS_MES: { label: 'Horas del mes', group: 'payroll' },
  BONIFICACION_INCENTIVO: { label: 'Bonificación por defecto', group: 'employees', prefix: 'Q' },
  SALARIO_MINIMO: { label: 'Salario mínimo', group: 'employees', prefix: 'Q' },
  CUENTA_SUELDOS_POR_PAGAR: { label: 'Sueldos por pagar', group: 'accounting', account: true },
  CUENTA_IGSS_PATRONAL_POR_PAGAR: {
    label: 'IGSS patronal por pagar',
    group: 'accounting',
    account: true,
  },
}

const groupDefinitions = [
  { key: 'company', title: 'Empresa' },
  { key: 'payroll', title: 'Cálculo de la planilla' },
  { key: 'employees', title: 'Empleados' },
  { key: 'accounting', title: 'Contabilidad' },
  { key: 'other', title: 'Otros' },
]

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role === 'ADMIN')
const parametersQuery = useParametersQuery(isAdmin)
const mutation = useParameterMutation()

const drafts = reactive<Record<number, string>>({})
const errors = reactive<Record<number, string>>({})
const saving = ref(false)
const notice = reactive<{ type: 'success' | 'error'; message: string }>({
  type: 'success',
  message: '',
})

const parameters = computed(() => parametersQuery.data.value ?? [])
const groups = computed(() =>
  groupDefinitions
    .map((group) => ({
      ...group,
      items: parameters.value.filter(
        (parameter) => (parameterInfo[parameter.clave]?.group ?? 'other') === group.key,
      ),
    }))
    .filter((group) => group.items.length),
)
const changedParameters = computed(() => parameters.value.filter(changed))
const changedCount = computed(() => changedParameters.value.length)

watch(
  parameters,
  (items) => {
    for (const parameter of items)
      if (drafts[parameter.idParametro] === undefined)
        drafts[parameter.idParametro] = parameter.valor
  },
  { immediate: true },
)

function infoOf(parameter: SystemParameter): ParameterInfo {
  return parameterInfo[parameter.clave] ?? { label: parameter.clave, group: 'other' }
}

function labelOf(parameter: SystemParameter): string {
  return infoOf(parameter).label
}

function changed(parameter: SystemParameter): boolean {
  const draft = drafts[parameter.idParametro]
  return draft !== undefined && String(draft).trim() !== parameter.valor
}

function validate(parameter: SystemParameter): string {
  const value = String(drafts[parameter.idParametro] ?? '').trim()
  if (!value) return 'El valor es obligatorio.'
  if (parameter.tipoDato === 'ENTERO' && !/^\d+$/.test(value))
    return 'Debe ser un número entero mayor o igual a 0.'
  if (parameter.tipoDato === 'DECIMAL' && !/^\d+(\.\d+)?$/.test(value))
    return 'Debe ser un número mayor o igual a 0.'
  if (infoOf(parameter).account && !/^\d{4}$/.test(value))
    return 'La cuenta contable debe tener 4 dígitos.'
  return ''
}

function isLongText(parameter: SystemParameter): boolean {
  return parameter.tipoDato === 'TEXTO' && !infoOf(parameter).account
}

async function save(): Promise<void> {
  notice.message = ''
  for (const key of Object.keys(errors)) delete errors[Number(key)]
  const pending = changedParameters.value
  for (const parameter of pending) {
    const problem = validate(parameter)
    if (problem) errors[parameter.idParametro] = problem
  }
  if (Object.keys(errors).length) return

  saving.value = true
  let saved = 0
  for (const parameter of pending) {
    try {
      await mutation.mutateAsync({
        id: parameter.idParametro,
        payload: {
          valor: String(drafts[parameter.idParametro]).trim(),
          descripcion: parameter.descripcion,
        },
      })
      saved++
    } catch (error) {
      errors[parameter.idParametro] = errorMessage(error)
    }
  }
  saving.value = false
  await parametersQuery.refetch()
  for (const parameter of parameters.value) {
    if (!errors[parameter.idParametro]) drafts[parameter.idParametro] = parameter.valor
  }

  const failedLabels = pending
    .filter((parameter) => errors[parameter.idParametro])
    .map((parameter) => labelOf(parameter))
  if (!failedLabels.length) {
    notice.type = 'success'
    notice.message = saved === 1 ? 'Parámetro salvado.' : `${saved} parámetros salvados.`
  } else {
    notice.type = 'error'
    notice.message = `No se salvó: ${failedLabels.join(', ')}.${saved ? ' Los demás cambios sí se salvaron.' : ''}`
  }
}

function discard(): void {
  for (const parameter of parameters.value) drafts[parameter.idParametro] = parameter.valor
  for (const key of Object.keys(errors)) delete errors[Number(key)]
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
}
</script>
