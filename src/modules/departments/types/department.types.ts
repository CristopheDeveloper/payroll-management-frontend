export interface Department {
  idDepartamento: number
  nombre: string
  descripcion: string | null
  activo: boolean
}

export interface SaveDepartmentRequest {
  nombre: string
  descripcion: string | null
}

export interface DepartmentFormValues {
  nombre: string
  descripcion: string
}
