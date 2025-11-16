export const ROUTE_PERMISSIONS = {
  '/dashboard': ['admin', 'user'],
  '/registro': ['admin'],
  '/vehiculos-activos': ['admin', 'user'],
  '/reportes': ['admin'],
  '/settings': ['admin', 'user'],
  '/profile': ['admin', 'user']
}

export const PUBLIC_ROUTES = ['/login']

export const NAVIGATION_TABS = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    requiredRoles: ['admin', 'user']
  },
  // {
  //   id: 'registro',
  //   name: 'Registro',
  //   path: '/registro',
  //   requiredRoles: ['admin']
  // },
  // {
  //   id: 'vehiculos-activos',
  //   name: 'Vehículos Activos',
  //   path: '/vehiculos-activos',
  //   requiredRoles: ['admin', 'user']
  // },
  // {
  //   id: 'reportes',
  //   name: 'Reportes',
  //   path: '/reportes',
  //   requiredRoles: ['admin']
  // },
  {
    id: 'settings',
    name: 'Configuración',
    path: '/settings',
    requiredRoles: ['admin', 'user']
  }
]