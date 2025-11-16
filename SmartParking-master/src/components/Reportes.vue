<template>
  <div class="main-content">
    <div class="bg-white rounded-xl shadow p-8 mb-8">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Reportes y Estadísticas</h2>
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-blue-50 p-6 rounded-lg shadow">
          <h3 class="font-medium text-blue-900 mb-2">Ingresos del Día</h3>
          <p class="text-2xl font-bold text-blue-600">${{ dailyRevenue }}</p>
        </div>
        <div class="bg-green-50 p-6 rounded-lg shadow">
          <h3 class="font-medium text-green-900 mb-2">Vehículos Atendidos</h3>
          <p class="text-2xl font-bold text-green-600">{{ dailyVehicles }}</p>
        </div>
        <div class="bg-purple-50 p-6 rounded-lg shadow">
          <h3 class="font-medium text-purple-900 mb-2">Tiempo Promedio</h3>
          <p class="text-2xl font-bold text-purple-600">{{ averageStayTime }}</p>
        </div>
      </div>

      <div>
        <h3 class="font-medium mb-4 text-lg text-gray-700">Historial de Transacciones</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 rounded-lg shadow">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salida</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in recentTransactions" :key="transaction.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ transaction.licensePlate }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDateTime(transaction.entryTime) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDateTime(transaction.exitTime) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ calculateDuration(transaction.entryTime, transaction.exitTime) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  ${{ transaction.totalFee }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, defineProps } from 'vue'

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

// Props
const props = defineProps<{
  completedTransactions: Vehicle[]
}>()

// Computed
const dailyRevenue = computed(() => 
  props.completedTransactions
    .filter(t => isToday(t.exitTime!))
    .reduce((sum, t) => sum + (t.totalFee || 0), 0)
    .toFixed(2)
)

const dailyVehicles = computed(() => 
  props.completedTransactions.filter(t => isToday(t.exitTime!)).length
)

const averageStayTime = computed(() => {
  const todayTransactions = props.completedTransactions.filter(t => isToday(t.exitTime!))
  if (todayTransactions.length === 0) return '0h 0m'
  
  const totalMinutes = todayTransactions.reduce((sum, t) => {
    const duration = new Date(t.exitTime!).getTime() - new Date(t.entryTime).getTime()
    return sum + (duration / (1000 * 60))
  }, 0)
  
  const avgMinutes = Math.round(totalMinutes / todayTransactions.length)
  const hours = Math.floor(avgMinutes / 60)
  const minutes = avgMinutes % 60
  return `${hours}h ${minutes}m`
})

const recentTransactions = computed(() => 
  props.completedTransactions
    .slice(-10)
    .reverse()
)

// Métodos
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

const isToday = (date: Date): boolean => {
  const today = new Date()
  const checkDate = new Date(date)
  return checkDate.toDateString() === today.toDateString()
}
</script>
