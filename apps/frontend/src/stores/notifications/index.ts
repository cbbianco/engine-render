import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { eventBus } from '@/utils/events/EventBus'
import { useAuthStore } from '@/stores/auth'
import { NotificationPersistenceService } from '@/services/notifications/NotificationPersistenceService'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning' | 'tagueo'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export const useNotificationStore = defineStore('notifications', () => {
  const authStore = useAuthStore()
  const notifications = ref<Notification[]>([])
  const activeToasts = ref<Notification[]>([])
  
  // Tiempo de vida configurable (default 5 minutos)
  const ttlMinutes = parseInt(import.meta.env.VITE_NOTIFICATION_TTL_MINUTES || '5', 10)
  const ttlMs = ttlMinutes * 60 * 1000
  
  // Contador reactivo de no leídas
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  /**
   * Carga el historial persistido desde el microservicio
   */
  async function loadHistory() {
    const history = await NotificationPersistenceService.init().getHistory()
    if (history && Array.isArray(history)) {
      const historyMapped = history.map((n: any) => ({
        id: n._id || n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        timestamp: new Date(n.createdAt),
        read: n.read || false
      }))

      // 1. Mapear contenido actual para evitar duplicados en Toasts
      const currentContent = new Set(notifications.value.map(n => `${n.title}|${n.message}`))
      const historyIds = new Set(historyMapped.map(n => n.id))
      const historyContent = new Set(historyMapped.map(n => `${n.title}|${n.message}`))

      // 2. Identificar las REALMENTE nuevas (que no tenemos ni por ID ni por contenido)
      const newItems = historyMapped.filter(n => {
        const isById = notifications.value.some(local => local.id === n.id)
        const isByContent = currentContent.has(`${n.title}|${n.message}`)
        return !isById && !isByContent
      })

      // 3. Mostrar Toasts solo si hay novedades reales y no es la carga inicial
      if (notifications.value.length > 0 && newItems.length > 0) {
        newItems.forEach(n => {
          if (!n.read) {
            activeToasts.value.push(n)
            setTimeout(() => {
              activeToasts.value = activeToasts.value.filter(t => t.id !== n.id)
            }, 5000)
          }
        })
      }

      // 4. Fusionar manteniendo lo local que no esté en el historial (por ID o Contenido)
      const localOnly = notifications.value.filter(n => {
        const isById = historyIds.has(n.id)
        const isByContent = historyContent.has(`${n.title}|${n.message}`)
        return !isById && !isByContent
      })
      
      // Actualización directa para garantizar reactividad
      notifications.value = [...localOnly, ...historyMapped].sort((a, b) => 
        b.timestamp.getTime() - a.timestamp.getTime()
      )
    }
  }

  /**
   * Añade una notificación al historial y la muestra como Toast
   * Incluye deduplicación para evitar duplicados por refresco (ej. Sesión Iniciada)
   */
  function addNotification(type: Notification['type'], title: string, message: string) {
    // REGLA DE ORO: Evitar duplicados idénticos en los últimos 30 segundos
    const isDuplicate = notifications.value.some(n => 
      n.title === title && 
      n.message === message && 
      (new Date().getTime() - n.timestamp.getTime()) < 30000
    )
    if (isDuplicate) return

    const id = Math.random().toString(36).substring(2, 9)
    const newNotification: Notification = {
      id,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false
    }

    // Añadir al historial (campana)
    notifications.value.unshift(newNotification)
    
    // Añadir a los toasts activos (emergentes)
    activeToasts.value.push(newNotification)

    // REGLA: Emitir evento EDP para persistencia si es éxito o error
    if (type === 'success' || type === 'error') {
      eventBus.emit('notification.persist', {
        type,
        title,
        message,
        author: authStore.userName || 'system',
        metadata: { source: 'frontend_orchestrator' }
      })
    }

    // Auto-eliminar de Toasts tras 5 segundos
    setTimeout(() => {
      removeToast(id)
    }, 5000)

    // REGLA: Si la notificación NO es persistida (info/warning/error de validación), se auto-elimina tras el TTL
    if (type === 'warning' || (type === 'error' && message.includes('validación'))) {
      setTimeout(() => {
        removeNotification(id)
      }, ttlMs)
    }
  }

  function removeNotification(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  function removeToast(id: string) {
    activeToasts.value = activeToasts.value.filter(n => n.id !== id)
  }

  function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
      // EDP: Emitir evento para persistencia (Zero Latency)
      eventBus.emit('notification.markRead', { id })
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => n.read = true)
    // EDP: Emitir evento para persistencia
    eventBus.emit('notification.markAllRead', {})
  }

  function clearAll() {
    notifications.value = []
    activeToasts.value = []
  }

  let pollingInterval: any = null

  function startPolling() {
    if (pollingInterval) return
    loadHistory() // Carga inicial
    pollingInterval = setInterval(() => {
      loadHistory()
    }, 10000) // Cada 10 segundos para máxima reactividad
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  return {
    notifications,
    activeToasts,
    addNotification,
    removeNotification,
    removeToast,
    markAsRead,
    markAllAsRead,
    clearAll,
    loadHistory,
    unreadCount,
    startPolling,
    stopPolling
  }
})
