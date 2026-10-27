export interface Position {
  idPuesto: number
  nombre: string
  descripcion: string | null
  activo: boolean
}

export interface SavePositionRequest {
  nombre: string
  descripcion: string | null
}

export interface PositionFormValues {
  nombre: string
  descripcion: string
}
