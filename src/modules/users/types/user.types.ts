export interface User {
  idUsuario: number
  nombreUsuario: string
  nombreCompleto: string
  idRol: number
  rol: string
  activo: boolean
  ultimoAcceso: string | null
}

export interface Role {
  idRol: number
  nombre: string
  descripcion: string | null
}

export interface CreateUserRequest {
  nombreUsuario: string
  nombreCompleto: string
  idRol: number
  contrasena: string
}

export interface UpdateUserRequest {
  nombreCompleto: string
  idRol: number
}

export interface ResetPasswordRequest {
  contrasena: string
}

export interface UserFormValues {
  nombreUsuario: string
  nombreCompleto: string
  idRol: number | null
  contrasena: string
}
