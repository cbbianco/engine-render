import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const activeToasts = ref<Notification[]>([])
  
  // Tiempo de vida configurable (default 5 minutos)
  const ttlMinutes = parseInt(import.meta.env.VITE_NOTIFICATION_TTL_MINUTES || '5', 10)
  const ttlMs = ttlMinutes * 60 * 1000

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

    // Auto-eliminar de Toasts tras 5 segundos
    setTimeout(() => {
      removeToast(id)
    }, 5000)

    // Auto-eliminar del historial tras el TTL configurado (5 min por defecto)
    setTimeout(() => {
      removeNotification(id)
    }, ttlMs)
  }

  function removeNotification(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  function removeToast(id: string) {
    activeToasts.value = activeToasts.value.filter(n => n.id !== id)
  }

  function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) notification.read = true
  }

  function markAllAsRead() {
    notifications.value.forEach(n => n.read = true)
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
    clearAll
  }
})
