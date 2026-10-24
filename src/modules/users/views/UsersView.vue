<template>
  <section class="w-full px-3 py-5 sm:px-4 lg:px-5 lg:py-6 2xl:px-6">
    <header class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div
          class="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-[#d95800] uppercase"
        >
          <span class="h-px w-6 bg-[#fa6900]"></span>
          Administración
        </div>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">Usuarios</h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Administra las cuentas, roles, contraseñas y estados de acceso al sistema.
        </p>
      </div>
      <Button
        label="Nuevo usuario"
        icon="pi pi-user-plus"
        class="min-h-11 shadow-lg shadow-orange-500/20"
        @click="openCreate"
      />
    </header>

    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="-translate-y-2 opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="notice.message"
        class="mt-5 flex items-center justify-between gap-5 rounded-2xl border px-5 py-4 text-base font-medium shadow-sm sm:px-6 sm:py-5"
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
    </Transition>

    <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="font-bold text-slate-800">Directorio de usuarios</h2>
            <p class="mt-1 text-sm text-slate-500">
              Busca, ordena y administra los accesos desde una sola tabla.
            </p>
          </div>
          <span class="mt-2 text-xs font-semibold tracking-wide text-slate-400 uppercase sm:mt-0">
            Los datos se actualizan desde el servidor
          </span>
        </div>

        <div class="grid gap-3 md:grid-cols-[minmax(16rem,1fr)_13rem_13rem_auto]">
          <label class="relative block">
            <span class="sr-only">Buscar usuarios</span>
            <i
              class="pi pi-search pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-sm text-slate-400"
              aria-hidden="true"
            ></i>
            <InputText
              v-model="search"
              type="search"
              class="w-full pl-10"
              placeholder="Buscar por usuario o nombre..."
            />
          </label>
          <Select
            v-model="roleFilter"
            :options="roleOptions"
            option-label="label"
            option-value="value"
            class="w-full"
            aria-label="Filtrar por rol"
          />
          <Select
            v-model="statusFilter"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            class="w-full"
            aria-label="Filtrar por estado"
          />
          <Button
            label="Actualizar"
            icon="pi pi-refresh"
            severity="secondary"
            variant="outlined"
            :disabled="isFetching"
            :loading="isFetching"
            @click="refetch"
          />
        </div>
      </div>

      <div v-if="queryError" class="grid place-items-center px-6 py-16 text-center">
        <div class="grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-500">
          <span class="text-xl font-bold">!</span>
        </div>
        <h2 class="mt-4 font-bold text-slate-800">No fue posible cargar los usuarios</h2>
        <p class="mt-1 text-sm text-slate-500">{{ getErrorMessage(queryError) }}</p>
        <Button class="mt-5" label="Reintentar" icon="pi pi-refresh" @click="refetch" />
      </div>
      <DataTable
        v-else
        :value="filteredUsers"
        data-key="idUsuario"
        :loading="isPending"
        paginator
        :rows="10"
        :rows-per-page-options="[5, 10, 20, 50]"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        current-page-report-template="Mostrando {first} a {last} de {totalRecords} usuarios"
        removable-sort
        sort-mode="multiple"
        striped-rows
        row-hover
        scrollable
        table-style="min-width: 58rem"
        class="users-table"
      >
        <template #empty>
          <div class="grid place-items-center px-6 py-14 text-center">
            <div class="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <i class="pi pi-users text-2xl" aria-hidden="true"></i>
            </div>
            <h3 class="mt-4 font-bold text-slate-800">No hay usuarios para mostrar</h3>
            <p class="mt-1 text-sm text-slate-500">
              Ajusta los filtros o registra un nuevo usuario.
            </p>
          </div>
        </template>

        <Column field="nombreCompleto" header="Usuario" sortable style="min-width: 18rem">
          <template #body="{ data: user }">
            <div class="flex items-center gap-3">
              <Avatar
                :label="initials(user.nombreCompleto)"
                shape="circle"
                class="shrink-0 bg-[#a7dbd8]! font-bold! text-[#203f45]!"
              />
              <div class="min-w-0">
                <p class="truncate font-semibold text-slate-800">{{ user.nombreCompleto }}</p>
                <p class="mt-0.5 truncate text-xs text-slate-500">@{{ user.nombreUsuario }}</p>
              </div>
            </div>
          </template>
        </Column>
        <Column field="rol" header="Rol" sortable style="min-width: 10rem">
          <template #body="{ data: user }">
            <Tag :value="user.rol" severity="info" />
          </template>
        </Column>
        <Column field="activo" header="Estado" sortable style="min-width: 9rem">
          <template #body="{ data: user }">
            <Tag
              :value="user.activo ? 'Activo' : 'Inactivo'"
              :severity="user.activo ? 'success' : 'secondary'"
              :icon="user.activo ? 'pi pi-check-circle' : 'pi pi-minus-circle'"
            />
          </template>
        </Column>
        <Column field="ultimoAcceso" header="Último acceso" sortable style="min-width: 13rem">
          <template #body="{ data: user }">
            <span class="text-sm text-slate-600">{{ formatDate(user.ultimoAcceso) }}</span>
          </template>
        </Column>
        <Column header="Acciones" frozen align-frozen="right" style="width: 10rem">
          <template #body="{ data: user }">
            <div class="flex justify-end gap-1">
              <Button
                icon="pi pi-pencil"
                severity="secondary"
                variant="text"
                rounded
                title="Editar usuario"
                aria-label="Editar usuario"
                @click="openEdit(user)"
              />
              <Button
                icon="pi pi-key"
                severity="secondary"
                variant="text"
                rounded
                title="Restablecer contraseña"
                aria-label="Restablecer contraseña"
                @click="openPassword(user)"
              />
              <Button
                icon="pi pi-power-off"
                :severity="user.activo ? 'danger' : 'success'"
                variant="text"
                rounded
                :title="user.activo ? 'Desactivar usuario' : 'Activar usuario'"
                :aria-label="user.activo ? 'Desactivar usuario' : 'Activar usuario'"
                @click="openStatus(user)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </section>

  <UserFormModal
    :open="formOpen"
    :mode="formMode"
    :user="selectedUser"
    :roles="roles"
    :loading="formLoading"
    :server-error="formError"
    @close="formOpen = false"
    @submit="saveUser"
  />
  <ResetPasswordModal
    :open="passwordOpen"
    :user-name="selectedUser?.nombreUsuario ?? ''"
    :loading="resetPasswordMutation.isPending.value"
    :server-error="passwordError"
    @close="passwordOpen = false"
    @submit="savePassword"
  />
  <ConfirmDialog
    :open="statusOpen"
    :title="selectedUser?.activo ? 'Desactivar usuario' : 'Activar usuario'"
    :description="selectedUser?.nombreCompleto"
    :message="
      selectedUser?.activo
        ? 'El usuario perderá acceso al sistema hasta que vuelva a activarse.'
        : 'El usuario recuperará el acceso al sistema.'
    "
    :confirm-label="selectedUser?.activo ? 'Desactivar' : 'Activar'"
    :danger="selectedUser?.activo"
    :loading="statusMutation.isPending.value"
    @close="statusOpen = false"
    @confirm="changeStatus"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import UserFormModal from '@/modules/users/components/UserFormModal.vue'
