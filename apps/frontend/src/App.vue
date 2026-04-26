<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { LoginHoja, UnauthorizedHoja, ReauthModalHoja } from './components/pages'
import SidebarProvider from './components/organisms/SidebarProvider.vue'
import AdminLayout from './components/organisms/AdminLayout.vue'
import { useAuthStore } from './stores/auth/index'
import { RouterView } from 'vue-router'
import { domainManager } from '@/utils/customer/domain'
import { CustomerService } from '@/services/customer'
import { getThemeCssVars } from '@/model/auth/css/auth.css.dto'
import { sessionRegistry } from '@/services/session/SessionRegistryService'

import { useRouter } from 'vue-router'
import { bootstrapAuth } from '@/config/auth/bootstrap'
import ToastNotification from '@/components/atoms/special/ToastNotification.vue'

const authStore = useAuthStore()
const router = useRouter()
const isValidating = ref(true)
const isInitialTokenValid = ref(false)
const isSessionBlocked = ref(false)
const sessionBlockReason = ref({ title: '', message: '' })

/** Colores del cliente (primary, secondary, errorColor) aplicados en toda el área autenticada. */
const themeCssVars = computed(() => getThemeCssVars(authStore.themeCss))

onMounted(async () => {
  const domain = domainManager.domain

  // REGRA DE NEGOCIO: Límite de sesiones (Patrón de Registro)
  const registration = sessionRegistry.register(domain)
  if (!registration.allowed) {
    isSessionBlocked.value = true
    sessionBlockReason.value = {
      title: 'Sesión Limitada',
      message: registration.message || 'No se pudo autorizar la sesión.'
    }
    isValidating.value = false
    return
  }

  // Listener para liberar la sesión al cerrar la pestaña
  window.addEventListener('beforeunload', () => sessionRegistry.unregister())

  // 1. Inicialización de sesión y temas desde el config layer
  await bootstrapAuth(authStore, router)

  const customerService = new CustomerService()

  try {
    const { ok, data } = await customerService.getByDomain(domain)
    if (ok && data?.access_token) {
      // 2. Configuración de branding y datos del cliente (ahora centralizada en el servicio)
      customerService.setupCustomerConfig(authStore, data)
      isInitialTokenValid.value = true
    } else {
      isInitialTokenValid.value = false
    }
  } catch (error) {
    console.error('[App] Validation error (customer by domain):', error)
    isInitialTokenValid.value = false
  } finally {
    isValidating.value = false
  }

  // --- Soporte de Inactividad ---
  const inactivityMinutes = Number(import.meta.env.VITE_INACTIVE_MINUTES || 15)
  let inactivityTimer: any = null

  function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    if (!authStore.isAuthenticated || authStore.isReauthenticating) return
    
    inactivityTimer = setTimeout(() => {
      console.log('[App] Inactividad detectada. Solicitando re-autenticación.');
      authStore.isReauthenticating = true
    }, inactivityMinutes * 60 * 1000)
  }

  window.addEventListener('mousemove', resetInactivityTimer)
  window.addEventListener('keydown', resetInactivityTimer)
  window.addEventListener('click', resetInactivityTimer)
  window.addEventListener('scroll', resetInactivityTimer)
  
  resetInactivityTimer()
})

onUnmounted(() => {
  sessionRegistry.unregister()
})
</script>

<template>
  <ToastNotification />
  <!-- 1) Estado de Carga -->
  <div v-if="isValidating" class="loading">
    Loading...
  </div>

  <!-- 2) Bloqueo por Límite de Sesiones (Regla de Negocio) -->
  <UnauthorizedHoja 
    v-else-if="isSessionBlocked" 
    :title="sessionBlockReason.title"
    :message="sessionBlockReason.message"
  />

  <!-- 3) No autorizado si dominio inválido -->
  <UnauthorizedHoja v-else-if="!isInitialTokenValid" />

  <!-- 4) Pantalla de Login -->
  <LoginHoja v-else-if="!authStore.isAuthenticated" />

  <!-- 5) Aplicación tras autenticación -->
  <div v-else class="app-theme" :style="themeCssVars">
    <SidebarProvider>
      <AdminLayout>
        <RouterView />
      </AdminLayout>
    </SidebarProvider>

    <!-- Global Re-authentication Modal (Premium Post-Update Flow) -->
    <ReauthModalHoja v-if="authStore.isReauthenticating" />
  </div>
</template>

<style scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
  color: #666;
}
.app-theme {
  min-height: 100vh;
  width: 100%;
}
</style>
