import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAllSpaces, setSpaceStatus } from '../api/parking'
import { createOccupancyEvent, getAllOccupancyEvents } from '../api/occupancy'

// Interfaces basadas en la API
interface ParkingSpace {
  id: string
  spaceCode: string
  status: 'free' | 'occupied' | 'unknown'
  floor: string | null
  sensors: Sensor[]
  createdAt: string
  updatedAt: string
}

interface Sensor {
  id: string
  hwId: string
  type: 'ultrasonic' | 'magnetic' | 'radar'
  locationDescription: string | null
  active: boolean
}

interface OccupancyEvent {
  id: string
  parkingSpace: {
    id: string
    spaceCode: string
    status: string
    floor: string | null
  }
  status: 'free' | 'occupied' | 'unknown'
  timestamp: string
}

export const useParkingStore = defineStore('parking', () => {
  const parkingSpaces = ref<ParkingSpace[]>([])
  const occupancyEvents = ref<OccupancyEvent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialLoadComplete = ref(false)

  // Cargar todos los espacios de estacionamiento
  const loadParkingSpaces = async (showLoading = false) => {
    try {
      // Solo mostrar loading si se solicita explícitamente Y es la primera carga
      if (showLoading && !initialLoadComplete.value) {
        loading.value = true
      }
      error.value = null
      const spaces = await getAllSpaces()
      parkingSpaces.value = spaces
      if (!initialLoadComplete.value) {
        initialLoadComplete.value = true
        loading.value = false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar espacios'
      console.error('Error loading parking spaces:', err)
      if (showLoading && !initialLoadComplete.value) {
        loading.value = false
      }
    }
  }

  // Cargar eventos de ocupación
  const loadOccupancyEvents = async () => {
    try {
      const events = await getAllOccupancyEvents()
      occupancyEvents.value = events
    } catch (err) {
      console.error('Error loading occupancy events:', err)
    }
  }

  // Cambiar estado de un espacio (manual override)
  const toggleSpaceStatus = async (spaceId: string, newStatus: 'free' | 'occupied') => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      // Actualizar en el servidor
      await setSpaceStatus(spaceId, newStatus, token)
      
      // Crear evento de ocupación
      await createOccupancyEvent({
        parkingSpaceId: spaceId,
        status: newStatus
      })

      // Actualizar el estado local
      const space = parkingSpaces.value.find(s => s.id === spaceId)
      if (space) {
        space.status = newStatus
        space.updatedAt = new Date().toISOString()
      }

      // Recargar eventos
      await loadOccupancyEvents()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar espacio'
      console.error('Error toggling space status:', err)
      throw err
    }
  }

  // Obtener estadísticas
  const getStats = () => {
    const total = parkingSpaces.value.length
    const free = parkingSpaces.value.filter(s => s.status === 'free').length
    const occupied = parkingSpaces.value.filter(s => s.status === 'occupied').length
    const unknown = parkingSpaces.value.filter(s => s.status === 'unknown').length

    return {
      total,
      free,
      occupied,
      unknown,
      occupancyRate: total > 0 ? (occupied / total) * 100 : 0
    }
  }

  // Obtener eventos recientes de un espacio
  const getSpaceEvents = (spaceId: string) => {
    return occupancyEvents.value
      .filter(event => event.parkingSpace.id === spaceId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  // Obtener eventos recientes generales
  const getRecentEvents = (limit = 10) => {
    return occupancyEvents.value
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  return { 
    parkingSpaces, 
    occupancyEvents, 
    loading, 
    error,
    loadParkingSpaces,
    loadOccupancyEvents,
    toggleSpaceStatus,
    getStats,
    getSpaceEvents,
    getRecentEvents
  }
})
