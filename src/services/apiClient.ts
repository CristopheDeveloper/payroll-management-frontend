import axios from 'axios'

const SESSION_STORAGE_KEY = 'payroll.auth.session'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: Number(import.meta.env.VITE_REQUEST_TIMEOUT ?? 15000),
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const storedSession = sessionStorage.getItem(SESSION_STORAGE_KEY)

  if (storedSession) {
    try {
      const session = JSON.parse(storedSession) as { token?: string }

      if (session.token) {
        config.headers.Authorization = `Bearer ${session.token}`
      }
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
    }
  }

  return config
})
