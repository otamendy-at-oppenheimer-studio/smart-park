<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h2>
      <form @submit.prevent="handleLogin">
        <!-- Email -->
        <div class="mb-4">
          <label class="block text-gray-700 font-semibold mb-2" for="email">Correo electrónico</label>
          <input
            v-model="email"
            type="email"
            id="email"
            class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            required
          />
        </div>

        <!-- Password con toggle -->
        <div class="mb-6">
          <label class="block text-gray-700 font-semibold mb-2" for="password">Contraseña</label>
          <!-- Contenedor único para input + botón, con focus-visible en todo el control -->
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              class="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
              required
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center p-0 m-0 bg-transparent border-none outline-none shadow-none focus:outline-none focus:ring-0 focus:border-none"
              style="background: transparent !important; border: none !important; box-shadow: none !important; outline: none !important;"
              aria-label="Mostrar/Ocultar contraseña"
              tabindex="0"
            >
              <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-700" />
              <EyeSlashIcon v-else class="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>

        <!-- Botón Login -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Iniciando sesión...</span>
          <span v-else>Entrar</span>
        </button>
      </form>

      <p v-if="error" class="text-red-500 text-sm mt-4 text-center">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { login } from '../api/auth'
import { useAuthStore } from '../stores/authStore'

const email = ref('')
const password = ref('')
const error = ref('')
const showPassword = ref(false)
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()

const handleLogin = async () => {
  if (loading.value) return
  
  loading.value = true
  error.value = ''

  try {
    const response = await login({
      email: email.value,
      password: password.value
    })

    // Guardar en el store de autenticación
    authStore.login(response)

    // Redirigir al dashboard
    await router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>
