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
        @click="signOut"
      >
        <LogoutIcon />
        Cerrar sesión
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ChevronDownIcon, LogoutIcon, UserCircleIcon } from '@/icons'
import { useAuthStore } from '@/stores/auth/index'

const authStore = useAuthStore()
const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

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
