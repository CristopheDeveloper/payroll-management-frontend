export type ConceptType = 'INGRESO' | 'DESCUENTO' | 'PATRONAL'
export type ConceptOrigin = 'SISTEMA' | 'MANUAL'

export interface Concept {
  idRubro: number
  codigo: string
  nombre: string
  tipo: ConceptType
  origen: ConceptOrigin
  afectoIgss: boolean
  esPrestacion: boolean
  orden: number
  descripcion: string | null
  cuentaContable: string | null
  activo: boolean
}

export interface CreateConceptRequest {
  codigo: string
  nombre: string
  tipo: 'INGRESO' | 'DESCUENTO'
  afectoIgss: boolean
  orden: number
  descripcion: string | null
  cuentaContable: string | null
}

export type UpdateConceptRequest = Omit<CreateConceptRequest, 'codigo' | 'tipo'>
