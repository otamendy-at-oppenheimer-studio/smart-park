// Configuración de la URL base del backend
export const API_BASE_URL = "http://localhost:3000"; // Cambia el puerto si tu backend usa otro

// Función helper para hacer peticiones con autenticación
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('access_token')
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  const requestOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, requestOptions)

    // Si recibimos un 401, el token ha expirado
    if (response.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_data')
      window.location.href = '/login'
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
