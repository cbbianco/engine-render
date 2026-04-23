<template>
  <router-link :to="dashboardPath" class="layout-header-logo">
    <img
      v-if="customerLogo"
      :src="customerLogo"
      alt="Logo"
    />
    <span v-else>CRM</span>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth/index'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { customerLogo } = storeToRefs(authStore)

const dashboardPath = computed(() => {
  const hasDashboard = authStore.availableRoutes.some(
    (r) => r.path === '/dashboard' && r.pathActive === 1
  )
  return hasDashboard ? '/dashboard' : authStore.getFirstActiveRoute() ?? '/'
})
</script>
