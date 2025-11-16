<template>
  <div class="w-full min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex flex-col configuracion-container">
    <div class="bg-white rounded-2xl shadow-lg p-8 my-8 mx-auto w-full max-w-7xl flex-1">
      <h2 class="text-2xl font-bold mb-8 text-center text-blue-800 tracking-wide">Configuración del Sistema</h2>
      
      <!-- Tabs de navegación -->
      <div class="flex border-b border-gray-200 mb-8">
        <button
          @click="activeTab = 'settings'"
          :class="[
            'px-6 py-3 font-medium text-sm border-b-2 transition-colors',
            activeTab === 'settings'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Configuración General
        </button>
        <button
          @click="activeTab = 'users'"
          :class="[
            'px-6 py-3 font-medium text-sm border-b-2 transition-colors',
            activeTab === 'users'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Gestión de Usuarios
        </button>
        <button
          @click="activeTab = 'spaces'"
          :class="[
            'px-6 py-3 font-medium text-sm border-b-2 transition-colors',
            activeTab === 'spaces'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Gestión de Espacios
        </button>
      </div>

      <!-- Configuración General -->
      <div v-if="activeTab === 'settings'" class="space-y-6">
        <div class="bg-gray-50 rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4 text-gray-800">Tarifas del Estacionamiento</h3>
          <div class="grid md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tarifa por Hora (Automóvil)</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  v-model.number="localSettings.carHourlyRate"
                  type="number"
                  step="0.01"
                  class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tarifa por Hora (Motocicleta)</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  v-model.number="localSettings.motorcycleHourlyRate"
                  type="number"
                  step="0.01"
                  class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tarifa por Hora (Camioneta)</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  v-model.number="localSettings.truckHourlyRate"
                  type="number"
                  step="0.01"
                  class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4 text-gray-800">Configuración Temporal</h3>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tiempo Mínimo de Cobro (minutos)</label>
              <input
                v-model.number="localSettings.minimumChargeTime"
                type="number"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tiempo de Gracia (minutos)</label>
              <input
                v-model.number="localSettings.graceTime"
                type="number"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
            </div>
          </div>
        </div>
        
        <div class="flex justify-end">
          <button
            @click="handleSaveSettings"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            :disabled="savingSettings"
          >
            <span v-if="savingSettings" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            {{ savingSettings ? 'Guardando...' : 'Guardar Configuración' }}
          </button>
        </div>
      </div>

      <!-- Gestión de Usuarios -->
      <div v-else-if="activeTab === 'users'" class="space-y-6">
        <!-- Crear nuevo usuario -->
        <div class="bg-green-50 rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4 text-gray-800">Crear Nuevo Usuario</h3>
          <div class="grid md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                v-model="newUser.email"
                type="email"
                placeholder="usuario@ejemplo.com"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <input
                v-model="newUser.password"
                type="password"
                placeholder="Contraseña"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              <select
                v-model="newUser.role"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div class="flex items-end">
              <button
                @click="createNewUser"
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full"
                :disabled="creatingUser || !newUser.email || !newUser.password"
              >
                {{ creatingUser ? 'Creando...' : 'Crear Usuario' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Lista de usuarios -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800">Usuarios del Sistema</h3>
            <button
              @click="loadUsers"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              :disabled="loadingUsers"
            >
              <span class="text-sm">🔄</span>
              {{ loadingUsers ? 'Cargando...' : 'Actualizar' }}
            </button>
          </div>

          <!-- Loading state -->
          <div v-if="loadingUsers" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>

          <!-- Error state -->
          <div v-else-if="usersError" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-700">{{ usersError }}</p>
          </div>

          <!-- Users table -->
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span class="text-blue-600 font-medium text-sm">{{ user.email.charAt(0).toUpperCase() }}</span>
                      </div>
                      <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900">{{ user.email }}</div>
                        <div class="text-sm text-gray-500">ID: {{ user.id }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    ]">
                      {{ user.role === 'admin' ? 'Administrador' : 'Usuario' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(user.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      user.deleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    ]">
                      {{ user.deleted ? 'Eliminado' : 'Activo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      @click="startEditUser(user)"
                      class="text-blue-600 hover:text-blue-900"
                      :disabled="!!user.deleted"
                    >
                      Editar
                    </button>
                    <button
                      @click="confirmDeleteUser(user)"
                      class="text-red-600 hover:text-red-900"
                      :disabled="isUserDisabled(user)"
                    >
                      {{ user.deleted ? 'Eliminado' : 'Eliminar' }}
                    </button>
                  </td>
                </tr>
                <tr v-if="users.length === 0">
                  <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    No hay usuarios registrados
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Gestión de Espacios -->
      <div v-else-if="activeTab === 'spaces'" class="space-y-6">
        <div class="bg-blue-50 rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4 text-gray-800">Crear Espacios en Lote</h3>
          <div class="flex items-end gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad de espacios a crear</label>
              <input
                v-model.number="spacesToCreate"
                type="number"
                min="1"
                max="100"
                placeholder="Ej: 10"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
            </div>
            <button
              @click="createSpaces"
              class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              :disabled="creatingSpaces || !spacesToCreate || spacesToCreate < 1"
            >
              {{ creatingSpaces ? 'Creando...' : 'Crear Espacios' }}
            </button>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4 text-gray-800">Estadísticas de Espacios</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-gray-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-gray-800">{{ parkingStore.parkingSpaces.length }}</div>
              <div class="text-sm text-gray-600">Total Espacios</div>
            </div>
            <div class="bg-green-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-green-800">{{ parkingStore.getStats().free }}</div>
              <div class="text-sm text-green-600">Libres</div>
            </div>
            <div class="bg-red-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-red-800">{{ parkingStore.getStats().occupied }}</div>
              <div class="text-sm text-red-600">Ocupados</div>
            </div>
            <div class="bg-yellow-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-yellow-800">{{ parkingStore.getStats().unknown }}</div>
              <div class="text-sm text-yellow-600">Desconocido</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de edición de usuario -->
    <div v-if="editingUser" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Editar Usuario</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              v-model="editingUser.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña (opcional)</label>
            <input
              v-model="editingUser.password"
              type="password"
              placeholder="Dejar vacío para mantener la actual"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rol</label>
            <select
              v-model="editingUser.role"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="cancelEdit"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="saveUserEdit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            :disabled="updatingUser"
          >
            {{ updatingUser ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="userToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4 text-red-800">Confirmar Eliminación</h3>
        <p class="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar al usuario <strong>{{ userToDelete.email }}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="userToDelete = null"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="deleteUserConfirmed"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            :disabled="deletingUser"
          >
            {{ deletingUser ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useParkingStore } from '../stores/parkingStore'
import { createUser, updateUser, deleteUser } from '../api/users'
import { createMultipleSpaces } from '../api/parking'
import { API_BASE_URL } from '../api/index'

// Interfaces
interface Settings {
  carHourlyRate: number
  motorcycleHourlyRate: number
  truckHourlyRate: number
  minimumChargeTime: number
  graceTime: number
}

interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
  updatedAt: string
  deleted: string | null
}

interface NewUser {
  email: string
  password: string
  role: 'admin' | 'user'
}

// Props
const props = defineProps<{
  settings: Settings
}>()

// Emits
const emit = defineEmits<{
  saveSettings: [settings: Settings]
}>()

// Stores
const authStore = useAuthStore()
const parkingStore = useParkingStore()

// Estado reactivo
const activeTab = ref<'settings' | 'users' | 'spaces'>('settings')
const localSettings = ref<Settings>({ ...props.settings })

// Estado para usuarios
const users = ref<User[]>([])
const loadingUsers = ref(false)
const usersError = ref<string | null>(null)
const creatingUser = ref(false)
const updatingUser = ref(false)
const deletingUser = ref(false)

// Estado para modales
const editingUser = ref<Partial<User & { password?: string }> | null>(null)
const userToDelete = ref<User | null>(null)

// Estado para nuevo usuario
const newUser = ref<NewUser>({
  email: '',
  password: '',
  role: 'user'
})

// Estado para configuración
const savingSettings = ref(false)

// Estado para espacios
const spacesToCreate = ref<number>(10)
const creatingSpaces = ref(false)

// Watchers
watch(() => props.settings, (newSettings) => {
  localSettings.value = { ...newSettings }
}, { deep: true })

// Métodos para configuración
const handleSaveSettings = async () => {
  try {
    savingSettings.value = true
    emit('saveSettings', { ...localSettings.value })
    // Simular guardado exitoso
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Error saving settings:', error)
  } finally {
    savingSettings.value = false
  }
}

// Métodos para usuarios
const loadUsers = async () => {
  try {
    loadingUsers.value = true
    usersError.value = null
    const token = authStore.access_token
    
    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    // Agregar token a la función getUsers
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    users.value = await response.json()
  } catch (error) {
    usersError.value = error instanceof Error ? error.message : 'Error al cargar usuarios'
    console.error('Error loading users:', error)
  } finally {
    loadingUsers.value = false
  }
}

const createNewUser = async () => {
  try {
    creatingUser.value = true
    const token = authStore.access_token
    
    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    await createUser(newUser.value, token)
    
    // Limpiar formulario
    newUser.value = {
      email: '',
      password: '',
      role: 'user'
    }
    
    // Recargar usuarios
    await loadUsers()
  } catch (error) {
    console.error('Error creating user:', error)
    alert('Error al crear usuario: ' + (error instanceof Error ? error.message : 'Error desconocido'))
  } finally {
    creatingUser.value = false
  }
}

const startEditUser = (user: User) => {
  editingUser.value = {
    id: user.id,
    email: user.email,
    role: user.role,
    password: '' // Campo para nueva contraseña
  }
}

const cancelEdit = () => {
  editingUser.value = null
}

const saveUserEdit = async () => {
  if (!editingUser.value?.id) return
  
  try {
    updatingUser.value = true
    const token = authStore.access_token
    
    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    const updateData: Partial<{ email: string; password: string; role: string }> = {
      email: editingUser.value.email,
      role: editingUser.value.role
    }

    // Solo incluir contraseña si se proporcionó una nueva
    if (editingUser.value.password && editingUser.value.password.trim()) {
      updateData.password = editingUser.value.password
    }

    await updateUser(editingUser.value.id, updateData, token)
    
    editingUser.value = null
    await loadUsers()
  } catch (error) {
    console.error('Error updating user:', error)
    alert('Error al actualizar usuario: ' + (error instanceof Error ? error.message : 'Error desconocido'))
  } finally {
    updatingUser.value = false
  }
}

const confirmDeleteUser = (user: User) => {
  userToDelete.value = user
}

const deleteUserConfirmed = async () => {
  if (!userToDelete.value?.id) return
  
  try {
    deletingUser.value = true
    const token = authStore.access_token
    
    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    await deleteUser(userToDelete.value.id, token)
    
    userToDelete.value = null
    await loadUsers()
  } catch (error) {
    console.error('Error deleting user:', error)
    alert('Error al eliminar usuario: ' + (error instanceof Error ? error.message : 'Error desconocido'))
  } finally {
    deletingUser.value = false
  }
}

// Métodos para espacios
const createSpaces = async () => {
  try {
    creatingSpaces.value = true
    const token = authStore.access_token
    
    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    await createMultipleSpaces(spacesToCreate.value, token)
    await parkingStore.loadParkingSpaces()
    
    spacesToCreate.value = 10 // Reset
  } catch (error) {
    console.error('Error creating spaces:', error)
    alert('Error al crear espacios: ' + (error instanceof Error ? error.message : 'Error desconocido'))
  } finally {
    creatingSpaces.value = false
  }
}

// Utilidades
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isUserDisabled = (user: User): boolean => {
  return !!user.deleted || (authStore.user ? user.id === String(authStore.user.id) : false)
}

// Inicialización
onMounted(async () => {
  if (authStore.hasRole('admin')) {
    await loadUsers()
  }
  await parkingStore.loadParkingSpaces()
})
</script>

<style scoped>
/* Asegurar que el componente use tema claro */
.configuracion-container {
  color: #374151;
  background-color: #ffffff;
}

/* Asegurar que los inputs tengan el estilo correcto */
input, select, textarea {
  color: #374151;
  background-color: #ffffff;
}

/* Asegurar que los botones tengan el estilo correcto */
button {
  color: inherit;
  background-color: transparent;
}

/* Clases específicas para botones con colores */
.btn-primary {
  color: #ffffff;
  background-color: #2563eb;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-success {
  color: #ffffff;
  background-color: #16a34a;
}

.btn-success:hover {
  background-color: #15803d;
}

.btn-danger {
  color: #ffffff;
  background-color: #dc2626;
}

.btn-danger:hover {
  background-color: #b91c1c;
}
</style>
