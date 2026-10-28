<template>
  <BaseModal
    :open="open"
    :title="mode === 'create' ? 'Crear departamento' : 'Editar departamento'"
    :description="
      mode === 'create'
        ? 'Registra una nueva área de la empresa.'
        : 'Actualiza el nombre y la descripción del departamento.'
    "
    size="sm"
    :close-on-backdrop="!loading"
    @close="$emit('close')"
  >
    <form id="department-form" class="grid gap-4" novalidate @submit.prevent="submitForm">
      <div class="grid gap-2">
        <label for="department-name" class="text-sm font-semibold text-slate-700">Nombre</label>
        <input
          id="department-name"
          v-model.trim="form.nombre"
          type="text"
          maxlength="100"
          class="h-11 rounded-xl border border-[#a7dbd8] px-3.5 text-sm text-slate-800 outline-none transition focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
          placeholder="Ej. Contabilidad"
        />
        <p v-if="errors.nombre" class="text-xs text-red-600">{{ errors.nombre }}</p>
      </div>

      <div class="grid gap-2">
        <label for="department-description" class="text-sm font-semibold text-slate-700"
          >Descripción</label
        >
        <textarea
          id="department-description"
          v-model.trim="form.descripcion"
          rows="3"
          maxlength="200"
          class="resize-none rounded-xl border border-[#a7dbd8] px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
          placeholder="Opcional"
        ></textarea>
        <p v-if="errors.descripcion" class="text-xs text-red-600">{{ errors.descripcion }}</p>
        <p v-else class="text-xs text-slate-400">{{ form.descripcion.length }}/200 caracteres.</p>
      </div>

      <p
        v-if="serverError"
        class="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-700"
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
        form="department-form"
        type="submit"
        class="cursor-pointer rounded-lg bg-[#fa6900] px-5 py-2.5 text-sm font-bold text-[#202f33] transition hover:bg-[#f38630] disabled:cursor-wait disabled:opacity-60"
        :disabled="loading"
      >
        {{
          loading ? 'Guardando...' : mode === 'create' ? 'Crear departamento' : 'Guardar cambios'
        }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import type { Department, DepartmentFormValues } from '@/modules/departments/types/department.types'

const props = withDefaults(
  defineProps<{
    open: boolean
    mode: 'create' | 'edit'
    department?: Department | null
    loading?: boolean
    serverError?: string
  }>(),
  { department: null, loading: false, serverError: '' },
)

const emit = defineEmits<{ close: []; submit: [values: DepartmentFormValues] }>()
const form = reactive<DepartmentFormValues>({ nombre: '', descripcion: '' })
const errors = reactive<Record<keyof DepartmentFormValues, string>>({
  nombre: '',
  descripcion: '',
})

watch(
  () => [props.open, props.department, props.mode] as const,
  ([open]) => {
    if (!open) return
    form.nombre = props.department?.nombre ?? ''
    form.descripcion = props.department?.descripcion ?? ''
    clearErrors()
  },
  { immediate: true },
)

function submitForm(): void {
  clearErrors()

  if (!form.nombre) errors.nombre = 'El nombre es obligatorio.'
  else if (form.nombre.length > 100)
    errors.nombre = 'El nombre debe tener como máximo 100 caracteres.'
  if (form.descripcion.length > 200)
    errors.descripcion = 'La descripción debe tener como máximo 200 caracteres.'
  if (Object.values(errors).some(Boolean)) return

  emit('submit', { ...form })
}

function clearErrors(): void {
  Object.keys(errors).forEach((key) => (errors[key as keyof DepartmentFormValues] = ''))
}
</script>
