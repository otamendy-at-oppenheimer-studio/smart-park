import { ref, computed } from 'vue'
import { useParkingStore } from '../stores/parkingStore'
import { createMultipleSpaces } from '../api/parking'

// Interface legacy para compatibilidad
interface LegacyParkingSpace {
  id: number
  number: string
  type: 'regular' | 'disabled' | 'vip'
  isOccupied: boolean
  vehicleId?: number
}

export function useParkingIntegration() {
  const store = useParkingStore()
  const initialized = ref(false)
  const useApiData = ref(true) // Flag para determinar si usar API o datos legacy

  // Intentar inicializar los espacios con la API
  const initializeSpaces = async () => {
    try {
      // Intentar cargar espacios existentes
      await store.loadParkingSpaces()
      
      // Si no hay espacios, crear algunos por defecto
      if (store.parkingSpaces.length === 0) {
        const token = localStorage.getItem('access_token')
        if (token) {
          console.log('No hay espacios, creando espacios por defecto...')
          await createMultipleSpaces(50, token) // Crear 50 espacios
          await store.loadParkingSpaces() // Recargar después de crear
        }
      }
      
      useApiData.value = true
      initialized.value = true
      console.log(`Inicializado con ${store.parkingSpaces.length} espacios de la API`)
      
    } catch (error) {
      console.warn('Error al cargar desde API, usando datos legacy:', error)
      useApiData.value = false
      initializeLegacySpaces()
    }
  }

  // Sistema legacy como fallback
  const legacySpaces = ref<LegacyParkingSpace[]>([])
  
  const initializeLegacySpaces = () => {
    const spaces: LegacyParkingSpace[] = []

    // Espacios regulares (1-80)
    for (let i = 1; i <= 80; i++) {
      spaces.push({
        id: i,
        number: padNumber(i),
        type: 'regular',
        isOccupied: false,
      })
    }

    // Espacios para discapacitados (81-90)
    for (let i = 81; i <= 90; i++) {
      spaces.push({
        id: i,
        number: padNumber(i),
        type: 'disabled',
        isOccupied: false,
      })
    }

    // Espacios VIP (91-100)
    for (let i = 91; i <= 100; i++) {
      spaces.push({
        id: i,
        number: padNumber(i),
        type: 'vip',
        isOccupied: false,
      })
    }

    legacySpaces.value = spaces
    initialized.value = true
    console.log(`Inicializado con ${spaces.length} espacios legacy`)
  }

  const padNumber = (num: number, length: number = 3): string => {
    return num.toString().length >= length 
      ? num.toString() 
      : ('000' + num.toString()).slice(-length)
  }

  // Convertir espacios API a formato legacy para compatibilidad
  const apiToLegacySpaces = computed((): LegacyParkingSpace[] => {
    return store.parkingSpaces.map((space, index) => ({
      id: index + 1, // Usar índice como ID legacy
      number: space.spaceCode,
      type: 'regular', // Por ahora todos son regulares
      isOccupied: space.status === 'occupied',
      vehicleId: space.status === 'occupied' ? index + 1000 : undefined
    }))
  })

  // Espacios finales que se usan en la app
  const parkingSpaces = computed(() => {
    return useApiData.value ? apiToLegacySpaces.value : legacySpaces.value
  })

  // Estadísticas
  const stats = computed(() => {
    if (useApiData.value) {
      return store.getStats()
    } else {
      const total = legacySpaces.value.length
      const occupied = legacySpaces.value.filter(s => s.isOccupied).length
      const free = total - occupied
      return {
        total,
        free,
        occupied,
        unknown: 0,
        occupancyRate: total > 0 ? (occupied / total) * 100 : 0
      }
    }
  })

  // Espacios disponibles
  const availableParkingSpaces = computed(() => {
    return parkingSpaces.value.filter(space => !space.isOccupied)
  })

  return {
    // Estado
    initialized,
    useApiData,
    parkingSpaces,
    availableParkingSpaces,
    stats,
    
    // Store para acceso directo cuando se use API
    store,
    
    // Métodos
    initializeSpaces,
  }
}