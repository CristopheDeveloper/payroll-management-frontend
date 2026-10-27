export type PayrollStatus = 'CREADA' | 'PREPARADA' | 'GENERADA' | 'CERRADA'
export type ConceptType = 'INGRESO' | 'DESCUENTO' | 'PATRONAL'
export type PayrollVariable = 'DIAS_PAGAR' | 'HORAS_EXTRA' | 'ISR' | 'RUBRO'

export interface PayrollWarning {
  codigo: string
  mensaje: string
  bloquea: boolean
  idEmpleado: number | null
}

export interface PayrollType {
  idTipoPlanilla: number
  codigo: string
  nombre: string
  descripcion: string | null
  incluyeIgss: boolean
  activo: boolean
}

export interface Payroll {
  idNomina: number
  idTipoPlanilla: number
  codigoTipoPlanilla: string | null
  nombreTipoPlanilla: string | null
  codigo: string
  descripcion: string
  anio: number
  mes: number
  fechaInicio: string
  fechaFin: string
  fechaPago: string
  comentario: string | null
  estado: PayrollStatus
  totalIngresos: number
  totalDescuentos: number
  totalLiquido: number
  totalPatronal: number
  cantidadEmpleados: number
  fechaPreparacion: string | null
  fechaGeneracion: string | null
  igssLaboral: number | null
  igssPatronal: number | null
  bonificacionIncentivo: number | null
  factorHoraExtra: number | null
  diasMes: number | null
  horasMes: number | null
  usuarioCierre: string | null
  fechaCierre: string | null
  motivoReapertura: string | null
  version: string | null
  puedeCerrar: boolean | null
  advertencias: PayrollWarning[] | null
}

export interface PayrollValue {
  idRubro: number
  codigoRubro: string
  nombreRubro: string
  tipo: ConceptType
  monto: number
  descripcion: string | null
}

export interface PayrollLine {
  idRubro: number
  codigo: string
  nombre: string
  tipo: ConceptType
  orden: number
  base: number | null
  monto: number
  descripcion: string | null
}

export interface PayrollEmployee {
  idNominaEmpleado: number
  idEmpleado: number
  codigoEmpleado: string
  nombreCompleto: string
  idPuesto: number
  nombrePuesto: string | null
  idDepartamento: number
  nombreDepartamento: string | null
  salario: number
  retencionIsr: number
  tipoPago: string
  banco: string | null
  cuentaBancaria: string | null
  diasPeriodo: number
  diasFalta: number
  diasSuspension: number
  diasPagarSugeridos: number
  diasPagar: number
  horasExtraSugeridas: number
  horasExtra: number
  isr: number
  datosAjustados: boolean
  totalIngresos: number
  totalDescuentos: number
  liquido: number
  totalPatronal: number
  valores: PayrollValue[]
  rubros: PayrollLine[]
  advertencias: PayrollWarning[]
}

export interface ConceptSummary {
  idRubro: number
  codigo: string
  nombre: string
  tipo: ConceptType
  orden: number
  empleados: number
  total: number
}

export interface PayrollConcept {
  idRubro: number
  codigo: string
  nombre: string
  tipo: ConceptType
  origen: 'SISTEMA' | 'MANUAL'
  afectoIgss: boolean
  orden: number
  activo: boolean
}

export interface CreatePayrollRequest {
  idTipoPlanilla: number
  anio: number
  mes: number
  codigo: string
  descripcion: string
  fechaPago: string | null
  comentario: string | null
}

export interface EditPayrollRequest {
  codigo: string
  descripcion: string
  fechaPago: string
  comentario: string | null
}

export interface SaveValueRequest {
  idRubro: number
  monto: number
  descripcion: string | null
}

export interface SaveEmployeeDataRequest {
  diasPagar: number
  horasExtra: number
  isr: number
  valores: SaveValueRequest[]
}

export interface SaveVariableRequest {
  variable: PayrollVariable
  idRubro: number | null
  valores: { idEmpleado: number; valor: number; descripcion: string | null }[]
}
