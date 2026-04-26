import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { NotificationPersistenceService } from './services/notifications/NotificationPersistenceService'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Inicializar servicios EDP
NotificationPersistenceService.init()

app.mount('#app')