import ResetPasswordModal from '@/modules/users/components/ResetPasswordModal.vue'
import {
  useRolesQuery,
  useUserMutations,
  useUsersQuery,
  userKeys,
} from '@/modules/users/composables/useUsers'
import * as userService from '@/modules/users/services/user.service'
import type { User, UserFormValues } from '@/modules/users/types/user.types'

const queryClient = useQueryClient()
const usersQuery = useUsersQuery()
const rolesQuery = useRolesQuery()
const { createMutation, updateMutation, resetPasswordMutation, statusMutation } = useUserMutations()

const search = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')
const formOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formError = ref('')
const passwordOpen = ref(false)
const passwordError = ref('')
const statusOpen = ref(false)
const selectedUser = ref<User | null>(null)
const notice = reactive<{ type: 'success' | 'error'; message: string }>({
  type: 'success',
  message: '',
})

const users = computed(() => usersQuery.data.value ?? [])
const roles = computed(() => rolesQuery.data.value ?? [])
const isPending = computed(() => usersQuery.isPending.value)
const isFetching = computed(() => usersQuery.isFetching.value)
const queryError = computed(() => usersQuery.error.value)
const formLoading = computed(() => createMutation.isPending.value || updateMutation.isPending.value)
const roleOptions = computed(() => [
  { label: 'Todos los roles', value: 'all' },
  ...roles.value.map((role) => ({ label: role.nombre, value: String(role.idRol) })),
])
const statusOptions = [
  { label: 'Todos los estados', value: 'all' },
  { label: 'Activos', value: 'active' },
  { label: 'Inactivos', value: 'inactive' },
]
const filteredUsers = computed(() => {
  const term = search.value.trim().toLocaleLowerCase()
  return users.value.filter((user) => {
    const matchesSearch =
      !term || `${user.nombreUsuario} ${user.nombreCompleto}`.toLocaleLowerCase().includes(term)
    const matchesRole = roleFilter.value === 'all' || String(user.idRol) === roleFilter.value
    const matchesStatus =
      statusFilter.value === 'all' || (statusFilter.value === 'active' ? user.activo : !user.activo)
    return matchesSearch && matchesRole && matchesStatus
  })
})

