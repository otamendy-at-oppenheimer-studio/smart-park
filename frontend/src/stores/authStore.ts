import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: number
  email: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const access_token = ref<string | null>(null)
  const user = ref<User | null>(null)

  // Computed para verificar si está autenticado
  const isAuthenticated = computed(() => {
    return !!access_token.value && !!user.value
  })

  // Inicializar desde localStorage al cargar la app
  const initializeAuth = () => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user_data')
    
    if (token && userData) {
      try {
        access_token.value = token
        user.value = JSON.parse(userData)
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error)
        logout()
      }
    }
  }

  // Login: guardar token y datos del usuario
  const login = (authData: { access_token: string; user: User }) => {
    access_token.value = authData.access_token
    user.value = authData.user

    // Guardar en localStorage para persistencia
    localStorage.setItem('access_token', authData.access_token)
    localStorage.setItem('user_data', JSON.stringify(authData.user))
  }

  // Logout: limpiar todo
  const logout = () => {
    access_token.value = null
    user.value = null
    
    // Limpiar localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('auth') // Limpiar la flag antigua si existe
  }

  // Verificar si el token es válido (puedes expandir esto)
  const isTokenValid = () => {
    if (!access_token.value) return false
    
    try {
      // Aquí podrías decodificar el JWT y verificar la expiración
      const payload = JSON.parse(atob(access_token.value.split('.')[1]))
      const now = Date.now() / 1000
      
      return payload.exp > now
    } catch (error) {
      console.error('Error validating token:', error)
      return false
    }
  }

  // Obtener el token para las requests
  const getAuthHeader = () => {
    return access_token.value ? `Bearer ${access_token.value}` : null
  }

  // Verificar permisos basados en rol
  const hasRole = (requiredRole: string) => {
    return user.value?.role === requiredRole
  }

  const hasAnyRole = (roles: string[]) => {
    return user.value ? roles.indexOf(user.value.role) !== -1 : false
  }

  return {
    access_token,
    user,
    isAuthenticated,
    initializeAuth,
    login,
    logout,
    isTokenValid,
    getAuthHeader,
    hasRole,
    hasAnyRole
  }
})