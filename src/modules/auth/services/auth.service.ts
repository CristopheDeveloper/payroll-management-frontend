import type { AuthUser, LoginCredentials } from '@/modules/auth/types/auth.types'

const SESSION_KEY = 'payroll-auth-session'
const TEMPORARY_CREDENTIAL = 'admin123'

export async function login(credentials: LoginCredentials): Promise<AuthUser | null> {
  const isValid =
    credentials.username === TEMPORARY_CREDENTIAL &&
    credentials.password === TEMPORARY_CREDENTIAL

  if (!isValid) return null

  const user = { username: credentials.username }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return user
}

export function getSession(): AuthUser | null {
  const session = sessionStorage.getItem(SESSION_KEY)

  if (!session) return null

  try {
    return JSON.parse(session) as AuthUser
  } catch {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
