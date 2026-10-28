import { AxiosError } from 'axios'
import { apiClient } from '@/services/apiClient'
import type {
  Department,
  SaveDepartmentRequest,
} from '@/modules/departments/types/department.types'

export async function getDepartments(): Promise<Department[]> {
  return request(() => apiClient.get<Department[]>('/Departamento')).then(
    (response) => response.data,
  )
}

export async function getDepartment(id: number): Promise<Department> {
  return request(() => apiClient.get<Department>(`/Departamento/${id}`)).then(
    (response) => response.data,
  )
}

export async function createDepartment(payload: SaveDepartmentRequest): Promise<Department> {
  return request(() => apiClient.post<Department>('/Departamento', payload)).then(
    (response) => response.data,
  )
}

export async function updateDepartment(
  id: number,
  payload: SaveDepartmentRequest,
): Promise<Department> {
  return request(() => apiClient.put<Department>(`/Departamento/${id}`, payload)).then(
    (response) => response.data,
  )
}

export async function activateDepartment(id: number): Promise<void> {
  await request(() => apiClient.put(`/Departamento/${id}/activar`))
}

export async function deactivateDepartment(id: number): Promise<void> {
  await request(() => apiClient.put(`/Departamento/${id}/desactivar`))
}

async function request<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof AxiosError) {
      const responseData = error.response?.data as
        | { detail?: string; message?: string; title?: string; errors?: Record<string, string[]> }
        | undefined
      const validationMessage = Object.values(responseData?.errors ?? {})[0]?.[0]
      const message =
        responseData?.detail ?? responseData?.message ?? validationMessage ?? responseData?.title

      if (message) throw new Error(message)
      if (error.response?.status === 401)
        throw new Error('La sesión expiró. Vuelve a iniciar sesión.')
      if (error.response?.status === 403)
        throw new Error('No tienes permiso para modificar departamentos.')
      if (error.response?.status === 404) throw new Error('El departamento solicitado no existe.')
      if (error.response?.status === 409)
        throw new Error('Ya existe un departamento con ese nombre.')
      if (!error.response) throw new Error('No fue posible conectar con el servidor.')
    }

    throw new Error('Ocurrió un error al procesar la solicitud.')
  }
}
