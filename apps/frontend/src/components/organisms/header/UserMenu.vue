<template>
  <div class="layout-user-menu" ref="dropdownRef">
    <button type="button" class="layout-user-menu__btn" @click.prevent="toggleDropdown">
      <span class="layout-user-menu__avatar">
        <UserCircleIcon />
      </span>
      <span class="layout-user-menu__label">{{ authStore.userName || 'Usuario' }}</span>
      <ChevronDownIcon
        :class="['layout-user-menu__chevron', { 'layout-user-menu__chevron--open': dropdownOpen }]"
      />
    </button>

    <div v-if="dropdownOpen" class="layout-user-menu__dropdown">
      <router-link
        v-if="hasProfileModule"
        to="/profile"
        class="layout-user-menu__item"
        @click="closeDropdown"
      >
        <UserCircleIcon />
        Mi Perfil
      </router-link>

      <button
        type="button"
        class="layout-user-menu__item"
        @click="openAboutModal"
      >
        <span class="layout-user-menu__icon" style="font-weight: bold; font-style: normal; margin-right: 0.5rem; display: inline-flex; width: 1.25rem; justify-content: center;">ⓘ</span>
        Acerca de
      </button>

      <button
        type="button"
        class="layout-user-menu__item"
        @click="signOut"
      >
        <LogoutIcon />
        Cerrar sesión
      </button>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="aboutModalOpen" class="about-modal-overlay" @click.self="closeAboutModal">
      <div class="about-modal">
        <div class="about-modal__header">
          <h3>Acerca de (v1.15.0)</h3>
          <button class="about-modal__close-x" @click="closeAboutModal">×</button>
        </div>
        <div class="about-modal__content">
          <ul>
            <li><strong>Secure ID-Based Notification System:</strong> Standardized all notifications to use User IDs instead of names, ensuring data integrity and cross-browser security.</li>
            <li><strong>Global Mention & Tagging Engine:</strong> Implemented a robust system to tag ANY user in the system via @username.</li>
            <li><strong>Real-Time Notification Reactivity:</strong> Added 10s global polling in the NotificationStore to automatically update the bell counter and show Toasts without user interaction.</li>
          </ul>
        </div>
        <div class="about-modal__footer">
          <button class="app-button--secondary" @click="copyChangelog">Copiar</button>
          <button class="app-button--secondary" @click="closeAboutModal">Cerrar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ChevronDownIcon, LogoutIcon, UserCircleIcon } from '@/icons'
import { useAuthStore } from '@/stores/auth/index'

const authStore = useAuthStore()
const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const aboutModalOpen = ref(false)

/** Verifica dinámicamente si el módulo de perfil está activo para el usuario */
const hasProfileModule = computed(() => {
  return authStore.availableRoutes.some(r => r.path === '/profile' && r.pathActive === 1)
})

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function closeDropdown() {
  dropdownOpen.value = false
}

function signOut() {
  closeDropdown()
  authStore.logout()
}

function openAboutModal() {
  closeDropdown()
  aboutModalOpen.value = true
}

function closeAboutModal() {
  aboutModalOpen.value = false
}

async function copyChangelog() {
  const text = `Novedades:\n- Secure ID-Based Notification System\n- Global Mention & Tagging Engine\n- Real-Time Notification Reactivity`;
  try {
    await navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles');
  } catch (err) {
    console.error('Error al copiar', err);
  }
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.about-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.about-modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: sans-serif;
}

.about-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.about-modal__header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #1e293b;
}

.about-modal__close-x {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
}

.about-modal__content {
  padding: 1.5rem;
  color: #334155;
  font-size: 0.9rem;
  line-height: 1.5;
}

.about-modal__content ul {
  padding-left: 1.5rem;
  margin: 0;
}

.about-modal__content li {
  margin-bottom: 0.5rem;
}

.about-modal__footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.app-button--secondary {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--primary-color, #465FFF);
  background: white;
  color: var(--primary-color, #465FFF);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.app-button--secondary:hover {
  background: rgba(70, 95, 255, 0.05);
  color: var(--primary-color, #465FFF);
}
</style>
