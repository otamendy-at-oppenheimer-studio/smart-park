<template>
  <div class="w-full min-h-screen bg-gray-100 flex flex-col dashboard-container">
    <div class="bg-white rounded-2xl shadow-lg p-8 my-8 mx-auto w-full max-w-7xl flex-1">
      <h2 class="text-2xl font-bold mb-8 text-center text-gray-800 tracking-wide">Estacionamiento</h2>
      
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <p class="text-red-700">{{ error }}</p>
        <button @click="refreshData" class="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Reintentar
        </button>
      </div>

      <!-- Dashboard content -->
      <template v-else>
        <!-- Resumen general arriba -->
        <div class="flex flex-wrap justify-center gap-6 mb-10">
          <div class="bg-gray-50 rounded-xl px-6 py-3 flex flex-col items-center shadow min-w-[120px]">
            <span class="text-gray-600 text-xs">Total lugares</span>
            <span class="font-bold text-2xl text-gray-900">{{ stats.total }}</span>
          </div>
          <div class="bg-green-50 rounded-xl px-6 py-3 flex flex-col items-center shadow min-w-[120px]">
            <span class="text-green-600 text-xs">Disponibles</span>
            <span class="font-bold text-2xl text-green-700">{{ stats.free }}</span>
          </div>
          <div class="bg-red-50 rounded-xl px-6 py-3 flex flex-col items-center shadow min-w-[120px]">
            <span class="text-red-600 text-xs">Ocupados</span>
            <span class="font-bold text-2xl text-red-700">{{ stats.occupied }}</span>
          </div>
          <div class="bg-yellow-50 rounded-xl px-6 py-3 flex flex-col items-center shadow min-w-[120px]">
            <span class="text-yellow-600 text-xs">Desconocido</span>
            <span class="font-bold text-2xl text-yellow-700">{{ stats.unknown }}</span>
          </div>
          <div class="bg-gray-50 rounded-xl px-6 py-3 flex flex-col items-center shadow min-w-[120px]">
            <span class="text-gray-600 text-xs">Ocupación</span>
            <span class="font-bold text-2xl text-gray-900">{{ stats.occupancyRate.toFixed(1) }}%</span>
          </div>
        </div>

        <!-- Controles -->
        <div class="flex justify-between items-center mb-6">
          <button 
            @click="refreshData" 
            class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
            :disabled="loading"
          >
            <span class="text-sm">🔄</span>
            Actualizar
          </button>
          
          <div class="text-sm text-gray-500">
            Última actualización: {{ lastUpdate ? formatDateTime(lastUpdate) : 'Nunca' }}
          </div>
        </div>

        <!-- Mapa de lugares y panel lateral -->
        <div class="flex flex-col lg:flex-row items-start gap-8">
          <!-- Mapa de lugares -->
          <div class="bg-white rounded-xl shadow p-6 w-full flex-1">
            <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-8 w-full">
              <div
                v-for="space in parkingSpaces"
                :key="space.id"
                @click="selectSpace(space)"
                :class="[ 
                  'w-20 h-20 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-xs font-medium relative group select-none',
                  getSpaceClasses(space),
                  selectedSpace?.id === space.id ? 'ring-4 ring-gray-400 scale-105 z-10' : ''
                ]"
                :title="`${space.spaceCode} - ${getStatusText(space.status)} - Click para cambiar estado`"
              >
                <span class="text-2xl mb-1">{{ getSpaceIcon(space) }}</span>
                <div class="text-lg font-bold leading-tight">{{ space.spaceCode }}</div>
                <div class="text-[0.7rem] capitalize">{{ getStatusText(space.status) }}</div>
                <span v-if="space.status === 'occupied'" class="absolute bottom-1 right-1 text-sm text-red-700 font-semibold animate-pulse">●</span>
                <div v-if="selectedSpace?.id === space.id" class="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg z-20 whitespace-nowrap">
                  Seleccionado
                </div>
              </div>
            </div>

            <!-- Detalles del lugar seleccionado debajo del mapa -->
            <div v-if="selectedSpace" class="mt-8 bg-white border border-gray-300 rounded-xl p-6 shadow">
              <h3 class="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
                <span class="text-xl">{{ getSpaceIcon(selectedSpace) }}</span>
                Detalles del Espacio {{ selectedSpace.spaceCode }}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <div><strong>Código:</strong> {{ selectedSpace.spaceCode }}</div>
                  <div><strong>Estado:</strong> 
                    <span :class="getStatusTextClasses(selectedSpace.status)">
                      {{ getStatusText(selectedSpace.status) }}
                    </span>
                  </div>
                  <div v-if="selectedSpace.floor"><strong>Piso:</strong> {{ selectedSpace.floor }}</div>
                  <div><strong>Sensores:</strong> {{ selectedSpace.sensors.length }}</div>
                  <div><strong>Última actualización:</strong> {{ formatDateTime(selectedSpace.updatedAt) }}</div>
                </div>
                <div class="space-y-2">
                  <button 
                    @click="toggleStatus('free')"
                    :disabled="selectedSpace.status === 'free' || updating"
                    class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Marcar como Libre
                  </button>
                  <button 
                    @click="toggleStatus('occupied')"
                    :disabled="selectedSpace.status === 'occupied' || updating"
                    class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Marcar como Ocupado
                  </button>
                </div>
              </div>

              <!-- Historial del espacio -->
              <div v-if="spaceEvents.length > 0" class="mt-6">
                <h4 class="font-semibold text-gray-700 mb-3">Historial Reciente</h4>
                <div class="max-h-40 overflow-y-auto space-y-2">
                  <div 
                    v-for="event in spaceEvents.slice(0, 5)" 
                    :key="event.id" 
                    class="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span :class="getStatusTextClasses(event.status)">
                      {{ getStatusText(event.status) }}
                    </span>
                    <span class="text-sm text-gray-500">
                      {{ formatDateTime(event.timestamp) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel lateral: Eventos recientes -->
          <div class="w-full lg:w-96 space-y-6">
            <!-- Eventos recientes -->
            <div class="bg-white border border-gray-200 rounded-xl p-6 shadow">
              <h3 class="font-semibold text-gray-700 mb-4 text-lg">Eventos Recientes</h3>
              <div class="space-y-3 max-h-80 overflow-y-auto">
                <div 
                  v-for="event in recentEvents" 
                  :key="event.id"
                  class="p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="font-medium">{{ event.parkingSpace.spaceCode }}</div>
                      <div :class="getStatusTextClasses(event.status)" class="text-sm">
                        {{ getStatusText(event.status) }}
                      </div>
                    </div>
                    <div class="text-xs text-gray-500 text-right">
                      {{ formatDateTime(event.timestamp) }}
                    </div>
                  </div>
                </div>
                <div v-if="recentEvents.length === 0" class="text-center text-gray-400 py-4">
                  No hay eventos recientes
                </div>
              </div>
            </div>

            <!-- Leyenda -->
            <div class="bg-white border border-gray-200 rounded-xl p-6 shadow">
              <h3 class="font-semibold text-gray-700 mb-4 text-lg">Leyenda</h3>
              <div class="space-y-2">
                <div class="flex items-center gap-3">
                  <div class="w-4 h-4 bg-green-200 border-2 border-green-400 rounded"></div>
                  <span class="text-sm text-gray-700">Libre</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-4 h-4 bg-red-200 border-2 border-red-500 rounded"></div>
                  <span class="text-sm text-gray-700">Ocupado</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-4 h-4 bg-yellow-200 border-2 border-yellow-400 rounded"></div>
                  <span class="text-sm text-gray-700">Desconocido</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useParkingStore } from '../stores/parkingStore'

// Interfaces para tipos locales (para compatibilidad con props existentes)
interface ParkingSpace {
  id: string
  spaceCode: string
  status: 'free' | 'occupied' | 'unknown'
  floor: string | null
  sensors: any[]
  createdAt: string
  updatedAt: string
}

// Props opcionales para compatibilidad con sistema legacy
defineProps<{
  parkingSpaces?: ParkingSpace[] // Opcional para compatibilidad (legacy)
  selectedSpace?: ParkingSpace | null
  completedTransactions?: any[]
}>()

const emit = defineEmits<{
  selectSpace: [space: ParkingSpace]
}>()

// Usar el store directamente para obtener los datos
const store = useParkingStore()
const selectedSpace = ref<ParkingSpace | null>(null)
const updating = ref(false)
const lastUpdate = ref<Date | null>(null)

// Polling para actualizaciones automáticas
let pollingInterval: number | null = null

// Computadas que usan el store
const parkingSpaces = computed(() => store.parkingSpaces)
const loading = computed(() => store.loading)
const error = computed(() => store.error)
const stats = computed(() => store.getStats())
const recentEvents = computed(() => store.getRecentEvents())
const spaceEvents = computed(() => 
  selectedSpace.value ? store.getSpaceEvents(selectedSpace.value.id) : []
)

// Inicialización
onMounted(async () => {
  await refreshData()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})

// Funciones
const refreshData = async () => {
  try {
    await Promise.all([
      store.loadParkingSpaces(),
      store.loadOccupancyEvents()
    ])
    lastUpdate.value = new Date()
  } catch (err) {
    console.error('Error refreshing data:', err)
  }
}

const startPolling = () => {
  // Actualizar cada 10 segundos
  pollingInterval = setInterval(refreshData, 10000)
}

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

const selectSpace = (space: ParkingSpace) => {
  selectedSpace.value = space
  emit('selectSpace', space)
}

const toggleStatus = async (newStatus: 'free' | 'occupied') => {
  if (!selectedSpace.value || updating.value) return
  
  try {
    updating.value = true
    await store.toggleSpaceStatus(selectedSpace.value.id, newStatus)
    // El selectedSpace se actualizará automáticamente por reactividad
  } catch (err) {
    console.error('Error updating space status:', err)
  } finally {
    updating.value = false
  }
}

// Funciones de utilidad
const getSpaceClasses = (space: ParkingSpace) => {
  switch (space.status) {
    case 'free':
      return 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200'
    case 'occupied':
      return 'bg-red-300 border-red-500 text-red-900'
    case 'unknown':
    default:
      return 'bg-yellow-100 border-yellow-300 text-yellow-700'
  }
}

const getSpaceIcon = (_space: ParkingSpace) => {
  // Por ahora, todos los espacios usan el mismo icono
  // Podrías agregar lógica para diferentes tipos basándose en el floor o sensors
  return '🅿️'
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'free':
      return 'Libre'
    case 'occupied':
      return 'Ocupado'
    case 'unknown':
    default:
      return 'Desconocido'
  }
}

const getStatusTextClasses = (status: string) => {
  switch (status) {
    case 'free':
      return 'text-green-700 font-medium'
    case 'occupied':
      return 'text-red-700 font-medium'
    case 'unknown':
    default:
      return 'text-yellow-700 font-medium'
  }
}

const formatDateTime = (dateStr: string | Date) => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return date.toLocaleString('es-ES', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  })
}
</script>

<style scoped>
/* Asegurar que el Dashboard use tema claro */
.dashboard-container {
  color: #374151;
  background-color: transparent;
}

/* Resetear cualquier herencia de color para textos */
span, div, p, h1, h2, h3, h4, h5, h6 {
  color: inherit;
}

/* Asegurar que los elementos sin clase de color específica usen el color por defecto */
.text-sm:not([class*="text-"]) {
  color: #374151;
}

.text-xs:not([class*="text-"]) {
  color: #6b7280;
}

/* Forzar texto blanco en el tooltip de seleccionado */
.bg-gray-800.text-white {
  color: white !important;
}
</style>