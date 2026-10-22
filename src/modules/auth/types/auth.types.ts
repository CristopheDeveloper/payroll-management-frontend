export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginRequest {
  nombreUsuario: string
  contrasena: string
}

export interface LoginResponse {
  token: string
  nombreUsuario: string
  nombreCompleto: string
  rol: string
}

export interface AuthUser {
  username: string
  fullName: string
  role: string
}

export interface AuthSession {
  token: string
  user: AuthUser
}
