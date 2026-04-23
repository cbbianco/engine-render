<template>
  <div class="not-found">
    <!-- Si no hay módulos, mostramos el diseño de Mantenimiento con Engranajes -->
    <template v-if="isNoModules">
      <EmptyModuleState />
    </template>
    
    <!-- Diseño de 404 estándar para otros casos -->
    <div v-else class="not-found__card">
      <h1 class="not-found__code">404</h1>
      <p class="not-found__message">La página que buscas no existe.</p>
      <button class="not-found__btn" @click="handleGoBack">
        Volver
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/index'
import EmptyModuleState from '@/components/atoms/special/EmptyModuleState.vue'

const router = useRouter()
const authStore = useAuthStore()

const isNoModules = computed(() => {
  return authStore.isAuthenticated && authStore.availableRoutes.length === 0
})

function handleGoBack() {
  const home = authStore.getPostLoginRedirectPath() ?? authStore.getFirstActiveRoute()
  if (home) {
    router.replace(home)
  } else {
    router.replace('/')
  }
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  width: 100%;
  background-color: transparent;
  padding: 1.5rem;
}

.not-found__card {
  background: #ffffff;
  border-radius: 1.25rem;
  padding: 3.5rem 2rem;
  width: 100%;
  max-width: 500px;
  text-align: center;
  /* Mantenemos una sombra suave para que resalte en el área blanca */
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.not-found__code {
  font-size: 6rem;
  font-weight: 800;
  color: #1c2434;
  margin: 0;
  line-height: 1;
}

.not-found__message {
  font-size: 1.25rem;
  color: #64748b;
  margin: 1.5rem 0 2.5rem 0;
  font-weight: 500;
}

.not-found__btn {
  background-color: #435cff;
  color: #ffffff;
  font-weight: 600;
  font-size: 1.125rem;
  padding: 0.75rem 2.5rem;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.not-found__btn:hover {
  background-color: #3649e0;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(67, 92, 255, 0.3);
}

.not-found__btn:active {
  transform: translateY(0);
}
</style>
