<template>
  <BaseModal
    :open="open"
    :title="mode === 'create' ? 'Nuevo rubro' : 'Editar rubro'"
    :description="mode === 'create' ? '' : (concept?.codigo ?? '')"
    size="sm"
    :close-on-backdrop="!loading"
    @close="$emit('close')"
  >
    <form
      id="concept-form"
      class="grid gap-4 sm:grid-cols-2"
      novalidate
      @submit.prevent="submitForm"
    >
      <div v-if="mode === 'create'" class="grid gap-2">
        <label for="concept-code" class="text-sm font-semibold text-slate-700">Código</label>
        <input
          id="concept-code"
          v-model="form.codigo"
          :class="inputClass"
          class="uppercase"
          maxlength="30"
          placeholder="VIATICOS"
        />
      </div>
      <div v-if="mode === 'create'" class="grid gap-2">
        <label for="concept-type" class="text-sm font-semibold text-slate-700">Tipo</label>
        <select id="concept-type" v-model="form.tipo" :class="inputClass" class="cursor-pointer">
          <option value="INGRESO">Ingreso</option>
          <option value="DESCUENTO">Descuento</option>
        </select>
      </div>
      <div class="grid gap-2 sm:col-span-2">
        <label for="concept-name" class="text-sm font-semibold text-slate-700">Nombre</label>
        <input
          id="concept-name"
          v-model="form.nombre"
          :class="inputClass"
          maxlength="100"
          :disabled="isSystem"
        />
      </div>
      <div class="grid gap-2">
        <label for="concept-order" class="text-sm font-semibold text-slate-700">Orden</label>
        <input
          id="concept-order"
          v-model.number="form.orden"
          type="number"
          min="1"
          max="999"
          :class="inputClass"
          :disabled="isSystem"
        />
      </div>
      <div class="grid gap-2">
        <label for="concept-account" class="text-sm font-semibold text-slate-700"
          >Cuenta contable</label
        >
        <input
          id="concept-account"
          :value="form.cuentaContable ?? ''"
          :class="inputClass"
          inputmode="numeric"
          maxlength="4"
          placeholder="Ej. 5101"
          @input="onAccountInput"
        />
      </div>
      <label
        v-if="currentType === 'INGRESO'"
        class="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-slate-700 sm:col-span-2"
      >
        <input
          v-model="form.afectoIgss"
          type="checkbox"
          class="h-4 w-4 accent-[#fa6900] disabled:opacity-60"
          :disabled="mode === 'edit'"
        />
        Afecto al IGSS
      </label>
      <div class="grid gap-2 sm:col-span-2">
        <label for="concept-description" class="text-sm font-semibold text-slate-700"
          >Descripción</label
        >
        <input
          id="concept-description"
          v-model="form.descripcion"
          :class="inputClass"
          maxlength="250"
          :disabled="isSystem"
        />
      </div>

      <p
        v-if="error || serverError"
        class="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-700 sm:col-span-2"
        role="alert"
      >
        {{ error || serverError }}
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
        form="concept-form"
        type="submit"
        class="cursor-pointer rounded-lg bg-[#fa6900] px-5 py-2.5 text-sm font-bold text-[#202f33] transition hover:bg-[#f38630] disabled:cursor-wait disabled:opacity-60"
        :disabled="loading"
      >
        {{ loading ? 'Guardando...' : mode === 'create' ? 'Crear rubro' : 'Guardar' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import type { Concept, CreateConceptRequest } from '@/modules/concepts/types/concept.types'

const props = withDefaults(
  defineProps<{
    open: boolean
    mode: 'create' | 'edit'
    concept?: Concept | null
    loading?: boolean
    serverError?: string
  }>(),
  { concept: null, loading: false, serverError: '' },
)

const emit = defineEmits<{ close: []; submit: [values: CreateConceptRequest] }>()
const inputClass =
  'h-11 rounded-xl border border-[#a7dbd8] bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25 disabled:bg-slate-100 disabled:text-slate-600'
const form = reactive<CreateConceptRequest>({
  codigo: '',
  nombre: '',
  tipo: 'INGRESO',
  afectoIgss: false,
  orden: 150,
  descripcion: null,
  cuentaContable: null,
})
const error = ref('')
const currentType = computed(() => (props.mode === 'edit' ? props.concept?.tipo : form.tipo))
const isSystem = computed(() => props.mode === 'edit' && props.concept?.origen === 'SISTEMA')

watch(
  () => props.open,
  (open) => {
    if (!open) return
    error.value = ''
    const concept = props.concept
    form.codigo = concept?.codigo ?? ''
    form.nombre = concept?.nombre ?? ''
    form.tipo = concept?.tipo === 'DESCUENTO' ? 'DESCUENTO' : 'INGRESO'
    form.afectoIgss = concept?.afectoIgss ?? false
    form.orden = concept?.orden ?? 150
    form.descripcion = concept?.descripcion ?? null
    form.cuentaContable = concept?.cuentaContable ?? null
  },
  { immediate: true },
)

function onAccountInput(event: Event): void {
  const input = event.target as HTMLInputElement
  const digits = input.value.replace(/\D/g, '').slice(0, 4)
  input.value = digits
  form.cuentaContable = digits || null
}

function submitForm(): void {
  error.value = ''
  form.codigo = form.codigo.trim().toUpperCase()
  if (props.mode === 'create' && !/^[A-Z0-9_]+$/.test(form.codigo))
    error.value = 'El código solo puede tener letras mayúsculas sin tilde, números y guion bajo.'
  else if (!form.nombre.trim()) error.value = 'El nombre es obligatorio.'
  else if (!Number.isInteger(form.orden) || form.orden < 1 || form.orden > 999)
    error.value = 'El orden debe ser un número entero entre 1 y 999.'
  else if (form.cuentaContable && !/^\d{4}$/.test(form.cuentaContable))
    error.value = 'La cuenta contable debe tener 4 dígitos.'
  if (error.value) return

  emit('submit', {
    ...form,
    nombre: form.nombre.trim(),
    afectoIgss:
      props.mode === 'edit'
        ? (props.concept?.afectoIgss ?? false)
        : currentType.value === 'INGRESO' && form.afectoIgss,
    descripcion: form.descripcion?.trim() || null,
    cuentaContable: form.cuentaContable?.trim() || null,
  })
}
</script>
