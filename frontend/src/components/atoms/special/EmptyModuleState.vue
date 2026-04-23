<template>
  <div class="empty-state">
    <div class="empty-state__container">
      <!-- High-Fidelity Maintenance Icon (TailAdmin Gears) -->
      <div class="empty-state__icon-wrapper">
        <svg 
          width="180" 
          height="180" 
          viewBox="0 0 112 112" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Gear 1 (Main) -->
          <path d="M48.8 62.5C48.8 66.8 52.3 70.3 56.6 70.3C60.9 70.3 64.4 66.8 64.4 62.5C64.4 58.2 60.9 54.7 56.6 54.7C52.3 54.7 48.8 58.2 48.8 62.5Z" fill="var(--primary-color)"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M51.8 44.8C52.5 44 53.3 43.4 54.1 42.9L52.8 38.6C52.6 37.8 53.1 37.1 53.9 36.9L59.3 35.3C60.1 35.1 60.9 35.6 61.1 36.4L62.4 40.7C63.4 41 64.5 41.6 65.4 42.2L68.7 39.5C69.3 39 70.2 39 70.8 39.5L74.8 43.5C75.4 44.1 75.4 45 74.9 45.6L72.2 48.9C72.8 49.8 73.4 50.9 73.7 51.9L78.1 50.6C78.9 50.4 79.7 50.9 79.9 51.7L81.5 57.1C81.7 57.9 81.2 58.7 80.4 58.9L76 60.2C76 61.1 75.9 61.9 75.7 62.8L80.1 64C80.8 64.2 81.3 65 81.1 65.8L79.6 71.2C79.4 72 78.6 72.5 77.8 72.3L73.4 71C73 72.1 72.3 73.1 71.6 74L74.3 77.3C74.8 77.9 74.8 78.8 74.2 79.4L70.2 83.4C69.6 84 68.7 84 68.1 83.5L64.8 80.8C63.8 81.4 62.7 81.8 61.6 82.1L62.9 86.4C63.1 87.2 62.6 87.9 61.8 88.1L56.4 89.7C55.6 89.9 54.8 89.4 54.6 88.6L53.3 84.3C52.3 84 51.2 83.5 50.3 82.9L46.9 85.5C46.3 86 45.4 86 44.8 85.5L40.8 81.5C40.2 80.9 40.2 80 40.7 79.4L43.4 76.1C42.8 75.2 42.2 74.1 41.9 73.1L37.5 74.4C36.7 74.6 35.9 74.1 35.7 73.3L34.1 67.9C33.9 67.1 34.4 66.3 35.2 66.1L39.6 64.8C39.6 63.9 39.7 63.1 39.9 62.2L35.5 61C34.8 60.8 34.3 60 34.5 59.2L36 53.8C36.2 53 37 52.5 37.8 52.7L42.2 54C42.6 52.9 43.3 51.9 44 51L41.3 47.7C40.8 47.1 40.8 46.2 41.4 45.6L45.4 41.6C46 41 46.9 41 47.5 41.5L50.8 44.2C51.1 44.4 51.5 44.6 51.8 44.8ZM56.6 77.3C64.8 77.3 71.4 70.7 71.4 62.5C71.4 54.3 64.8 47.7 56.6 47.7C48.4 47.7 41.8 54.3 41.8 62.5C41.8 70.7 48.4 77.3 56.6 77.3Z" fill="var(--primary-color)"/>
          <!-- Gear 2 (Small Top) -->
          <path d="M57.6 19.8C57.6 22.3 59.6 24.3 62.1 24.3C64.6 24.3 66.6 22.3 66.6 19.8C66.6 17.3 64.6 15.3 62.1 15.3C59.6 15.3 57.6 17.3 57.6 19.8Z" fill="var(--primary-color)"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M59 10C59.3 9.6 59.8 9.3 60.3 9.1L59.7 6.6C59.6 6.1 59.9 5.7 60.3 5.6L63.5 4.7C64 4.6 64.4 4.9 64.5 5.3L65.2 7.7C65.8 7.9 66.3 8.2 66.8 8.6L68.7 7.1C69.1 6.8 69.6 6.8 69.9 7.1L72.2 9.4C72.5 9.7 72.5 10.2 72.2 10.6L70.8 12.5C71.1 13 71.4 13.6 71.6 14.2L74.1 13.5C74.6 13.4 75 13.7 75.1 14.1L76 17.3C76.1 17.8 75.8 18.2 75.4 18.3L72.9 19C72.9 19.5 72.9 20 72.8 20.6L75.3 21.3C75.7 21.4 76 21.8 75.9 22.3L75.1 25.5C75 26 74.6 26.3 74.1 26.2L71.6 25.5C71.3 26.1 71 26.6 70.6 27.2L72.1 29.1C72.4 29.5 72.4 30 72 30.3L69.8 32.6C69.5 32.9 69 32.9 68.6 32.6L66.7 31.1C66.2 31.4 65.6 31.7 64.9 31.9L65.6 34.3C65.7 34.8 65.4 35.2 65 35.3L61.8 36.2C61.3 36.3 60.9 36 60.8 35.6L60.1 33.1C59.6 32.9 59 32.6 58.5 32.2L56.6 33.7C56.2 34 55.7 34 55.4 33.7L53.1 31.4C52.8 31.1 52.8 30.6 53.1 30.2L54.5 28.3C54.2 27.8 53.9 27.2 53.7 26.6L51.2 27.3C50.7 27.4 50.3 27.1 50.2 26.7L49.3 23.5C49.2 23 49.5 22.6 49.9 22.5L52.4 21.8C52.4 21.3 52.4 20.8 52.5 20.2L50 19.5C49.6 19.4 49.3 19 49.4 18.5L50.2 15.3C50.3 14.8 50.7 14.5 51.2 14.6L53.7 15.3C54 14.7 54.3 14.2 54.7 13.6L53.2 11.7C52.9 11.3 53 10.8 53.3 10.5L55.6 8.2C55.9 7.9 56.4 7.9 56.8 8.2L58.7 9.7C58.8 9.8 58.9 9.9 59 10ZM62.1 28.3C66.8 28.3 70.6 24.5 70.6 19.8C70.6 15.1 66.8 11.3 62.1 11.3C57.4 11.3 53.6 15.1 53.6 19.8C53.6 24.5 57.4 28.3 62.1 28.3Z" fill="var(--primary-color)"/>
          <!-- Gear 3 (Tiny Bottom-Right) -->
          <path d="M74.1 29.8C74.1 31.2 75.3 32.3 76.6 32.3C78 32.3 79.1 31.2 79.1 29.8C79.1 28.5 78 27.3 76.6 27.3C75.3 27.3 74.1 28.5 74.1 29.8Z" fill="var(--primary-color)"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M74.9 24.3C75 24.1 75.3 23.9 75.6 23.8L75.3 22.4C75.2 22.1 75.4 21.9 75.6 21.8L77.4 21.3C77.7 21.2 77.9 21.4 78 21.6L78.4 23C78.7 23.1 79 23.3 79.3 23.5L80.4 22.7C80.6 22.5 80.9 22.5 81.1 22.7L82.4 24C82.6 24.2 82.6 24.5 82.4 24.7L81.6 25.8C81.8 26.1 82 26.4 82.1 26.7L83.5 26.4C83.8 26.3 84 26.5 84.1 26.7L84.6 28.5C84.7 28.8 84.5 29 84.3 29.1L82.9 29.5C82.9 29.8 82.9 30.1 82.8 30.4L84.2 30.8C84.5 30.9 84.6 31.1 84.6 31.4L84.1 33.2C84 33.5 83.8 33.7 83.5 33.6L82.1 33.2C81.9 33.5 81.7 33.8 81.5 34.1L82.4 35.2C82.6 35.4 82.6 35.7 82.4 35.9L81.1 37.2C80.9 37.4 80.6 37.3 80.4 37.1L79.3 36.3C79 36.5 78.7 36.6 78.4 36.8L78.7 38.1C78.8 38.4 78.6 38.6 78.4 38.7L76.6 39.2C76.3 39.3 76.1 39.1 76 38.9L75.6 37.5C75.3 37.4 75 37.2 74.7 37L73.6 37.8C73.4 38 73.1 38.1 72.9 37.8L71.6 36.5C71.4 36.3 71.4 36 71.6 35.8L72.4 34.7C72.2 34.4 72.1 34.1 72 33.8L70.6 34.2C70.3 34.3 70.1 34.1 70.1 33.8L69.6 32C69.5 31.7 69.7 31.5 69.9 31.4L71.3 31.1C71.3 30.8 71.3 30.5 71.4 30.2L70 29.8C69.7 29.7 69.6 29.5 69.7 29.2L70.1 27.4C70.2 27.1 70.4 27 70.7 27.1L72.1 27.4C72.3 27.1 72.5 26.8 72.7 26.5L71.8 25.4C71.6 25.2 71.6 24.9 71.8 24.7L73.1 23.4C73.3 23.2 73.6 23.2 73.8 23.4L74.9 24.3ZM76.6 34.7C79.3 34.7 81.5 32.5 81.5 29.8C81.5 27.1 79.3 25 76.6 25C73.9 25 71.7 27.1 71.7 29.8C71.7 32.5 73.9 34.7 76.6 34.7Z" fill="var(--primary-color)"/>
        </svg>
      </div>

      <!-- Maintenance Style Content -->
      <AppTitle class="empty-state__title">{{ title }}</AppTitle>
      
      <p class="empty-state__description" v-html="description"></p>

      <!-- Action Button matching TailAdmin style -->
      <AppButton class="empty-state__btn" @click="handleAction">
        {{ buttonText }}
      </AppButton>

      <div class="empty-state__footer">
        © 2026 SolutionsN+1
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/index'
import { AppTitle, AppButton } from '@/components/atoms'

