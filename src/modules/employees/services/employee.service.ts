import { AxiosError } from 'axios'
import { apiClient } from '@/services/apiClient'
import type {
  Employee,
  EmployeeDetail,
  EmployeePayload,
  CreateEmployeePayload,
  Department,
  Position,
  BajaPayload,
  ReingresoPayload,
  CorregirFechaIngresoPayload,
} from '@/modules/employees/types/employee.types'

export interface EmployeeFilters {
  activo?: boolean
  idDepartamento?: number
  idPuesto?: number
  buscar?: string
}

export async function getEmployees(
  filters: EmployeeFilters = {},
): Promise<Employee[]> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) =>
      value !== undefined && value !== '',
    ),
  )

  return request(() => apiClient.get<Employee[]>('/Empleado', { params }))
    .then(response => response.data)
}

export async function getEmployee(id: number): Promise<EmployeeDetail> {
  return request(() => apiClient.get<EmployeeDetail>(`/Empleado/${id}`))
    .then(response => response.data)
}

export async function createEmployee(
  payload: CreateEmployeePayload,
): Promise<EmployeeDetail> {
  return request(() => apiClient.post<EmployeeDetail>('/Empleado', payload))
    .then(response => response.data)
}

export async function updateEmployee(
  id: number,
  payload: EmployeePayload,
): Promise<EmployeeDetail> {
  return request(() => apiClient.put<EmployeeDetail>(`/Empleado/${id}`, payload))
    .then(response => response.data)
}

export async function terminateEmployee(
  id: number,
  payload: BajaPayload,
): Promise<EmployeeDetail> {
  return request(() =>
    apiClient.post<EmployeeDetail>(`/Empleado/${id}/baja`, payload),
  ).then(response => response.data)
}

export async function rehireEmployee(
  id: number,
  payload: ReingresoPayload,
): Promise<EmployeeDetail> {
  return request(() =>
    apiClient.post<EmployeeDetail>(`/Empleado/${id}/reingreso`, payload),
  ).then(response => response.data)
}

export async function getDepartments(): Promise<Department[]> {
  return request(() => apiClient.get<Department[]>('/Departamento'))
    .then(response => response.data)
}

export async function getPositions(): Promise<Position[]> {
  return request(() => apiClient.get<Position[]>('/Puesto'))
    .then(response => response.data)
}

export async function correctCurrentPeriodStartDate(
  id: number,
  payload: CorregirFechaIngresoPayload,
): Promise<EmployeeDetail> {
  return request(() =>
    apiClient.put<EmployeeDetail>(
      `/Empleado/${id}/periodo-actual/fecha-ingreso`,
      payload,
    ),
  ).then(response => response.data)
}

async function request<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof AxiosError) {
      const data = error.response?.data as {
        detail?: string
        message?: string
        title?: string
      } | undefined

      const message = data?.detail ?? data?.message ?? data?.title
      if (message) throw new Error(message)

      if (error.response?.status === 401) {
        throw new Error('La sesión expiró. Vuelve a iniciar sesión.')
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permiso para administrar empleados.')
      }
      if (error.response?.status === 404) {
        throw new Error('No se encontró el recurso solicitado.')
      }
      if (error.response?.status === 409) {
        throw new Error('Existe un conflicto con los datos del empleado.')
      }
      if (!error.response) {
        throw new Error('No fue posible conectar con el servidor.')
      }
    }

    throw error instanceof Error
      ? error
      : new Error('Ocurrió un error al procesar la solicitud.')
  }
}
