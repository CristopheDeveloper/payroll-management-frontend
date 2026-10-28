import { AxiosError } from 'axios'
import { apiClient } from '@/services/apiClient'
import type {
  CreateEmployeeRequest,
  EmployeeDetail,
  EmployeeListItem,
  EmployeePayment,
  EmployeePhoto,
  RehireEmployeeRequest,
  SaveEmployeeRequest,
  TerminateEmployeeRequest,
} from '@/modules/employees/types/employee.types'

export class EmployeeRequestError extends Error {
  readonly code: string | null

  constructor(message: string, code: string | null = null) {
    super(message)
    this.code = code
  }
}

export async function getEmployees(): Promise<EmployeeListItem[]> {
  return request(() => apiClient.get<EmployeeListItem[]>('/Empleado')).then(
    (response) => response.data,
  )
}

export async function getEmployee(id: number): Promise<EmployeeDetail> {
  return request(() => apiClient.get<EmployeeDetail>(`/Empleado/${id}`)).then(
    (response) => response.data,
  )
}

export async function getEmployeePayments(id: number): Promise<EmployeePayment[]> {
  return request(() => apiClient.get<EmployeePayment[]>(`/Empleado/${id}/pagos`)).then(
    (response) => response.data,
  )
}

export async function getMinimumWage(): Promise<number> {
  return request(() => apiClient.get<number>('/Parametro/salario-minimo')).then(
    (response) => response.data,
  )
}

export async function getDefaultBonus(): Promise<number> {
  return request(() => apiClient.get<number>('/Parametro/bonificacion-incentivo')).then(
    (response) => response.data,
  )
}

export async function createEmployee(payload: CreateEmployeeRequest): Promise<EmployeeDetail> {
  return request(() => apiClient.post<EmployeeDetail>('/Empleado', payload)).then(
    (response) => response.data,
  )
}

export async function updateEmployee(
  id: number,
  payload: SaveEmployeeRequest,
): Promise<EmployeeDetail> {
  return request(() => apiClient.put<EmployeeDetail>(`/Empleado/${id}`, payload)).then(
    (response) => response.data,
  )
}

export async function uploadEmployeePhoto(id: number, photo: File): Promise<EmployeePhoto> {
  const data = new FormData()
  data.append('foto', photo, photo.name)
  return request(() =>
    apiClient.post<EmployeePhoto>(`/Empleado/${id}/foto`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    }),
  ).then((response) => response.data)
}

export async function deleteEmployeePhoto(id: number): Promise<void> {
  await request(() => apiClient.delete(`/Empleado/${id}/foto`))
}

export async function getEmployeePhoto(url: string): Promise<Blob> {
  // Las primeras fotos se guardaron con /api, pero la baseURL ya termina en /api.
  // Normalizar mantiene compatibles esos registros sin producir /api/api en Axios.
  const normalizedUrl = url.startsWith('/api/') ? url.slice(4) : url
  return request(() => apiClient.get<Blob>(normalizedUrl, { responseType: 'blob' })).then(
    (response) => response.data,
  )
}

export async function terminateEmployee(
  id: number,
  payload: TerminateEmployeeRequest,
): Promise<EmployeeDetail> {
  return request(() => apiClient.post<EmployeeDetail>(`/Empleado/${id}/baja`, payload)).then(
    (response) => response.data,
  )
}

export async function rehireEmployee(
  id: number,
  payload: RehireEmployeeRequest,
): Promise<EmployeeDetail> {
  return request(() => apiClient.post<EmployeeDetail>(`/Empleado/${id}/reingreso`, payload)).then(
    (response) => response.data,
  )
}

export async function correctHireDate(id: number, fechaIngreso: string): Promise<EmployeeDetail> {
  return request(() =>
    apiClient.put<EmployeeDetail>(`/Empleado/${id}/periodo-actual/fecha-ingreso`, {
      fechaIngreso,
    }),
  ).then((response) => response.data)
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
            codigo?: string
            errors?: Record<string, string[]>
          }
        | undefined
      const validationMessage = Object.values(responseData?.errors ?? {})[0]?.[0]
      const message =
        responseData?.detail ?? responseData?.message ?? validationMessage ?? responseData?.title

      if (message) throw new EmployeeRequestError(message, responseData?.codigo ?? null)
      if (error.response?.status === 401)
        throw new EmployeeRequestError('La sesión expiró. Vuelve a iniciar sesión.')
      if (error.response?.status === 403)
        throw new EmployeeRequestError('No tienes permiso para modificar empleados.')
      if (error.response?.status === 404)
        throw new EmployeeRequestError('El empleado solicitado no existe.')
      if (!error.response)
        throw new EmployeeRequestError('No fue posible conectar con el servidor.')
    }

    throw new EmployeeRequestError('Ocurrió un error al procesar la solicitud.')
  }
}
