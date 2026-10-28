import { AxiosError } from 'axios'
import { apiClient } from '@/services/apiClient'
import type { Position, SavePositionRequest } from '@/modules/positions/types/position.types'

export async function getPositions(): Promise<Position[]> {
  return request(() => apiClient.get<Position[]>('/Puesto')).then((response) => response.data)
}

export async function getPosition(id: number): Promise<Position> {
  return request(() => apiClient.get<Position>(`/Puesto/${id}`)).then((response) => response.data)
}

export async function createPosition(payload: SavePositionRequest): Promise<Position> {
  return request(() => apiClient.post<Position>('/Puesto', payload)).then(
    (response) => response.data,
  )
}

export async function updatePosition(id: number, payload: SavePositionRequest): Promise<Position> {
  return request(() => apiClient.put<Position>(`/Puesto/${id}`, payload)).then(
    (response) => response.data,
  )
}

export async function activatePosition(id: number): Promise<void> {
  await request(() => apiClient.put(`/Puesto/${id}/activar`))
}

export async function deactivatePosition(id: number): Promise<void> {
  await request(() => apiClient.put(`/Puesto/${id}/desactivar`))
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
        throw new Error('No tienes permiso para modificar puestos.')
      if (error.response?.status === 404) throw new Error('El puesto solicitado no existe.')
      if (error.response?.status === 409) throw new Error('Ya existe un puesto con ese nombre.')
      if (!error.response) throw new Error('No fue posible conectar con el servidor.')
    }

    throw new Error('Ocurrió un error al procesar la solicitud.')
  }
}
