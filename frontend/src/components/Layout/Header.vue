  <template>
    <header class="w-full bg-gray-800 text-white h-13 flex items-center justify-between px-8 shadow-lg">
      <div class="flex items-center gap-8">

      <div class="font-bold text-xl logo text-white">SmartPark</div>
      <nav class="flex gap-6">
        <RouterLink
          v-for="tab in visibleTabs"
          :key="tab.id"
          :to="tab.path"
          class="py-4 px-2 border-b-2 font-medium text-sm transition-colors text-white hover:text-white"
          :class="$route.path === tab.path ? 'border-white' : 'border-transparent hover:border-white'"
        >
          {{ tab.name }}
        </RouterLink>
      </nav>
      </div>
      <div class="flex gap-4 items-center text-white">
        <template v-if="authStore.isAuthenticated">
          <span class="text-sm text-white">{{ authStore.user?.email }}</span>
          <span class="text-xs bg-gray-600 px-2 py-1 rounded text-white">{{ authStore.user?.role }}</span>
          <router-link to="/profile" class="transition-colors text-white hover:text-white">Profile</router-link>
          <button @click="handleLogout" class="text-white transition-colors hover:text-white">Logout</button>
        </template>
        <template v-else>
          <router-link to="/login" class="transition-colors text-white hover:text-white">Login</router-link>
        </template>
      </div>
    </header>
  </template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// Recibe los tabs como prop
const props = defineProps<{
  tabs: Array<{ id: string; name: string; path: string; requiredRoles?: string[] }>
}>()

// Filtrar tabs basado en el rol del usuario
const visibleTabs = computed(() => {
  if (!authStore.isAuthenticated) return []
  
  return props.tabs.filter(tab => {
    if (!tab.requiredRoles || tab.requiredRoles.length === 0) return true
    return authStore.hasAnyRole(tab.requiredRoles)
  })
})

const handleLogout = async () => {
  authStore.logout()
  await router.push('/login')
}
</script>

<style scoped>
/* Forzar que todos los links sean blancos */
header a,
header .router-link-active,
header .router-link-exact-active {
  color: white !important;
}

header a:hover {
  color: white !important;
}

header nav a {
  color: white !important;
}
</style>
