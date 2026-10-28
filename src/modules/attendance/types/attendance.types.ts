export type AttendanceStatus = 'PRESENTE' | 'FALTA' | 'PERMISO' | 'SUSPENSION_IGSS'

export type AbsenceStatus = 'FALTA' | 'PERMISO' | 'SUSPENSION_IGSS'

export interface DayAttendanceRow {
  idEmpleado: number
  codigoEmpleado: string
  nombreCompleto: string
  departamento: string
  idAsistencia: number | null
  estado: AttendanceStatus
  horasExtra: number
  observacion: string | null
}

export interface DayAttendance {
  fecha: string
  version: string
  empleados: DayAttendanceRow[]
}

export interface AttendanceRecordRequest {
  idEmpleado: number
  estado: AttendanceStatus
  horasExtra: number
  observacion: string | null
}

export interface SaveDayRequest {
  fecha: string
  version: string
  registros: AttendanceRecordRequest[]
}

export interface AbsenceRangeRequest {
  idEmpleado: number
  estado: AbsenceStatus
  desde: string
  hasta: string
  soloDiasHabiles: boolean
  observacion: string | null
}

export interface AbsenceFormValues {
  idEmpleado: number | null
  estado: AbsenceStatus
  desde: string
  hasta: string
  soloDiasHabiles: boolean
  observacion: string
}

export interface AttendanceRecord {
  idAsistencia: number
  fecha: string
  estado: AttendanceStatus
  horasExtra: number
  observacion: string | null
}

export interface AttendanceSummary {
  idEmpleado: number
  codigoEmpleado: string
  nombreCompleto: string
  faltas: number
  permisos: number
  suspensionIgss: number
  horasExtra: number
}

export interface AttendanceEmployee {
  idEmpleado: number
  codigoEmpleado: string
  nombreCompleto: string
  activo: boolean
}
