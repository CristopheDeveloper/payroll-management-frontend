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
      <button
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
        Nuevo usuario
      </button>
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

    <div class="mt-5 grid gap-3 sm:grid-cols-3">
      <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-bold tracking-wider text-slate-400 uppercase">Total de usuarios</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ users.length }}</p>
      </article>
      <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-bold tracking-wider text-slate-400 uppercase">Usuarios activos</p>
        <p class="mt-2 text-3xl font-bold text-emerald-600">{{ activeUsers }}</p>
      </article>
      <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-bold tracking-wider text-slate-400 uppercase">Roles disponibles</p>
        <p class="mt-2 text-3xl font-bold text-[#d95800]">{{ roles.length }}</p>
      </article>
    </div>

    <div class="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        class="grid gap-3 border-b border-slate-200 p-3 sm:p-4 md:grid-cols-[minmax(16rem,1fr)_12rem_12rem_auto]"
      >
        <label class="relative block">
          <span class="sr-only">Buscar usuarios</span>
          <svg
            class="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" />
            <path d="m16 16 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <input
            v-model="search"
            type="search"
            class="h-11 w-full rounded-xl border border-[#a7dbd8] pr-4 pl-10 text-sm outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
            placeholder="Buscar por usuario o nombre..."
          />
        </label>
        <select
          v-model="roleFilter"
          class="h-11 cursor-pointer rounded-xl border border-[#a7dbd8] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
          aria-label="Filtrar por rol"
        >
          <option value="all">Todos los roles</option>
          <option v-for="role in roles" :key="role.idRol" :value="String(role.idRol)">
            {{ role.nombre }}
          </option>
        </select>
        <select
          v-model="statusFilter"
          class="h-11 cursor-pointer rounded-xl border border-[#a7dbd8] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#69d2e7] focus:ring-3 focus:ring-[#69d2e7]/25"
          aria-label="Filtrar por estado"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <button
          type="button"
          class="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-50"
          :disabled="isFetching"
          @click="refetch"
        >
          <svg
            class="h-4 w-4"
            :class="{ 'animate-spin': isFetching }"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Actualizar
        </button>
      </div>

      <div v-if="isPending" class="grid gap-3 p-5" aria-label="Cargando usuarios">
        <div v-for="item in 5" :key="item" class="h-16 animate-pulse rounded-xl bg-slate-100"></div>
      </div>

      <div v-else-if="queryError" class="grid place-items-center px-6 py-16 text-center">
        <div class="grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-500">
          <span class="text-xl font-bold">!</span>
        </div>
        <h2 class="mt-4 font-bold text-slate-800">No fue posible cargar los usuarios</h2>
        <p class="mt-1 text-sm text-slate-500">{{ getErrorMessage(queryError) }}</p>
        <button
          type="button"
          class="mt-5 cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          @click="refetch"
        >
          Reintentar
        </button>
      </div>

      <div
        v-else-if="filteredUsers.length === 0"
        class="grid place-items-center px-6 py-16 text-center"
      >
        <div class="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="9" cy="8" r="4" stroke="currentColor" stroke-width="1.7" />
            <path
              d="M2.5 20c.7-4 2.9-6 6.5-6s5.8 2 6.5 6M17 8h5m-2.5-2.5v5"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <h2 class="mt-4 font-bold text-slate-800">No hay usuarios para mostrar</h2>
        <p class="mt-1 text-sm text-slate-500">Ajusta los filtros o registra un nuevo usuario.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[58rem] border-collapse text-left">
          <thead class="bg-slate-50 text-xs font-bold tracking-wider text-slate-500 uppercase">
            <tr>
              <th class="px-5 py-3.5">Usuario</th>
              <th class="px-5 py-3.5">Rol</th>
              <th class="px-5 py-3.5">Estado</th>
              <th class="px-5 py-3.5">Último acceso</th>
              <th class="px-5 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="user in paginatedUsers"
              :key="user.idUsuario"
              class="transition hover:bg-slate-50/80"
            >
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <span
                    class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#a7dbd8] text-sm font-bold text-[#203f45]"
                    >{{ initials(user.nombreCompleto) }}</span
                  >
                  <div>
                    <p class="font-semibold text-slate-800">{{ user.nombreCompleto }}</p>
                    <p class="mt-0.5 text-xs text-slate-500">@{{ user.nombreUsuario }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4">
                <span
                  class="rounded-lg bg-[#69d2e7]/25 px-2.5 py-1 text-xs font-bold text-[#245f69]"
                  >{{ user.rol }}</span
                >
              </td>
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
                  :class="
                    user.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  "
                  ><span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="user.activo ? 'bg-emerald-500' : 'bg-slate-400'"
                  ></span
                  >{{ user.activo ? 'Activo' : 'Inactivo' }}</span
                >
              </td>
              <td class="px-5 py-4 text-sm text-slate-500">{{ formatDate(user.ultimoAcceso) }}</td>
              <td class="px-5 py-4">
                <div class="flex justify-end gap-1">
                  <button
                    type="button"
                    class="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-[#f38630] hover:text-[#202f33]"
                    title="Editar usuario"
                    aria-label="Editar usuario"
                    @click="openEdit(user)"
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
                  <button
                    type="button"
                    class="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-[#f38630] hover:text-[#202f33]"
                    title="Restablecer contraseña"
                    aria-label="Restablecer contraseña"
                    @click="openPassword(user)"
                  >
                    <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="8" cy="15" r="4" stroke="currentColor" stroke-width="1.8" />
                      <path
                        d="m11 12 8-8m-3 3 2 2m-5 1 2 2"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-slate-400 transition"
                    :class="
                      user.activo
                        ? 'hover:bg-red-50 hover:text-red-600'
                        : 'hover:bg-emerald-50 hover:text-emerald-600'
                    "
                    :title="user.activo ? 'Desactivar usuario' : 'Activar usuario'"
                    :aria-label="user.activo ? 'Desactivar usuario' : 'Activar usuario'"
                    @click="openStatus(user)"
                  >
                    <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 3v9m6.4-5.4a9 9 0 1 1-12.8 0"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        v-if="!isPending && !queryError && filteredUsers.length"
        v-model:page="currentPage"
        :page-size="pageSize"
        :total-items="filteredUsers.length"
      />
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
import { computed, reactive, ref, watch } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import BasePagination from '@/components/BasePagination.vue'
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
const currentPage = ref(1)
const pageSize = 5
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
const activeUsers = computed(() => users.value.filter((user) => user.activo).length)
const formLoading = computed(() => createMutation.isPending.value || updateMutation.isPending.value)
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
const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / pageSize)))
const paginatedUsers = computed(() =>
  filteredUsers.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize),
)

watch([search, roleFilter, statusFilter], () => (currentPage.value = 1))
watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
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
