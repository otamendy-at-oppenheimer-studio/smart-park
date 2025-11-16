<template>
  <div class="bg-gray-50 min-h-screen flex flex-col">
    <Header v-if="authStore.isAuthenticated" :tabs="tabs" />
    <main class="flex-1 w-full">
      <router-view v-slot="{ Component }">
        <component :is="Component" v-bind="getRouteProps()" />
      </router-view>
    </main>
    <Footer v-if="authStore.isAuthenticated" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "./stores/authStore";
import { NAVIGATION_TABS } from "./config/permissions";
import { useParkingIntegration } from "./composables/useParkingIntegration";
import Header from "./components/Layout/Header.vue";
import Footer from "./components/Layout/Footer.vue";

const route = useRoute();
const authStore = useAuthStore();

// Usar el nuevo composable de integración
const parking = useParkingIntegration();

// Tabs filtrados por permisos
const tabs = computed(() => NAVIGATION_TABS.map(tab => ({
  id: tab.id,
  name: tab.name,
  path: tab.path,
  requiredRoles: [...tab.requiredRoles]
})));

// Interfaces para otros componentes
interface Vehicle {
  id: number;
  licensePlate: string;
  vehicleType: "car" | "motorcycle" | "truck";
  spaceId: number;
  spaceNumber: string;
  entryTime: Date;
  exitTime?: Date;
  totalFee?: number;
}

interface Settings {
  carHourlyRate: number;
  motorcycleHourlyRate: number;
  truckHourlyRate: number;
  minimumChargeTime: number;
  graceTime: number;
}

// Estado reactivo para componentes legacy
const selectedSpace = ref<any>(null);
const activeVehicles = ref<Vehicle[]>([]);
const completedTransactions = ref<Vehicle[]>([]);

// Configuración
const settings = ref<Settings>({
  carHourlyRate: 25.0,
  motorcycleHourlyRate: 15.0,
  truckHourlyRate: 35.0,
  minimumChargeTime: 30,
  graceTime: 15,
});

function getRouteProps() {
  if (route.path === "/dashboard" || route.path === "/") {
    return {
      parkingSpaces: parking.parkingSpaces.value,
      selectedSpace: selectedSpace.value,
      completedTransactions: completedTransactions.value,
    };
  }
  if (route.path === "/registro") {
    return {
      availableParkingSpaces: parking.availableParkingSpaces.value,
      activeVehicles: activeVehicles.value,
      settings: settings.value,
    };
  }
  if (route.path === "/vehiculos-activos") {
    return {
      activeVehicles: activeVehicles.value,
      settings: settings.value,
    };
  }
  if (route.path === "/reportes") {
    return {
      completedTransactions: completedTransactions.value,
    };
  }
  return {};
}

const loadSettings = () => {
  const saved = localStorage.getItem("parkingSettings");
  if (saved) {
    settings.value = { ...settings.value, ...JSON.parse(saved) };
  }
};

// Inicialización
onMounted(async () => {
  loadSettings();
  await parking.initializeSpaces();
});
</script>
