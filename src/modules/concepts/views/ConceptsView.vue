<template>
  <section class="w-full px-3 py-5 sm:px-4 lg:px-5 lg:py-6 2xl:px-6">
    <header class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div
          class="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-[#b34700] uppercase"
        >
        </div>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">Rubros</h1>
      </div>
      <button
        v-if="isAdmin"
        type="button"
        class="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#fa6900] px-5 text-sm font-bold text-[#202f33] shadow-lg shadow-[#fa6900]/20 transition hover:-translate-y-0.5 hover:bg-[#f38630] hover:shadow-[#f38630]/30"
        @click="openCreate"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        Nuevo rubro
      </button>
    </header>

    <div
      v-if="notice.message"
      class="mt-5 flex items-center justify-between gap-5 rounded-2xl border px-5 py-4 text-base font-medium shadow-sm"
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
      class="mt-5 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md shadow-slate-900/5"
    >
      <div class="grid gap-3 border-b border-slate-300 p-3 sm:p-4 md:grid-cols-[1fr_12rem_12rem]">
        <input
          v-model="search"
          type="search"
          class="h-11 rounded-xl border border-[#a7dbd8] px-4 text-sm outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
          placeholder="Buscar por código o nombre..."
          aria-label="Buscar rubros"
        />
        <select v-model="typeFilter" :class="selectClass" aria-label="Filtrar por tipo">
          <option value="all">Todos los tipos</option>
          <option value="INGRESO">Ingresos</option>
          <option value="DESCUENTO">Descuentos</option>
          <option value="PATRONAL">Patronales</option>
        </select>
        <select v-model="originFilter" :class="selectClass" aria-label="Filtrar por origen">
          <option value="all">Sistema y manuales</option>
          <option value="SISTEMA">Solo del sistema</option>
          <option value="MANUAL">Solo manuales</option>
        </select>
      </div>

      <div v-if="conceptsQuery.isPending.value" class="grid gap-3 p-5">
        <div v-for="item in 5" :key="item" class="h-12 animate-pulse rounded-xl bg-slate-100"></div>
      </div>
      <div
        v-else-if="conceptsQuery.error.value"
        class="grid place-items-center px-6 py-16 text-center"
      >
        <h2 class="font-bold text-slate-800">No fue posible cargar los rubros</h2>
        <p class="mt-1 text-sm text-slate-500">{{ getErrorMessage(conceptsQuery.error.value) }}</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[60rem] border-collapse text-left text-sm">
          <thead class="bg-[#e4f2f1] text-xs font-bold tracking-wider text-[#245f69] uppercase">
            <tr>
              <th class="px-4 py-3.5 text-right">Orden</th>
              <th class="px-4 py-3.5">Rubro</th>
              <th class="px-4 py-3.5">Tipo</th>
              <th class="px-4 py-3.5">Origen</th>
              <th class="px-4 py-3.5">Afecto IGSS</th>
              <th class="px-4 py-3.5">Cuenta</th>
              <th class="px-4 py-3.5">Estado</th>
              <th v-if="isAdmin" class="px-4 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="concept in filtered"
              :key="concept.idRubro"
              class="transition hover:bg-slate-50/80"
              :class="{ 'opacity-60': !concept.activo }"
            >
              <td class="px-4 py-3 text-right text-slate-500 tabular-nums">{{ concept.orden }}</td>
              <td class="px-4 py-3 font-semibold text-slate-800" :title="concept.codigo">
                {{ concept.nombre }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="rounded-lg px-2 py-0.5 text-xs font-bold"
                  :class="typeClasses[concept.tipo]"
                  >{{ typeLabels[concept.tipo] }}</span
                >
              </td>
              <td class="px-4 py-3 text-slate-700">
                {{ concept.origen === 'SISTEMA' ? 'Sistema' : 'Manual' }}
              </td>
              <td class="px-4 py-3 text-slate-700">
                {{ concept.tipo === 'INGRESO' ? (concept.afectoIgss ? 'Sí' : 'No') : '' }}
              </td>
              <td class="px-4 py-3 text-slate-700 tabular-nums">{{ concept.cuentaContable }}</td>
              <td class="px-4 py-3 text-slate-700">
                {{ concept.activo ? 'Activo' : 'Inactivo' }}
              </td>
              <td v-if="isAdmin" class="px-4 py-3">
                <div class="flex justify-end gap-1">
                  <button
                    v-if="concept.origen === 'MANUAL'"
                    type="button"
                    class="h-9 cursor-pointer rounded-lg px-3 text-xs font-bold transition"
                    :class="
                      concept.activo
                        ? 'text-slate-500 hover:bg-red-50 hover:text-red-600'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    "
                    @click="askStatus(concept)"
                  >
                    {{ concept.activo ? 'Desactivar' : 'Activar' }}
                  </button>
                  <button
                    type="button"
                    class="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-[#f38630] hover:text-[#202f33]"
                    title="Editar rubro"
                    aria-label="Editar rubro"
                    @click="openEdit(concept)"
                  >
                    <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="m14 5 5 5M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <ConceptFormModal
    :open="formOpen"
    :mode="formMode"
    :concept="selected"
    :loading="createMutation.isPending.value || updateMutation.isPending.value"
    :server-error="formError"
    @close="formOpen = false"
    @submit="saveConcept"
  />
  <ConfirmDialog
    :open="statusOpen"
    :title="selected?.activo ? 'Desactivar rubro' : 'Activar rubro'"
    :description="selected?.nombre ?? ''"
    :message="
      selected?.activo
        ? 'No se podrá capturar en planillas nuevas.'
        : 'Se podrá capturar en las planillas preparadas.'
    "
    :confirm-label="selected?.activo ? 'Desactivar' : 'Activar'"
    :danger="selected?.activo"
    :loading="statusMutation.isPending.value"
    @close="statusOpen = false"
    @confirm="changeStatus"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ConceptFormModal from '@/modules/concepts/components/ConceptFormModal.vue'
import { useConceptMutations, useConceptsQuery } from '@/modules/concepts/composables/useConcepts'
import type {
  Concept,
  ConceptType,
  CreateConceptRequest,
} from '@/modules/concepts/types/concept.types'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const authStore = useAuthStore()
const conceptsQuery = useConceptsQuery()
const { createMutation, updateMutation, statusMutation } = useConceptMutations()

const selectClass =
  'h-11 cursor-pointer rounded-xl border border-[#a7dbd8] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25'
const typeLabels: Record<ConceptType, string> = {
  INGRESO: 'Ingreso',
  DESCUENTO: 'Descuento',
  PATRONAL: 'Patronal',
}
const typeClasses: Record<ConceptType, string> = {
  INGRESO: 'bg-[#69d2e7]/20 text-[#245f69]',
  DESCUENTO: 'bg-amber-50 text-amber-700',
  PATRONAL: 'bg-slate-100 text-slate-600',
}
const search = ref('')
const typeFilter = ref('all')
const originFilter = ref('all')
const formOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formError = ref('')
const statusOpen = ref(false)
const selected = ref<Concept | null>(null)
const notice = reactive<{ type: 'success' | 'error'; message: string }>({
  type: 'success',
  message: '',
})

const isAdmin = computed(() => authStore.user?.role === 'ADMIN')
const filtered = computed(() => {
  const term = search.value.trim().toLocaleLowerCase()
  return (conceptsQuery.data.value ?? []).filter(
    (concept) =>
      (!term || `${concept.codigo} ${concept.nombre}`.toLocaleLowerCase().includes(term)) &&
      (typeFilter.value === 'all' || concept.tipo === typeFilter.value) &&
      (originFilter.value === 'all' || concept.origen === originFilter.value),
  )
})

function openCreate(): void {
  formMode.value = 'create'
  selected.value = null
  formError.value = ''
  formOpen.value = true
}

function openEdit(concept: Concept): void {
  formMode.value = 'edit'
  selected.value = concept
  formError.value = ''
  formOpen.value = true
}

async function saveConcept(values: CreateConceptRequest): Promise<void> {
  formError.value = ''
  try {
    if (formMode.value === 'create') {
      const created = await createMutation.mutateAsync(values)
      showNotice('success', `Rubro ${created.nombre} creado.`)
    } else if (selected.value) {
      await updateMutation.mutateAsync({
        id: selected.value.idRubro,
        payload: {
          nombre: values.nombre,
          afectoIgss: values.afectoIgss,
          orden: values.orden,
          descripcion: values.descripcion,
          cuentaContable: values.cuentaContable,
        },
      })
      showNotice('success', 'Rubro actualizado.')
    }
    formOpen.value = false
  } catch (error) {
    formError.value = getErrorMessage(error)
  }
}

function askStatus(concept: Concept): void {
  selected.value = concept
  statusOpen.value = true
}

async function changeStatus(): Promise<void> {
  if (!selected.value) return
  try {
    await statusMutation.mutateAsync({
      id: selected.value.idRubro,
      activate: !selected.value.activo,
    })
    showNotice('success', `Rubro ${selected.value.activo ? 'desactivado' : 'activado'}.`)
  } catch (error) {
    showNotice('error', getErrorMessage(error))
  }
  statusOpen.value = false
}

function showNotice(type: 'success' | 'error', message: string): void {
  notice.type = type
  notice.message = message
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
}
</script>
