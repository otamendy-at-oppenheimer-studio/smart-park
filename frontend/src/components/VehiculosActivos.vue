<script setup lang="ts">
import { computed, ref } from 'vue'
import { useParkingStore } from '../stores/parkingStore'

const store = useParkingStore()
const searchQuery = ref('')

// Filtrar vehículos activos por búsqueda (ejemplo: espacio)
const filteredActiveVehicles = computed(() =>
  store.activeVehicles.filter(vehicle =>
    vehicle.spaceNumber.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

const handleProcessExit = (vehicleId: number) => {
  store.processExit(vehicleId)
}
</script>

<template>
  <div class="main-content">
    <div class="bg-white rounded-xl shadow p-8 mb-8">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Vehículos Activos</h2>

      <!-- 🔍 Buscador -->
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por espacio..."
          class="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- 📋 Tabla -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 rounded-lg shadow">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600">Espacio</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600">Placa</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600">Entrada</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="vehicle in filteredActiveVehicles" :key="vehicle.id">
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ vehicle.spaceNumber }}
              </td>
              <!-- columnas vacías -->
              <td class="px-6 py-4 text-sm text-gray-500">-</td>
              <td class="px-6 py-4 text-sm text-gray-500">-</td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ new Date(vehicle.entryTime).toLocaleTimeString() }}
              </td>
              <td class="px-6 py-4 text-sm">
                <button
                  @click="handleProcessExit(vehicle.id)"
                  class="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200"
                >
                  Procesar Salida
                </button>
              </td>
            </tr>
            <!-- si no hay vehículos activos -->
            <tr v-if="filteredActiveVehicles.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                No hay vehículos activos
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
