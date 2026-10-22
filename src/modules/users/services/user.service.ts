import { AxiosError } from 'axios'
import { apiClient } from '@/services/apiClient'
import type {
  CreateUserRequest,
  ResetPasswordRequest,
  Role,
  UpdateUserRequest,
  User,
} from '@/modules/users/types/user.types'

export async function getUsers(): Promise<User[]> {
  return request(() => apiClient.get<User[]>('/Usuario')).then((response) => response.data)
}

export async function getUser(id: number): Promise<User> {
  return request(() => apiClient.get<User>(`/Usuario/${id}`)).then((response) => response.data)
}

export async function getRoles(): Promise<Role[]> {
  return request(() => apiClient.get<Role[]>('/Usuario/roles')).then((response) => response.data)
}

export async function createUser(payload: CreateUserRequest): Promise<User> {
  return request(() => apiClient.post<User>('/Usuario', payload)).then((response) => response.data)
}

export async function updateUser(id: number, payload: UpdateUserRequest): Promise<User> {
  return request(() => apiClient.put<User>(`/Usuario/${id}`, payload)).then(
    (response) => response.data,
  )
}

export async function resetPassword(id: number, payload: ResetPasswordRequest): Promise<void> {
  await request(() => apiClient.put(`/Usuario/${id}/contrasena`, payload))
}

export async function activateUser(id: number): Promise<void> {
  await request(() => apiClient.put(`/Usuario/${id}/activar`))
}

export async function deactivateUser(id: number): Promise<void> {
  await request(() => apiClient.put(`/Usuario/${id}/desactivar`))
}

async function request<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof AxiosError) {
      const responseData = error.response?.data as
        { detail?: string; message?: string; title?: string } | undefined
      const message = responseData?.detail ?? responseData?.message ?? responseData?.title

      if (message) throw new Error(message)
      if (error.response?.status === 401)
        throw new Error('La sesión expiró. Vuelve a iniciar sesión.')
      if (error.response?.status === 404) throw new Error('El usuario solicitado no existe.')
      if (error.response?.status === 409) throw new Error('Ya existe un usuario con esos datos.')
      if (!error.response) throw new Error('No fue posible conectar con el servidor.')
    }

    throw new Error('Ocurrió un error al procesar la solicitud.')
  }
}
