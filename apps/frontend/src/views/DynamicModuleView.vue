<template>
  <div class="dynamic-module-page">
    <div class="dynamic-module-page__container">
      <h2 v-if="moduleName" class="dynamic-module-page__title">{{ title }}</h2>
      
      <!-- Loading state -->
      <div v-if="loading" class="dynamic-module-page__loading">
        <p class="text-theme-sm text-gray-500">Cargando...</p>
      </div>

      <!-- Module iteration -->
      <template v-else-if="modules.length > 0">
        <div
          v-if="modules[0]"
          class="dynamic-module-page__module"
        >
          <DynamicRenderer 
            :config="{ ...(modules[0].configurationUi ?? modules[0].configuration_ui), bodyModel: modules[0].bodyModel }" 
            :orchestration-details="modules[0].orchestrationDetails"
          />
        </div>
      </template>

      <!-- Error state -->
      <div v-else-if="error" class="dynamic-module-page__error">
        <p class="text-theme-sm text-red-500">{{ error }}</p>
      </div>

      <EmptyModuleState v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth/index'
import DynamicRenderer from '@/lib/components/DynamicRenderer.vue'
import EmptyModuleState from '@/components/atoms/special/EmptyModuleState.vue'
import type { ModuleConfigResponse } from '@/lib/types/module'

// Nuevas utilidades organizadas por dominio
import { findModuleByPath } from '@/utils/dynamic-module/config'
import { extractModuleNameFromPath } from '@/utils/dynamic-module/path'
import { applyDataSourceToken } from '@/utils/dynamic-module/hydration'

const route = useRoute()
const authStore = useAuthStore()

const moduleName = ref('')
const modules = ref<ModuleConfigResponse[]>([])
const loading = ref(true)
const error = ref('')

/** Título formateado basado en el nombre del módulo extraído del path. */
const title = computed(() => {
  if (!moduleName.value) return ''
  return moduleName.value
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
})

/** Obtención de configuración asociada al path actual. */
async function fetchConfig(): Promise<void> {
  const name = extractModuleNameFromPath(route.path)
  moduleName.value = name
  
  if (!authStore.isAuthenticated || !name) {
    modules.value = []
    loading.value = false
    return
  }
  
  loading.value = true
  error.value = ''
  
  const token = authStore.sessionToken
  
  try {
    // Busca en el catálogo de módulos configurados (Backend Driven)
    const moduleFromStore = findModuleByPath(authStore.modulesConfig, route.path)
    
    if (moduleFromStore) {
      // Hidratación reactiva con datos del token si aplica (dataSource: 'token')
      const decorated = applyDataSourceToken(moduleFromStore as any, token)
      
      // SOPORTE EDICIÓN: Si viene recordData (_rd), lo inyectamos en el bodyModel
      const rd = route.query._rd as string
      if (rd) {
        try {
          const decoded = JSON.parse(decodeURIComponent(atob(rd)))
          decorated.bodyModel = { ...(decorated.bodyModel || {}), ...decoded }
          console.log('[DynamicModuleView] Record data injected into module configuration')
        } catch (e) {
          console.warn('[DynamicModuleView] Error decoding _rd parameter', e)
        }
      }

      modules.value = [decorated]
    } else {
      // Si no existe configuración en el store, limpiamos rutas para forzar re-sincronización
      console.warn('[DynamicModuleView] Módulo no encontrado en catálogo (404 Local). Limpiando estado...');
      modules.value = []
      localStorage.removeItem('auth_routes')
      authStore.clearState()
    }
  } catch (e) {
    console.error('[DynamicModuleView] Error fetching module config:', e)
    error.value = 'Error al cargar el módulo'
    modules.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchConfig)
watch(() => route.path, fetchConfig)
</script>

<style scoped>
.dynamic-module-page {
  width: 100%;
  min-height: 100%;
}
.dynamic-module-page__container {
  width: 100%;
  max-width: 1536px;
  margin: 0 auto;
}
.dynamic-module-page__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900, #111827);
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gray-200, #e5e7eb);
  display: none; /* Oculto ya que el DynamicModuleForm trae su propio título */
}
.dynamic-module-page__module {
  margin-bottom: 2rem;
}
.dynamic-module-page__loading,
.dynamic-module-page__empty,
.dynamic-module-page__error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
</style>
