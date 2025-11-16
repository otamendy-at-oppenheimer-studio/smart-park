<template>
  <div class="w-full min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex flex-col profile-container">
    <div class="bg-white rounded-2xl shadow-lg p-8 my-8 mx-auto w-full max-w-4xl flex-1">
      <h2 class="text-2xl font-bold mb-8 text-center text-blue-800 tracking-wide">Mi Perfil</h2>
      
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <p class="text-red-700">{{ error }}</p>
      </div>

      <!-- Profile content -->
      <template v-else>
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Avatar y información básica -->
          <div class="md:col-span-1">
            <div class="bg-gray-50 rounded-xl p-6 text-center shadow-sm">
              <div class="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span class="text-3xl font-bold text-blue-600">
                  {{ getInitials(userInfo.email) }}
                </span>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ userInfo.email }}</h3>
              <span :class="[
                'inline-flex px-3 py-1 text-sm font-semibold rounded-full',
                userInfo.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-green-100 text-green-800'
              ]">
                {{ userInfo.role === 'admin' ? 'Administrador' : 'Usuario' }}
              </span>
              <div class="mt-4 text-sm text-gray-500">
                <p>Miembro desde:</p>
                <p class="font-medium">{{ formatDate(userInfo.createdAt) }}</p>
              </div>
              <div class="mt-2 text-sm text-gray-500">
                <p>Última actualización:</p>
                <p class="font-medium">{{ formatDate(userInfo.updatedAt) }}</p>
              </div>
            </div>

            <!-- Estadísticas del usuario (si es admin) -->
            <div v-if="userInfo.role === 'admin'" class="mt-6 bg-blue-50 rounded-xl p-6 shadow-sm">
              <h4 class="font-semibold text-blue-800 mb-4">Panel de Admin</h4>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-blue-600">Total Espacios:</span>
                  <span class="font-medium text-blue-800">{{ stats.totalSpaces }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-blue-600">Espacios Ocupados:</span>
                  <span class="font-medium text-blue-800">{{ stats.occupiedSpaces }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-blue-600">Tasa de Ocupación:</span>
                  <span class="font-medium text-blue-800">{{ stats.occupancyRate }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Formulario de edición -->
          <div class="md:col-span-2">
            <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-semibold text-gray-800">Información Personal</h3>
                <button
                  v-if="!isEditing"
                  @click="startEditing"
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Editar Perfil
                </button>
              </div>

              <form @submit.prevent="saveProfile" class="space-y-6">
                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    v-model="editForm.email"
                    type="email"
                    :disabled="!isEditing"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    required
                  >
                </div>

                <!-- Cambiar contraseña -->
                <div v-if="isEditing">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña (opcional)
                  </label>
                  <input
                    v-model="editForm.password"
                    type="password"
                    placeholder="Dejar vacío para mantener la actual"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                  <p class="text-xs text-gray-500 mt-1">
                    Mínimo 6 caracteres. Deja vacío si no quieres cambiarla.
                  </p>
                </div>

                <!-- Confirmar contraseña -->
                <div v-if="isEditing && editForm.password">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    v-model="editForm.confirmPassword"
                    type="password"
                    placeholder="Confirma tu nueva contraseña"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="{ 
                      'border-red-300': editForm.password !== editForm.confirmPassword && editForm.confirmPassword 
                    }"
                  >
                  <p v-if="editForm.password !== editForm.confirmPassword && editForm.confirmPassword" 
                     class="text-xs text-red-500 mt-1">
                    Las contraseñas no coinciden
                  </p>
                </div>

                <!-- Información del sistema -->
                <div class="border-t pt-6">
                  <h4 class="font-medium text-gray-700 mb-4">Información del Sistema</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-500">ID de Usuario:</span>
                      <p class="font-medium text-gray-700">{{ userInfo.id }}</p>
                    </div>
                    <div>
                      <span class="text-gray-500">Estado:</span>
                      <p class="font-medium text-green-600">Activo</p>
                    </div>
                    <div>
                      <span class="text-gray-500">Tipo de Cuenta:</span>
                      <p class="font-medium text-gray-700">
                        {{ userInfo.role === 'admin' ? 'Administrador' : 'Usuario Estándar' }}
                      </p>
                    </div>
                    <div>
                      <span class="text-gray-500">Última Conexión:</span>
                      <p class="font-medium text-gray-700">{{ formatDateTime(new Date()) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Botones de acción -->
                <div v-if="isEditing" class="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    @click="cancelEditing"
                    class="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    :disabled="updating || (!!editForm.password && editForm.password !== editForm.confirmPassword)"
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span v-if="updating" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    {{ updating ? 'Guardando...' : 'Guardar Cambios' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Sección de seguridad -->
            <div class="mt-6 bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
              <h4 class="font-semibold text-red-800 mb-4">Zona de Peligro</h4>
              <p class="text-sm text-red-600 mb-4">
                Una vez que cierres sesión, tendrás que iniciar sesión nuevamente.
              </p>
              <button
                @click="logout"
                class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Toast de confirmación -->
    <div 
      v-if="showToast" 
      class="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all"
    >
      <div class="flex items-center gap-2">
        <span class="text-green-100">✓</span>
        {{ toastMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useParkingStore } from '../stores/parkingStore'
import { updateUser } from '../api/users'

// Interfaces
interface UserInfo {
  id: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
  updatedAt: string
}

interface EditForm {
  email: string
  password: string
  confirmPassword: string
}

// Stores y router
const authStore = useAuthStore()
const parkingStore = useParkingStore()
const router = useRouter()

// Estado reactivo
const loading = ref(false)
const error = ref<string | null>(null)
const isEditing = ref(false)
const updating = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

// Información del usuario
const userInfo = ref<UserInfo>({
  id: '',
  email: '',
  role: 'user',
  createdAt: '',
  updatedAt: ''
})

// Formulario de edición
const editForm = ref<EditForm>({
  email: '',
  password: '',
  confirmPassword: ''
})

// Estadísticas (para admins)
const stats = computed(() => {
  if (userInfo.value.role === 'admin') {
    const parkingStats = parkingStore.getStats()
    return {
      totalSpaces: parkingStats.total,
      occupiedSpaces: parkingStats.occupied,
      occupancyRate: parkingStats.occupancyRate.toFixed(1)
    }
  }
  return {
    totalSpaces: 0,
    occupiedSpaces: 0,
    occupancyRate: '0.0'
  }
})

// Métodos
const loadUserInfo = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Obtener información del usuario desde el store de auth
    if (authStore.user) {
      userInfo.value = {
        id: authStore.user.id.toString(),
        email: authStore.user.email,
        role: authStore.user.role as 'admin' | 'user',
        createdAt: new Date().toISOString(), // Placeholder
        updatedAt: new Date().toISOString()  // Placeholder
      }
    } else {
      throw new Error('No hay información de usuario disponible')
    }
    
    // Si es admin, cargar estadísticas
    if (userInfo.value.role === 'admin') {
      await parkingStore.loadParkingSpaces()
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al cargar información'
    console.error('Error loading user info:', err)
  } finally {
    loading.value = false
  }
}

const startEditing = () => {
  isEditing.value = true
  editForm.value = {
    email: userInfo.value.email,
    password: '',
    confirmPassword: ''
  }
}

const cancelEditing = () => {
  isEditing.value = false
  editForm.value = {
    email: '',
    password: '',
    confirmPassword: ''
  }
}

const saveProfile = async () => {
  try {
    updating.value = true
    
    // Validar contraseñas si se proporciona una nueva
    if (editForm.value.password && editForm.value.password !== editForm.value.confirmPassword) {
      throw new Error('Las contraseñas no coinciden')
    }

    if (editForm.value.password && editForm.value.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres')
    }

    const token = authStore.access_token
    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    // Preparar datos para actualizar
    const updateData: Partial<{ email: string; password: string }> = {
      email: editForm.value.email
    }

    // Solo incluir contraseña si se proporcionó una nueva
    if (editForm.value.password && editForm.value.password.trim()) {
      updateData.password = editForm.value.password
    }

    // Actualizar usuario en el servidor
    await updateUser(userInfo.value.id, updateData, token)
    
    // Actualizar información local
    userInfo.value.email = editForm.value.email
    userInfo.value.updatedAt = new Date().toISOString()
    
    // Actualizar el store de auth si cambió el email
    if (authStore.user) {
      authStore.user.email = editForm.value.email
      localStorage.setItem('user_data', JSON.stringify(authStore.user))
    }

    // Mostrar confirmación
    showToast.value = true
    toastMessage.value = 'Perfil actualizado correctamente'
    setTimeout(() => { showToast.value = false }, 3000)
    
    // Salir del modo edición
    isEditing.value = false
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al actualizar perfil'
    console.error('Error updating profile:', err)
  } finally {
    updating.value = false
  }
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

// Funciones de utilidad
const getInitials = (email: string): string => {
  return email.charAt(0).toUpperCase()
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (date: Date): string => {
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Inicialización
onMounted(async () => {
  await loadUserInfo()
})
</script>

<style scoped>
/* Asegurar que el componente use tema claro */
.profile-container {
  color: #374151;
  background-color: transparent;
}

/* Transiciones suaves para el toast */
.transition-all {
  transition: all 0.3s ease-in-out;
}

/* Estilos para inputs disabled */
input:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

/* Estilos para validación */
.border-red-300 {
  border-color: #fca5a5;
}

/* Hover effects para las tarjetas */
.shadow-sm:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>