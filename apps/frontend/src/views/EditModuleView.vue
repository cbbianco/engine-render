<template>
  <div class="edit-module-view">
    <div class="edit-module-view__container">
      <!-- Loading state -->
      <div v-if="loading" class="edit-module-view__state-card">
        <div class="loader"></div>
        <p class="state-text">Preparando edición inteligente...</p>
      </div>

      <!-- Main Content -->
      <template v-else-if="moduleConfig">
        <DynamicRenderer 
          :config="moduleConfig" 
          :orchestration-details="orchestrationDetails"
          :hide-footer-actions="false"
        />
      </template>

      <!-- Error state -->
      <div v-else-if="error" class="edit-module-view__state-card error">
        <div class="error-content">
          <div class="error-icon-bg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D92D20" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h3 class="error-title">Error de Configuración</h3>
          <p class="error-message">{{ error }}</p>
          <button class="btn btn--primary mt-6" @click="goBack">
            Volver
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/index'
import DynamicRenderer from '@/lib/components/DynamicRenderer.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')
const moduleConfig = ref<any>(null)
const orchestrationDetails = ref<any>(null)
const moduleTitle = ref('')
const isDynamic = ref(false)

function generateIntelligentSchema(record: any, moduleId: string): any {
  const schema: any[] = []
  const model: Record<string, any> = {}
  
  // Lista de campos técnicos o sensibles a excluir del formulario
  const blackList = ['_v', '__v', 'password', 'clave', 'salt', 'token', 'action', 'actions']
  
  Object.keys(record).forEach(key => {
    const value = record[key]
    const lowKey = key.toLowerCase()

    if (blackList.some(b => lowKey.includes(b))) return
    if (lowKey === 'id' || lowKey === '_id' || lowKey.endsWith('id')) return
    if (value && typeof value === 'object' && !Array.isArray(value)) return

    let type = 'input-text'
    let readonly = false
    
    const lowKeyInferred = key.toLowerCase()
    if (lowKeyInferred.includes('email') || lowKeyInferred.includes('correo')) {
      type = 'email'
    } 
    else if (typeof value === 'boolean' || lowKeyInferred.includes('isactive') || (lowKeyInferred.includes('active') && (value === 0 || value === 1))) {
      type = 'switch'
    } 
    else if (lowKeyInferred.includes('date') || lowKeyInferred.includes('fecha') || lowKeyInferred.includes('createdat') || lowKeyInferred.includes('updatedat')) {
      type = 'datepicker'
      readonly = lowKeyInferred.includes('at')
    } else if (lowKeyInferred.includes('phone') || lowKeyInferred.includes('tel')) {
      type = 'phone'
    } else if (lowKeyInferred.includes('url') || lowKeyInferred.includes('link')) {
      type = 'url'
    }

    const label = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim()

    schema.push({
      label,
      property: key,
      type,
      column: 'col-6',
      readonly,
      value: value
    })
    model[key] = value
  })

  schema.push({
    property: 'sep',
    type: 'hr',
    column: 'col-12'
  })

  schema.push({
    label: 'Regresar',
    property: 'btnBack',
    type: 'button',
    column: 'col-6',
    align: 'stretch',
    variant: 'secondary',
    action: 'back'
  })

  schema.push({
    label: 'Guardar Cambios',
    property: 'btnSave',
    type: 'button',
    column: 'col-6',
    align: 'stretch',
    action: 'save'
  })

  const title = record.userName || record.name || record.id || moduleId

  return {
    config: {
      metadata: { 
        title: `Edición de Registro: ${title}`,
        orchestrationType: 'EDIT'
      },
      breadcrumb: [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Listado', path: route.query.fromPath || '/dashboard' },
        { label: 'Edición', path: route.path }
      ],
      module: 'dynamic-intelligent-edit',
      dataSource: 'local'
    },
    schema,
    model,
    bodyModel: model
  }
}

