// main.ts
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// 👉 importar pinia
import { createPinia } from 'pinia'

// crear app
const app = createApp(App)

// 👉 usar pinia y router
app.use(createPinia())
app.use(router)

// montar
app.mount('#app')
