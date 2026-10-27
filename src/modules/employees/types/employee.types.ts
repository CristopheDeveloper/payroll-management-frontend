export interface Employee {
  idEmpleado: number
  codigoEmpleado: string
  nombreCompleto: string
  dpi: string
  puesto: string
  departamento: string
  tipoPago: string
  salario: number
  activo: boolean
  fechaIngresoActual: string | null
  fechaBajaUltima: string | null
}

export interface PeriodoLaboral {
  idPeriodoLaboral: number
  fechaIngreso: string
  fechaBaja: string | null
  tipoBaja: string
  motivoBaja: string
}

export interface EmployeeDetail {
  idEmpleado: number
  codigoEmpleado: string
  nombres: string
  apellidos: string
  dpi: string
  pasaporte: string
  nit: string
  numeroIgss: string
  fechaNacimiento: string
  genero: string
  direccion: string
  telefono: string
  correo: string
  tipoPago: string
  banco: string
  cuentaBancaria: string
  idPuesto: number
  nombrePuesto: string
  idDepartamento: number
  nombreDepartamento: string
  salario: number
  retencionIsr: number
  activo: boolean
  periodos: PeriodoLaboral[]
}

export interface EmployeePayload {
  nombres: string
  apellidos: string
  dpi: string
  pasaporte: string
  nit: string
  numeroIgss: string
  fechaNacimiento: string
  genero: 'M' | 'F'
  direccion: string
  telefono: string
  correo: string
  tipoPago: 'EFECTIVO' | 'CHEQUE' | 'TRANSFERENCIA'
  banco: string
  cuentaBancaria: string
  idPuesto: number
  idDepartamento: number
  salario: number
  retencionIsr: number
}

export interface CreateEmployeePayload extends EmployeePayload {
  fechaIngreso: string
}

export interface Department {
  idDepartamento: number
  nombre: string
  descripcion: string
  activo: boolean
}

export interface Position {
  idPuesto: number
  nombre: string
  descripcion: string
  activo: boolean
}

export interface BajaPayload {
  fechaBaja: string
  tipoBaja: 'RENUNCIA' | 'DESPIDO' | 'FIN_CONTRATO' | 'OTRO'
  motivoBaja: string
  eliminarAusenciasProgramadas: boolean
}

export interface ReingresoPayload {
  fechaIngreso: string
  idPuesto: number
  idDepartamento: number
  salario: number
}

export interface CorregirFechaIngresoPayload {
  fechaIngreso: string
}
