import { AxiosError } from 'axios'
import { apiClient } from '@/services/apiClient'
import type {
  AbsenceRangeRequest,
  AttendanceEmployee,
  AttendanceRecord,
  AttendanceSummary,
  DayAttendance,
  SaveDayRequest,
} from '@/modules/attendance/types/attendance.types'

export async function getDay(fecha: string): Promise<DayAttendance> {
  return request(() => apiClient.get<DayAttendance>('/Asistencia/dia', { params: { fecha } })).then(
    (response) => response.data,
  )
}

export async function saveDay(payload: SaveDayRequest): Promise<DayAttendance> {
  return request(() => apiClient.post<DayAttendance>('/Asistencia/lote', payload)).then(
    (response) => response.data,
  )
}

export async function registerRange(payload: AbsenceRangeRequest): Promise<AttendanceRecord[]> {
  return request(() => apiClient.post<AttendanceRecord[]>('/Asistencia/rango', payload)).then(
    (response) => response.data,
  )
}

export async function getSummary(anio: number, mes: number): Promise<AttendanceSummary[]> {
  return request(() =>
    apiClient.get<AttendanceSummary[]>('/Asistencia/resumen', { params: { anio, mes } }),
  ).then((response) => response.data)
}

export async function getEmployeeRecords(
  idEmpleado: number,
  anio: number,
  mes: number,
): Promise<AttendanceRecord[]> {
  return request(() =>
    apiClient.get<AttendanceRecord[]>(`/Asistencia/empleado/${idEmpleado}`, {
      params: { anio, mes },
    }),
  ).then((response) => response.data)
}

export async function deleteRecord(id: number): Promise<void> {
  await request(() => apiClient.delete(`/Asistencia/${id}`))
}

export async function getEmployees(): Promise<AttendanceEmployee[]> {
  return request(() => apiClient.get<AttendanceEmployee[]>('/Empleado')).then(
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
      if (error.response?.status === 404) throw new Error('El registro solicitado no existe.')
      if (error.response?.status === 409)
        throw new Error('Otra persona modificó la asistencia. Recarga antes de guardar.')
      if (!error.response) throw new Error('No fue posible conectar con el servidor.')
    }

    throw new Error('Ocurrió un error al procesar la solicitud.')
  }
}
