<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in notificationStore.activeToasts" 
        :key="toast.id"
        :class="['toast-card', toast.type]"
      >
        <div class="toast-icon">
          <svg v-if="toast.type === 'success' || toast.type === 'tagueo'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <svg v-else-if="toast.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div class="toast-content">
          <h4 class="toast-title">{{ toast.title }}</h4>
          <p class="toast-message">{{ toast.message }}</p>
        </div>
        <button class="toast-close" @click="notificationStore.removeToast(toast.id)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notifications'

const notificationStore = useNotificationStore()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 5.1rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
}

.toast-card {
  pointer-events: auto;
  min-width: 300px;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  padding: 1rem;
  align-items: flex-start;
  gap: 1rem;
  border-left: 4px solid #D1D5DB;
  overflow: hidden;
}

.toast-card.success, .toast-card.tagueo { border-left-color: #10B981; }
.toast-card.error { border-left-color: #EF4444; }
.toast-card.warning { border-left-color: #F59E0B; }
.toast-card.info { border-left-color: #3B82F6; }

.toast-icon {
  font-size: 1.25rem;
  margin-top: 0.125rem;
}
.success .toast-icon, .tagueo .toast-icon { color: #10B981; }
.error .toast-icon { color: #EF4444; }
.warning .toast-icon { color: #F59E0B; }
.info .toast-icon { color: #3B82F6; }

.toast-content { flex: 1; }
.toast-title {
  font-weight: 700;
  font-size: 0.875rem;
  color: #111827;
  margin: 0 0 0.25rem 0;
}
.toast-message {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
  line-height: 1.25;
}

.toast-close {
  background: transparent;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 0.875rem;
  transition: color 0.2s;
}
.toast-close:hover { color: #374151; }

/* Animations */
.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
