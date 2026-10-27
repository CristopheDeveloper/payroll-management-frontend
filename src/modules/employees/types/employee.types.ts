export type PaymentType = 'EFECTIVO' | 'CHEQUE' | 'TRANSFERENCIA'
export type TerminationType = 'RENUNCIA' | 'DESPIDO' | 'FIN_CONTRATO' | 'OTRO'

export interface EmployeeListItem {
  idEmpleado: number
  codigoEmpleado: string
  nombreCompleto: string
  dpi: string
  puesto: string
  departamento: string
  tipoPago: PaymentType
  salario: number
  activo: boolean
  fechaIngresoActual: string | null
  fechaBajaUltima: string | null
}

export interface EmploymentPeriod {
  idPeriodoLaboral: number
  fechaIngreso: string
  fechaBaja: string | null
  tipoBaja: TerminationType | null
  motivoBaja: string | null
}

export interface EmployeeDetail {
  idEmpleado: number
  codigoEmpleado: string
  nombres: string
  apellidos: string
  dpi: string
  pasaporte: string | null
  nit: string | null
  numeroIgss: string | null
  fechaNacimiento: string
  genero: 'M' | 'F'
  direccion: string
  telefono: string | null
  correo: string | null
  tipoPago: PaymentType
  banco: string | null
  cuentaBancaria: string | null
  idPuesto: number
  nombrePuesto: string
  idDepartamento: number
  nombreDepartamento: string
  salario: number
  retencionIsr: number
  activo: boolean
  periodos: EmploymentPeriod[]
}

export interface SaveEmployeeRequest {
  nombres: string
  apellidos: string
  dpi: string
  pasaporte: string | null
  nit: string | null
  numeroIgss: string | null
  fechaNacimiento: string
  genero: 'M' | 'F'
  direccion: string
  telefono: string | null
  correo: string | null
  tipoPago: PaymentType
  banco: string | null
  cuentaBancaria: string | null
  idPuesto: number
  idDepartamento: number
  salario: number
  retencionIsr: number
}

export interface CreateEmployeeRequest extends SaveEmployeeRequest {
  fechaIngreso: string
}

export interface TerminateEmployeeRequest {
  fechaBaja: string
  tipoBaja: TerminationType
  motivoBaja: string | null
  eliminarAusenciasProgramadas: boolean
}

export interface RehireEmployeeRequest {
  fechaIngreso: string
  idPuesto: number
  idDepartamento: number
  salario: number
}

export interface PaymentLine {
  idRubro: number
  codigo: string
  nombre: string
  tipo: 'INGRESO' | 'DESCUENTO' | 'PATRONAL'
  orden: number
  base: number | null
  monto: number
  descripcion: string | null
}

export interface EmployeePayment {
  idNomina: number
  codigo: string
  descripcion: string
  nombreTipoPlanilla: string
  anio: number
  mes: number
  fechaPago: string
  diasPagar: number
  totalIngresos: number
  totalDescuentos: number
  liquido: number
  rubros: PaymentLine[]
}
