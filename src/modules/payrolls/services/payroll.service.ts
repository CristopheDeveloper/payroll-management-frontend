import { AxiosError } from 'axios'
import { apiClient } from '@/services/apiClient'
import type {
  ConceptSummary,
  CreatePayrollRequest,
  EditPayrollRequest,
  Payroll,
  PayrollConcept,
  PayrollEmployee,
  PayrollType,
  SaveEmployeeDataRequest,
  SaveVariableRequest,
} from '@/modules/payrolls/types/payroll.types'

export type ReportFile = 'planilla/pdf' | 'planilla/excel' | 'boletas/pdf'

export class PayrollRequestError extends Error {
  readonly code: string | null

  constructor(message: string, code: string | null = null) {
    super(message)
    this.code = code
  }
}

export async function getPayrollTypes(): Promise<PayrollType[]> {
  return request(() => apiClient.get<PayrollType[]>('/Nomina/tipos')).then(
    (response) => response.data,
  )
}

export async function getPayrolls(): Promise<Payroll[]> {
  return request(() => apiClient.get<Payroll[]>('/Nomina')).then((response) => response.data)
}

export async function getPayroll(id: number): Promise<Payroll> {
  return request(() => apiClient.get<Payroll>(`/Nomina/${id}`)).then((response) => response.data)
}

export async function createPayroll(payload: CreatePayrollRequest): Promise<Payroll> {
  return request(() => apiClient.post<Payroll>('/Nomina', payload)).then(
    (response) => response.data,
  )
}

export async function updatePayroll(id: number, payload: EditPayrollRequest): Promise<Payroll> {
  return request(() => apiClient.put<Payroll>(`/Nomina/${id}`, payload)).then(
    (response) => response.data,
  )
}

export async function deletePayroll(id: number): Promise<void> {
  await request(() => apiClient.delete(`/Nomina/${id}`))
}

export async function preparePayroll(id: number): Promise<Payroll> {
  return request(() => apiClient.post<Payroll>(`/Nomina/${id}/preparar`)).then(
    (response) => response.data,
  )
}

export async function generatePayroll(id: number): Promise<Payroll> {
  return request(() => apiClient.post<Payroll>(`/Nomina/${id}/generar`)).then(
    (response) => response.data,
  )
}

export async function backToPrepared(id: number): Promise<Payroll> {
  return request(() => apiClient.post<Payroll>(`/Nomina/${id}/volver-a-preparada`)).then(
    (response) => response.data,
  )
}

export async function closePayroll(id: number, version: string): Promise<Payroll> {
  return request(() => apiClient.post<Payroll>(`/Nomina/${id}/cerrar`, { version })).then(
    (response) => response.data,
  )
}

export async function reopenPayroll(id: number, motivo: string): Promise<Payroll> {
  return request(() => apiClient.post<Payroll>(`/Nomina/${id}/reabrir`, { motivo })).then(
    (response) => response.data,
  )
}

export async function getPayrollEmployees(id: number): Promise<PayrollEmployee[]> {
  return request(() => apiClient.get<PayrollEmployee[]>(`/Nomina/${id}/empleados`)).then(
    (response) => response.data,
  )
}

export async function saveEmployeeData(
  id: number,
  idEmpleado: number,
  payload: SaveEmployeeDataRequest,
): Promise<PayrollEmployee> {
  return request(() =>
    apiClient.put<PayrollEmployee>(`/Nomina/${id}/empleados/${idEmpleado}`, payload),
  ).then((response) => response.data)
}

export async function saveVariable(
  id: number,
  payload: SaveVariableRequest,
): Promise<PayrollEmployee[]> {
  return request(() => apiClient.put<PayrollEmployee[]>(`/Nomina/${id}/variables`, payload)).then(
    (response) => response.data,
  )
}

export async function importVariables(
  id: number,
  variables: SaveVariableRequest[],
): Promise<PayrollEmployee[]> {
  return request(() =>
    apiClient.put<PayrollEmployee[]>(`/Nomina/${id}/variables/importar`, { variables }),
  ).then((response) => response.data)
}

export async function getConceptSummary(id: number): Promise<ConceptSummary[]> {
  return request(() => apiClient.get<ConceptSummary[]>(`/Nomina/${id}/resumen-rubros`)).then(
    (response) => response.data,
  )
}

export async function getManualConcepts(): Promise<PayrollConcept[]> {
  return request(() =>
    apiClient.get<PayrollConcept[]>('/Rubro', { params: { origen: 'MANUAL' } }),
  ).then((response) => response.data)
}

export async function downloadReport(id: number, file: ReportFile): Promise<void> {
  const response = await request(() =>
    apiClient.get<Blob>(`/Reporte/${id}/${file}`, { responseType: 'blob' }),
  )
  const disposition = String(response.headers['content-disposition'] ?? '')
  const name =
    /filename="?([^";]+)"?/i.exec(disposition)?.[1] ??
    (file === 'planilla/excel' ? 'planilla.xlsx' : `${file.replace('/', '.')}`)
  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

async function request<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof AxiosError) {
      const responseData = await readErrorBody(error.response?.data)
      const validationMessage = Object.values(responseData?.errors ?? {})[0]?.[0]
      const message =
        responseData?.detail ?? responseData?.message ?? validationMessage ?? responseData?.title

      if (message) throw new PayrollRequestError(message, responseData?.codigo ?? null)
      if (error.response?.status === 401)
        throw new PayrollRequestError('La sesión expiró. Vuelve a iniciar sesión.')
      if (error.response?.status === 403)
        throw new PayrollRequestError('Solo un administrador puede realizar esta acción.')
      if (error.response?.status === 404)
        throw new PayrollRequestError('La planilla solicitada no existe.')
      if (!error.response) throw new PayrollRequestError('No fue posible conectar con el servidor.')
    }

    throw new PayrollRequestError('Ocurrió un error al procesar la solicitud.')
  }
}

type ErrorBody = {
  detail?: string
  message?: string
  title?: string
  codigo?: string
  errors?: Record<string, string[]>
}

async function readErrorBody(data: unknown): Promise<ErrorBody | undefined> {
  if (!(data instanceof Blob)) return data as ErrorBody | undefined
  try {
    return JSON.parse(await data.text()) as ErrorBody
  } catch {
    return undefined
  }
}