interface Props {
  redirectTo?: string
  title?: string
  description?: string
  buttonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  redirectTo: '/login',
  title: 'SIN MÓDULOS ASIGNADOS',
  description: 'No hemos encontrado configuraciones para este módulo o no tienes permisos suficientes.<br>Por favor contacta al soporte técnico o regresa al login.',
  buttonText: 'Volver al Login'
})

const router = useRouter()
const authStore = useAuthStore()

function handleAction() {
  if (props.redirectTo === '/login') {
    authStore.logout()
  } else {
    router.push(props.redirectTo)
  }
}
</script>

<style scoped>
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  width: 100%;
  background-color: transparent;
  padding: 2rem;
}

.empty-state__container {
  max-width: 800px;
  width: 100%;
  text-align: center;
}

.empty-state__icon-wrapper {
  margin-bottom: 2.5rem;
  display: flex;
  justify-content: center;
  /* Animación sutil de rotación como en un motor */
  animation: gear-spin 20s linear infinite;
}

@keyframes gear-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state__title {
  font-size: 3.5rem;
  font-weight: 800;
  color: #1c2434;
  margin-bottom: 1.5rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'Inter', sans-serif;
}

.empty-state__description {
  font-size: 1.125rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 500;
}

.empty-state__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2.5rem;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  width: auto !important; /* Evitar que ocupe todo el ancho */
}

.empty-state__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.empty-state__footer {
  margin-top: 6rem;
  font-size: 0.875rem;
  color: #94a3b8;
  font-weight: 400;
}

@media (max-width: 640px) {
  .empty-state__title {
    font-size: 2.5rem;
  }
  .empty-state__description {
    font-size: 1rem;
  }
}
</style>
