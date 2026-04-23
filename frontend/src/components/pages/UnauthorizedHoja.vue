<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth/index'
import { DEFAULT_THEME_CSS, getErrorColor } from '@/model/auth/css/auth.css.dto'
import { 
  AppTitle, 
  AppText, 
  IconLogoFallback 
} from '@/components/atoms'

interface Props {
  title?: string
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Not Authorized',
  message: 'You are not authorized to access this application.'
})

const authStore = useAuthStore()
const { themeCss: storeThemeCss } = storeToRefs(authStore)

const dynamicStyles = computed(() => {
  const t = storeThemeCss.value
  return {
    '--primary-color': t.primary ?? DEFAULT_THEME_CSS.primary ?? 'var(--primary-color)',
    '--secondary-color': t.secondary ?? DEFAULT_THEME_CSS.secondary ?? '#667085',
    '--error-color': getErrorColor(storeThemeCss.value),
    '--bg-page': t.background ?? '#fff',
  }
})
</script>

<template>
  <div class="unauth-container" :style="dynamicStyles">
    <div class="card">
      <div class="icon-wrap">
        <IconLogoFallback class="icon-blocked" />
      </div>
      <AppTitle class="unauth-title">{{ props.title }}</AppTitle>
      <AppText variant="secondary" class="unauth-message">
        {{ props.message }}
      </AppText>
    </div>
  </div>
</template>

<style scoped>
.unauth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-page);
  font-family: 'Inter', sans-serif;
}

.card {
  background: white;
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  text-align: center;
  max-width: 450px;
  width: 90%;
}

.unauth-title {
  font-weight: 800 !important;
  font-size: 2.25rem !important;
  color: var(--primary-color) !important;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.unauth-message {
  font-size: 1.15rem;
  color: #000000; /* Negro sólido solicitado */
  line-height: 1.6;
  font-weight: 500;
}

.icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.icon-blocked {
  transform: scale(1.5);
}
</style>
