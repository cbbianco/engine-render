<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth/index'

const authStore = useAuthStore()

const activeRoutes = computed(() => {
  return authStore.availableRoutes.filter(route => route.pathActive === 1)
})

const getLabel = (path: string) => {
  // Simple heuristic to make path readable: /user-profile -> User Profile
  return path
    .replace(/^\//, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<template>
  <nav class="nav-menu">
    <ul class="nav-list">
      <li v-for="route in activeRoutes" :key="route.path">
        <RouterLink :to="route.path">{{ getLabel(route.path) }}</RouterLink>
      </li>
      <li class="logout-item">
        <a href="#" @click.prevent="authStore.logout()">Logout</a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.nav-menu {
  background-color: #333;
  padding: 1rem;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 1rem;
  align-items: center;
}

a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}

a.router-link-active {
  text-decoration: underline;
  color: #42b883;
}

a:hover {
  color: #ddd;
}

.logout-item {
    margin-left: auto;
}

.logout-item a {
    color: #ff6b6b;
}

.logout-item a:hover {
    color: #ff9999;
}
</style>
