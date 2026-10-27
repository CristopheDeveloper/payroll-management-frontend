import { AxiosError } from 'axios'
import { apiClient } from '@/services/apiClient'
import type {
  Concept,
  CreateConceptRequest,
  UpdateConceptRequest,
} from '@/modules/concepts/types/concept.types'

export async function getConcepts(): Promise<Concept[]> {
  return request(() => apiClient.get<Concept[]>('/Rubro')).then((response) => response.data)
}

export async function createConcept(payload: CreateConceptRequest): Promise<Concept> {
  return request(() => apiClient.post<Concept>('/Rubro', payload)).then((response) => response.data)
}

export async function updateConcept(id: number, payload: UpdateConceptRequest): Promise<Concept> {
  return request(() => apiClient.put<Concept>(`/Rubro/${id}`, payload)).then(
    (response) => response.data,
  )
}

export async function activateConcept(id: number): Promise<void> {
  await request(() => apiClient.put(`/Rubro/${id}/activar`))
}

export async function deactivateConcept(id: number): Promise<void> {
  await request(() => apiClient.put(`/Rubro/${id}/desactivar`))
}

async function request<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof AxiosError) {
      const responseData = error.response?.data as
        | {
            detail?: string
            message?: string
            title?: string
            errors?: Record<string, string[]>
          }
        | undefined
      const validationMessage = Object.values(responseData?.errors ?? {})[0]?.[0]
      const message =
        responseData?.detail ?? responseData?.message ?? validationMessage ?? responseData?.title

      if (message) throw new Error(message)
      if (error.response?.status === 401)
        throw new Error('La sesión expiró. Vuelve a iniciar sesión.')
      if (error.response?.status === 403)
        throw new Error('Solo un administrador puede modificar los rubros.')
      if (!error.response) throw new Error('No fue posible conectar con el servidor.')
    }

    throw new Error('Ocurrió un error al procesar la solicitud.')
  }
}
