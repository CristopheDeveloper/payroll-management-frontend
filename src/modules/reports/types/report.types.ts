export type ReportFilter =
  | 'planilla'
  | 'empleadoPlanilla'
  | 'tipoPago'
  | 'rubro'
  | 'estado'
  | 'departamento'
  | 'puesto'
  | 'desde'
  | 'hasta'
  | 'empleado'
  | 'mes'

export interface ReportFilters {
  planilla: number
  empleadoPlanilla: number
  tipoPago: string
  rubro: number
  estado: string
  departamento: number
  puesto: number
  desde: string
  hasta: string
  empleado: number
  mes: string
}

export interface ReportDownload {
  label: string
  url: string
  params?: Record<string, string | number>
}

export interface ReportDefinition {
  key: string
  group: string
  title: string
  filters: ReportFilter[]
  required: ReportFilter[]
  downloads: (filters: ReportFilters) => ReportDownload[]
}
