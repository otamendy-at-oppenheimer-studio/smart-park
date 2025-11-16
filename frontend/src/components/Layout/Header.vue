  <template>
    <header class="w-full bg-[#18345d] text-white h-20 flex items-center justify-between px-8 shadow-md">
      <div class="font-bold text-xl logo">SmartPark</div>
      <nav class="flex gap-6">
        <RouterLink
          v-for="tab in visibleTabs"
          :key="tab.id"
          :to="tab.path"
          class="py-4 px-2 border-b-2 font-medium text-sm transition-colors"
          :class="$route.path === tab.path
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          {{ tab.name }}
        </RouterLink>
      </nav>
      <div class="flex gap-4 items-center">
        <template v-if="authStore.isAuthenticated">
          <span class="text-sm text-gray-300">{{ authStore.user?.email }}</span>
          <span class="text-xs bg-blue-600 px-2 py-1 rounded">{{ authStore.user?.role }}</span>
          <router-link to="/profile" class="hover:text-blue-300 transition-colors">Profile</router-link>
          <button @click="handleLogout" class="hover:text-red-300 transition-colors">Logout</button>
        </template>
        <template v-else>
          <router-link to="/login" class="hover:text-blue-300 transition-colors">Login</router-link>
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
