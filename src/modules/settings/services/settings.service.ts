import { AxiosError } from 'axios'
import { apiClient } from '@/services/apiClient'
import type {
  SystemParameter,
  UpdateParameterRequest,
} from '@/modules/settings/types/settings.types'

export async function getParameters(): Promise<SystemParameter[]> {
  return request(() => apiClient.get<SystemParameter[]>('/Parametro')).then(
    (response) => response.data,
  )
}

export async function updateParameter(
  id: number,
  payload: UpdateParameterRequest,
): Promise<SystemParameter> {
  return request(() => apiClient.put<SystemParameter>(`/Parametro/${id}`, payload)).then(
    (response) => response.data,
  )
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
        throw new Error('Solo el administrador puede ver y modificar la configuración.')
      if (error.response?.status === 404) throw new Error('El parámetro solicitado no existe.')
      if (!error.response) throw new Error('No fue posible conectar con el servidor.')
    }

    throw new Error('Ocurrió un error al procesar la solicitud.')
  }
}