function openCreate(): void {
  formMode.value = 'create'
  selectedUser.value = null
  formError.value = ''
  formOpen.value = true
}

async function openEdit(user: User): Promise<void> {
  formError.value = ''
  try {
    selectedUser.value = await queryClient.fetchQuery({
      queryKey: userKeys.detail(user.idUsuario),
      queryFn: () => userService.getUser(user.idUsuario),
    })
    formMode.value = 'edit'
    formOpen.value = true
  } catch (error) {
    showNotice('error', getErrorMessage(error))
  }
}

async function saveUser(values: UserFormValues): Promise<void> {
  formError.value = ''
  try {
    if (formMode.value === 'create') {
      await createMutation.mutateAsync({
        nombreUsuario: values.nombreUsuario,
        nombreCompleto: values.nombreCompleto,
        idRol: values.idRol!,
        contrasena: values.contrasena,
      })
      showNotice('success', 'Usuario creado correctamente.')
    } else if (selectedUser.value) {
      await updateMutation.mutateAsync({
        id: selectedUser.value.idUsuario,
        payload: { nombreCompleto: values.nombreCompleto, idRol: values.idRol! },
      })
      showNotice('success', 'Usuario actualizado correctamente.')
    }
    formOpen.value = false
  } catch (error) {
    formError.value = getErrorMessage(error)
  }
}

function openPassword(user: User): void {
  selectedUser.value = user
  passwordError.value = ''
  passwordOpen.value = true
}

async function savePassword(password: string): Promise<void> {
  if (!selectedUser.value) return
  passwordError.value = ''
  try {
    await resetPasswordMutation.mutateAsync({
      id: selectedUser.value.idUsuario,
      contrasena: password,
    })
    passwordOpen.value = false
    showNotice('success', 'Contraseña actualizada correctamente.')
  } catch (error) {
    passwordError.value = getErrorMessage(error)
  }
}

function openStatus(user: User): void {
  selectedUser.value = user
  statusOpen.value = true
}

async function changeStatus(): Promise<void> {
  if (!selectedUser.value) return
  try {
    const activate = !selectedUser.value.activo
    await statusMutation.mutateAsync({ id: selectedUser.value.idUsuario, activate })
    statusOpen.value = false
    showNotice(
      'success',
      activate ? 'Usuario activado correctamente.' : 'Usuario desactivado correctamente.',
    )
  } catch (error) {
    statusOpen.value = false
    showNotice('error', getErrorMessage(error))
  }
}

function showNotice(type: 'success' | 'error', message: string): void {
  notice.type = type
  notice.message = message
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function formatDate(value: string | null): string {
  if (!value) return 'Sin acceso registrado'
  return new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
}

function refetch(): void {
  void usersQuery.refetch()
}
</script>