async function loadEditModule() {
  const moduleId = route.params.moduleId as string
  const recordDataBase64 = route.query._rd as string

  loading.value = true
  error.value = ''
  isDynamic.value = false

  try {
    if (recordDataBase64) {
      try {
        const decodedJson = decodeURIComponent(atob(recordDataBase64))
        const record = JSON.parse(decodedJson)
        
        moduleConfig.value = generateIntelligentSchema(record, moduleId)
        moduleTitle.value = record.userName || record.name || record.id || moduleId
        isDynamic.value = true
        loading.value = false
        return
      } catch (e) {
        console.warn('[EditModuleView] Error decodificando recordData, intentando fallback...', e)
      }
    }

    const mod = authStore.modulesConfig.find((m: any) => {
      const cfg = m.configurationUi?.config || m.configuration_ui?.config
      return (
        m._id === moduleId ||
        m.modulo === moduleId ||
        cfg?.moduleId === moduleId ||
        cfg?.module === moduleId ||
        cfg?.metadata?.module === moduleId ||
        cfg?.path?.toLowerCase().includes(moduleId.toLowerCase())
      )
    })

    if (mod) {
      const cfg = mod.configurationUi ?? (mod as any).configuration_ui
      moduleConfig.value = JSON.parse(JSON.stringify(cfg))
      orchestrationDetails.value = mod.orchestrationDetails
      moduleTitle.value = mod.modulo || moduleId
      
      if (route.query.id && moduleConfig.value) {
        if (!moduleConfig.value.bodyModel) moduleConfig.value.bodyModel = {}
        moduleConfig.value.bodyModel.id = route.query.id
      }
    } else {
      error.value = `No se logró localizar una configuración para "${moduleId}" ni datos del registro para generación dinámica.`
    }

  } catch (e) {
    console.error('[EditModuleView] Init error:', e)
    error.value = 'Se produjo un fallo inesperado al inicializar la vista de edición.'
  } finally {
    setTimeout(() => { loading.value = false }, 400)
  }
}

function goBack() {
  const fromPath = route.query.fromPath as string
  if (fromPath) {
    router.push(fromPath)
  } else {
    router.push('/dashboard')
  }
}

onMounted(loadEditModule)
watch(() => route.params.moduleId, loadEditModule)
</script>

<style scoped>
.edit-module-view {
  min-height: 100vh;
  background-color: #fcfcfd;
  padding: 2.5rem 1.5rem;
  font-family: 'Inter', sans-serif;
}

.edit-module-view__container {
  max-width: 1200px;
  margin: 0 auto;
}

.edit-module-view__header {
  margin-bottom: 2rem;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: none;
  border: none;
  color: #475467;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;
}

.back-link:hover {
  color: #101828;
}

/* Card Styling */
.edit-module-view__card {
  background: #ffffff;
  border: 1px solid #eaecf0;
  border-radius: 12px;
  box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #eaecf0;
  background: #fff;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #101828;
  margin: 0;
}

.card-subtitle {
  font-size: 0.875rem;
  color: #475467;
  margin-top: 0.25rem;
}

.card-body {
  padding: 1.5rem 2rem;
}

.card-footer {
  padding: 1.25rem 2rem;
  background: #f9fafb;
  border-top: 1px solid #eaecf0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* State Cards (Loading/Error) */
.edit-module-view__state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 450px;
  background: white;
  border-radius: 12px;
  border: 1px solid #eaecf0;
  box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05);
  padding: 2rem;
}

.state-text {
  color: #344054;
  font-weight: 500;
  margin-top: 1rem;
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-icon-bg {
  width: 64px;
  height: 64px;
  background: #FEF3F2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.error-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #101828;
  margin-bottom: 0.5rem;
}

.error-message {
  font-size: 0.9375rem;
  color: #475467;
  line-height: 1.5;
}

/* Buttons */
.btn {
  padding: 0.625rem 1.125rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn--primary {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05);
}

.btn--primary:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.btn--secondary {
  background-color: white;
  border-color: #d0d5dd;
  color: #344054;
}

.btn--secondary:hover {
  background-color: #f9fafb;
}

.btn--disabled {
  background-color: #eaecf0;
  color: #98a2b3;
  border-color: #eaecf0;
  cursor: not-allowed;
}

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid #f2f4f7;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.mt-6 { margin-top: 1.5rem; }
</style>
