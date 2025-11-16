<template>
  <div class="main-content">
    <div class="bg-white rounded-xl shadow p-8 mb-8">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Registro de Vehículos</h2>
      <div class="grid md:grid-cols-2 gap-8">
        <!-- Entrada -->
        <div class="border rounded-xl p-6 bg-gray-50">
          <h3 class="font-semibold text-green-700 mb-4 text-lg">Entrada de Vehículo</h3>
          <form @submit.prevent="handleRegisterEntry" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Placa del Vehículo</label>
              <input
                v-model="entryForm.licensePlate"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ABC-123"
                required
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Vehículo</label>
              <select
                v-model="entryForm.vehicleType"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="car">Automóvil</option>
                <option value="motorcycle">Motocicleta</option>
                <option value="truck">Camioneta</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Espacio Asignado</label>
              <select
                v-model="entryForm.spaceId"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar espacio</option>
                <option
                  v-for="space in availableParkingSpaces"
                  :key="space.id"
                  :value="space.id"
                >
                  Espacio {{ space.number }} ({{ space.type === 'regular' ? 'Regular' : space.type === 'disabled' ? 'Discapacitados' : 'VIP' }})
                </option>
              </select>
            </div>
            <button
              type="submit"
              class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Registrar Entrada
            </button>
          </form>
        </div>

        <!-- Salida -->
        <div class="border rounded-xl p-6 bg-gray-50">
          <h3 class="font-semibold text-red-700 mb-4 text-lg">Salida de Vehículo</h3>
          <form @submit.prevent="handleRegisterExit" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Buscar por Placa</label>
              <input
                v-model="exitForm.licensePlate"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ABC-123"
                @input="handleSearchVehicle"
              >
            </div>
            <div v-if="foundVehicle" class="bg-white p-4 rounded-lg shadow">
              <p><strong>Vehículo:</strong> {{ foundVehicle.licensePlate }}</p>
              <p><strong>Espacio:</strong> {{ foundVehicle.spaceNumber }}</p>
              <p><strong>Entrada:</strong> {{ formatDateTime(foundVehicle.entryTime) }}</p>
              <p><strong>Tiempo:</strong> {{ calculateDuration(foundVehicle.entryTime) }}</p>
              <p class="text-lg font-semibold text-green-700">
                <strong>Total a Pagar:</strong> ${{ calculateFee(foundVehicle.entryTime) }}
              </p>
            </div>
            <button
              type="submit"
              :disabled="!foundVehicle"
              class="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:bg-gray-400"
            >
              Registrar Salida
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

interface ParkingSpace {
  id: number
  number: string
  type: 'regular' | 'disabled' | 'vip'
  isOccupied: boolean
  vehicleId?: number
}

interface Vehicle {
  id: number
  licensePlate: string
  vehicleType: 'car' | 'motorcycle' | 'truck'
  spaceId: number
  spaceNumber: string
  entryTime: Date
  exitTime?: Date
  totalFee?: number
}

interface Settings {
  carHourlyRate: number
  motorcycleHourlyRate: number
  truckHourlyRate: number
  minimumChargeTime: number
  graceTime: number
}

// Props
const props = defineProps<{
  availableParkingSpaces: ParkingSpace[]
  activeVehicles: Vehicle[]
  settings: Settings
}>()

// Emits
const emit = defineEmits<{
  registerEntry: [form: { licensePlate: string; vehicleType: string; spaceId: string }]
  registerExit: [vehicle: Vehicle]
}>()

// Estado local
const entryForm = ref({
  licensePlate: '',
  vehicleType: 'car' as 'car' | 'motorcycle' | 'truck',
  spaceId: ''
})

const exitForm = ref({
  licensePlate: ''
})

const foundVehicle = ref<Vehicle | null>(null)

// Métodos
const handleRegisterEntry = () => {
  emit('registerEntry', { ...entryForm.value })
  // Limpiar formulario
  entryForm.value = {
    licensePlate: '',
    vehicleType: 'car',
    spaceId: ''
  }
}

const handleSearchVehicle = () => {
  if (!exitForm.value.licensePlate) {
    foundVehicle.value = null
    return
  }
  
  const vehicle = props.activeVehicles.find(v => 
    v.licensePlate.toLowerCase() === exitForm.value.licensePlate.toLowerCase()
  )
  
  foundVehicle.value = vehicle || null
}

const handleRegisterExit = () => {
  if (!foundVehicle.value) return
  
  emit('registerExit', foundVehicle.value)
  exitForm.value.licensePlate = ''
  foundVehicle.value = null
}

const calculateFee = (entryTime: Date, exitTime?: Date): string => {
  const exit = exitTime || new Date()
  const durationMs = exit.getTime() - new Date(entryTime).getTime()
  const durationMinutes = Math.max(durationMs / (1000 * 60), props.settings.minimumChargeTime)
  
  const chargeableMinutes = Math.max(0, durationMinutes - props.settings.graceTime)
  const hours = Math.ceil(chargeableMinutes / 60)
  
  const hourlyRate = props.settings.carHourlyRate
  
  return (hours * hourlyRate).toFixed(2)
}

const calculateDuration = (entryTime: Date, exitTime?: Date): string => {
  const exit = exitTime || new Date()
  const durationMs = exit.getTime() - new Date(entryTime).getTime()
  const hours = Math.floor(durationMs / (1000 * 60 * 60))
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
  
  return `${hours}h ${minutes}m`
}

const formatDateTime = (date: Date): string => {
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
