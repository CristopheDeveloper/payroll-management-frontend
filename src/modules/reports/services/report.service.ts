import { AxiosError } from 'axios'
import { apiClient } from '@/services/apiClient'

export async function downloadFile(
  url: string,
  params: Record<string, string | number> = {},
): Promise<void> {
  const response = await request(() => apiClient.get<Blob>(url, { params, responseType: 'blob' }))
  const disposition = String(response.headers['content-disposition'] ?? '')
  const name = /filename="?([^";]+)"?/i.exec(disposition)?.[1] ?? 'reporte'
  const link = document.createElement('a')
  link.href = URL.createObjectURL(response.data)
  link.download = name
  link.click()
  URL.revokeObjectURL(link.href)
}

async function request<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof AxiosError) {
      let data = error.response?.data as
        { detail?: string; title?: string; errors?: Record<string, string[]> } | Blob | undefined
      if (data instanceof Blob) {
        try {
          data = JSON.parse(await data.text())
        } catch {
          data = undefined
        }
      }
      const body = data as
        { detail?: string; title?: string; errors?: Record<string, string[]> } | undefined
      const message = body?.detail ?? Object.values(body?.errors ?? {})[0]?.[0] ?? body?.title
      if (message) throw new Error(message)
      if (error.response?.status === 401)
        throw new Error('La sesión expiró. Vuelve a iniciar sesión.')
      if (error.response?.status === 403)
        throw new Error('No tienes permiso para ver este reporte.')
      if (!error.response) throw new Error('No fue posible conectar con el servidor.')
    }
    throw new Error('Ocurrió un error al procesar la solicitud.')
  }
}
