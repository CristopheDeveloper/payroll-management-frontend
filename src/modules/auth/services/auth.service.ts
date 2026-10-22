import { AxiosError } from 'axios'
import { apiClient } from '@/services/apiClient'
import type {
  AuthSession,
  AuthUser,
  LoginCredentials,
  LoginRequest,
  LoginResponse,
} from '@/modules/auth/types/auth.types'

const SESSION_STORAGE_KEY = 'payroll.auth.session'

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const request: LoginRequest = {
    nombreUsuario: credentials.username,
    contrasena: credentials.password,
  }

  try {
    const { data } = await apiClient.post<LoginResponse>('/Autenticacion/login', request)

    const session: AuthSession = {
      token: data.token,
      user: {
        username: data.nombreUsuario,
        fullName: data.nombreCompleto,
        role: data.rol,
      },
    }

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))

    return session.user
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        throw new Error('Usuario o contraseña incorrectos.')
      }

      if (!error.response) {
        throw new Error('No fue posible conectar con el servidor de autenticación.')
      }
    }

    throw new Error('No fue posible iniciar sesión. Intenta nuevamente.')
  }
}

export function getSession(): AuthUser | null {
  const session = readStoredSession()
  return session?.user ?? null
}

export function getToken(): string | null {
  const session = readStoredSession()
  return session?.token ?? null
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
}

function readStoredSession(): AuthSession | null {
  const storedSession = sessionStorage.getItem(SESSION_STORAGE_KEY)

  if (!storedSession) return null

  try {
    const session = JSON.parse(storedSession) as AuthSession

    if (!session.token || !session.user?.username) {
      logout()
      return null
    }

    return session
  } catch {
    logout()
    return null
  }
}
