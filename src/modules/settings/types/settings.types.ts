export type ParameterDataType = 'ENTERO' | 'DECIMAL' | 'TEXTO'

export interface SystemParameter {
  idParametro: number
  clave: string
  valor: string
  tipoDato: ParameterDataType
  descripcion: string
}

export interface UpdateParameterRequest {
  valor: string
  descripcion: string
}
