import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'

interface RequestOptions {
  method?: string
  headers?: Record<string, string>
  body?: string
}

export const useApiClient = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  const apiRequest = async (url: string, options: RequestOptions = {}) => {
    const authHeader = authStore.getAuthHeader()
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (authHeader) {
      defaultHeaders['Authorization'] = authHeader
    }

    const requestOptions: RequestInit = {
      method: options.method || 'GET',
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      body: options.body,
    }

    try {
      const response = await fetch(url, requestOptions)

      // Si recibimos un 401, el token ha expirado
      if (response.status === 401) {
        authStore.logout()
        router.push('/login')
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.')
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error HTTP: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error('API Request Error:', error)
      throw error
    }
  }

  return {
    apiRequest
  }
}