import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import Login from './components/Login.vue'
import Dashboard from './components/Dashboard.vue'
import Registro from './components/Registro.vue'
import VehiculosActivos from './components/VehiculosActivos.vue'
import Reportes from './components/Reportes.vue'
import Configuracion from './components/Configuracion.vue'
import Profile from './components/Profile.vue'

const routes = [
  { 
    path: '/', 
    redirect: '/dashboard' 
  },
  { 
    path: '/login', 
    name: 'Login',
    component: Login,
    meta: { 
      requiresAuth: false,
      redirectIfAuthenticated: true
    }
  },
  { 
    path: '/dashboard', 
    name: 'Dashboard',
    component: Dashboard,
    meta: { 
      requiresAuth: true,
      roles: ['admin', 'user']
    }
  },
  { 
    path: '/registro', 
    name: 'Registro',
    component: Registro,
    meta: { 
      requiresAuth: true,
      roles: ['admin']
    }
  },
  { 
    path: '/vehiculos-activos', 
    name: 'VehiculosActivos',
    component: VehiculosActivos,
    meta: { 
      requiresAuth: true,
      roles: ['admin', 'user']
    }
  },
  { 
    path: '/reportes', 
    name: 'Reportes',
    component: Reportes,
    meta: { 
      requiresAuth: true,
      roles: ['admin']
    }
  },
  { 
    path: '/settings', 
    name: 'Settings',
    component: Configuracion,
    meta: { 
      requiresAuth: true,
      roles: ['admin', 'user']
    }
  },
  { 
    path: '/profile', 
    name: 'Profile',
    component: Profile,
    meta: { 
      requiresAuth: true,
      roles: ['admin', 'user']
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guards de autenticación
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  // Inicializar la autenticación desde localStorage
  authStore.initializeAuth()
  
  const isAuthenticated = authStore.isAuthenticated
  const requiresAuth = to.meta.requiresAuth !== false
  const redirectIfAuthenticated = to.meta.redirectIfAuthenticated === true
  const requiredRoles = to.meta.roles as string[] | undefined

  // Si el usuario está autenticado y trata de ir al login, redirigir al dashboard
  if (isAuthenticated && redirectIfAuthenticated) {
    next('/dashboard')
    return
  }

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // Verificar si el token es válido
  if (isAuthenticated && !authStore.isTokenValid()) {
    authStore.logout()
    next('/login')
    return
  }

  // Verificar permisos de roles
  if (isAuthenticated && requiredRoles && requiredRoles.length > 0) {
    if (!authStore.hasAnyRole(requiredRoles)) {
      // Redirigir a una página de acceso denegado o dashboard
      next('/dashboard')
      return
    }
  }

  next()
})

export default router
