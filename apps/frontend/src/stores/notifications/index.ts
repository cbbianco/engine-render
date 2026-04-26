import { defineStore } from 'pinia'
import { ref } from 'vue'
import { eventBus } from '@/utils/events/EventBus'
import { useAuthStore } from '@/stores/auth'
import { NotificationPersistenceService } from '@/services/notifications/NotificationPersistenceService'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
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

  /**
   * Carga el historial persistido desde el microservicio
   */
  async function loadHistory() {
    if (!authStore.userName) return
    const history = await NotificationPersistenceService.init().getHistory(authStore.userName)
    if (history && Array.isArray(history)) {
      notifications.value = history.map((n: any) => ({
        id: n._id || n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        timestamp: new Date(n.createdAt),
        read: n.read || false
      }))
    }
  }

  /**
   * Añade una notificación al historial y la muestra como Toast
   */
  function addNotification(type: Notification['type'], title: string, message: string) {
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
    if (authStore.userName) {
      // EDP: Emitir evento para persistencia
      eventBus.emit('notification.markAllRead', { author: authStore.userName })
    }
  }

  function clearAll() {
    notifications.value = []
    activeToasts.value = []
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
    loadHistory
  }
})
