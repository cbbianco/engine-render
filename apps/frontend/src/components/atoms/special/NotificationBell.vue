<template>
  <div class="notification-bell" v-click-outside="closeDropdown">
    <button class="bell-btn" @click="toggleDropdown">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor"/>
      </svg>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </button>

    <Transition name="fade">
      <div v-if="isOpen" class="notification-dropdown">
        <div class="dropdown-header">
          <h3 class="dropdown-title">Notificaciones</h3>
          <button class="mark-all" @click="notificationStore.markAllAsRead">Marcar todas como leídas</button>
        </div>

        <div class="notification-list">
          <div v-if="notificationStore.notifications.length === 0" class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom: 0.5rem; color: #cbd5e1;">
              <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor" opacity="0.5"/>
              <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <p>No tienes notificaciones recientes</p>
          </div>
          <div 
            v-for="item in notificationStore.notifications" 
            :key="item.id" 
            :class="['notification-item', { unread: !item.read }]"
            @click="markAsRead(item.id)"
          >
            <div :class="['item-icon', item.type]">
              <svg v-if="item.type === 'success'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <svg v-else-if="item.type === 'error'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div class="item-content">
              <p class="item-text"><strong>{{ item.title }}</strong>: {{ item.message }}</p>
              <span class="item-time">{{ formatTime(item.timestamp) }}</span>
            </div>
          </div>
        </div>

        <div class="dropdown-footer">
          <button class="clear-all" @click="notificationStore.clearAll">Limpiar Historial</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notifications'

const notificationStore = useNotificationStore()

onMounted(() => {
  notificationStore.loadHistory()
})
const isOpen = ref(false)

const unreadCount = computed(() => 
  notificationStore.notifications.filter(n => !n.read).length
)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    notificationStore.loadHistory()
  }
}

const closeDropdown = () => {
  isOpen.value = false
}

const markAsRead = (id: string) => {
  notificationStore.markAsRead(id)
}

const formatTime = (date: Date) => {
  return new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(
    Math.round((date.getTime() - new Date().getTime()) / 60000), 
    'minute'
  )
}

// Directiva simple para cerrar al hacer clic fuera
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bell-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 10px;
  border: 2px solid white;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.75rem;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  z-index: 1000;
  overflow: hidden;
}

.dropdown-header {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.mark-all {
  font-size: 0.75rem;
  color: #3b82f6;
  background: none;
  border: none;
  cursor: pointer;
}

.notification-list {
  max-height: 350px;
  overflow-y: auto;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #94a3b8;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.notification-item {
  padding: 0.75rem 1rem;
  display: flex;
  gap: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f8fafc;
}

.notification-item:hover {
  background: #f8fafc;
}

.notification-item.unread {
  background: #eff6ff;
}

.item-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.item-icon.success { background: #dcfce7; color: #166534; }
.item-icon.error { background: #fee2e2; color: #991b1b; }
.item-icon.info { background: #e0f2fe; color: #075985; }

.item-content {
  flex: 1;
}

.item-text {
  font-size: 0.8125rem;
  color: #334155;
  margin: 0 0 0.25rem 0;
  line-height: 1.4;
}

.item-time {
  font-size: 0.7rem;
  color: #94a3b8;
}

.dropdown-footer {
  padding: 0.75rem;
  border-top: 1px solid #f1f5f9;
  text-align: center;
}

.clear-all {
  font-size: 0.75rem;
  color: #64748b;
  background: none;
  border: none;
  cursor: pointer;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
