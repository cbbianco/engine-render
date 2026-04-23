<!-- 
  Architecture: Solutions Team
  Methodology: AI Driven Development (AIDD)
  Component: UI Metadata Render Engine
-->
<template>
  <div class="dynamic-renderer-container">
    <!-- Header con Titulo y Breadcrumbs estilo TailAdmin -->
    <div v-if="!isDashboardView" class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-1">
        <div v-if="activeSubmodule" class="flex items-center gap-4">
          <button class="back-btn" @click="backToMain">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.8333 10H4.16666M4.16666 10L10 15.8333M4.16666 10L10 4.16666" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Volver
          </button>
          <h1 class="dynamic-renderer-title">
            {{ activeSubmodule.config?.metadata?.title || 'Configuración' }}
          </h1>
        </div>
        <h1 v-else class="dynamic-renderer-title">
          {{ props.config?.config?.metadata?.title || props.config?.config?.module || 'Detalle' }}
        </h1>
        <BreadcrumbsNative :items="processedBreadcrumbs" />
      </div>
    </div>

    <div v-if="feedback" :class="['feedback-msg', feedback.type]" class="mb-4">
      {{ feedback.message }}
    </div>

    <!-- MODO STANDALONE: Visualización de Submódulo (Navegación Interna) -->
    <template v-if="activeSubmodule">
      <div class="dynamic-renderer-card">
        <NestedModuleNative 
          :child="activeSubmodule"
          :model="submoduleModel"
          :disabled="isSubmitting"
          :error-color="errorColor"
          :validation-errors="validationErrors"
          :backend-errors="backendErrors"
          :was-submitted="wasSubmitted"
          @update:model="({ prop, val }) => updateSubmoduleModel(prop, val)"
          @action="({ type, payload, context }) => {
            if (type === 'toolbar-click' || type === 'button-click') handleButtonClick(payload, context)
            else handleComponentAction(payload, payload.item, context)
          }"
        />
      </div>
    </template>

    <!-- MODO MASTER: Visualización principal del módulo -->
    <template v-else>
      <!-- Contenedor Card Premium (Fondo Blanco) -->
    <div class="dynamic-renderer-card">
      <form class="dynamic-renderer-grid" @submit.prevent>
        
        <!-- Main Toolbar (Top Right) -->
        <div v-if="props.config?.config?.toolbar" class="col-12 flex justify-end mb-6">
          <ToolbarNative 
            :items="props.config.config.toolbar" 
            @action="handleButtonClick" 
          />
        </div>

        <template v-for="(item, index) in schema" :key="DynamicParser.fieldKey(item, Number(index))">
          <!-- CASO 1: Separador (Sección) -->
          <div v-if="item.separator === true" class="dynamic-renderer__separator col-12">
            <h3 class="separator-title">{{ item.label }}</h3>
            <div class="separator-line"></div>
          </div>

          <!-- CASO 2: Componente normal -->
          <div
            v-else
            v-if="!(props.config?.config?.module === 'invoices' && Number(index) > 0) && !((hideFooterActions || hasChildSubmit) && DynamicParser.isButton(item))"
            class="dynamic-renderer__cell"
            :class="item.column || 'col-12'"
            :style="DynamicParser.columnStyle(item)"
            v-show="item.visible !== false"
          >
            <div :class="DynamicParser.alignClass(item)" class="dynamic-renderer__inner">
              <component
                :is="getComponentForSchema(item)"
                :ref="DynamicParser.getRefSetter(fieldRefs, item, Number(index))"
                v-bind="bindProps(item, Number(index), model)"
                :model-value="getFieldValue(item)"
                :invalid="((wasSubmitted && validationErrors[DynamicParser.getProp(item)]?.invalid) ?? false) || !!backendErrors[DynamicParser.getProp(item)]"
                :error-message="backendErrors[DynamicParser.getProp(item)] || (wasSubmitted ? validationErrors[DynamicParser.getProp(item)]?.message : undefined)"
                :disabled="isSubmitting || item.disabled"
                :readonly="item.readonly"
                :error-color="errorColor"
                @update:model-value="(val: any) => updateModel(DynamicParser.getProp(item), val)"
                @click="DynamicParser.isButton(item) ? handleButtonClick(item) : undefined"
                @action="(e: any) => handleComponentAction(e, item)"
              />
            </div>
          </div>
        </template>
      </form>
    </div>

      <!-- CASO 3: Modulos Hijos (schemaChild) - Se renderizan fuera del card principal para mayor claridad dinámica -->
      <template v-if="(props.config?.schemaChild || props.config?.configurationUi?.schemaChild) && props.config?.config?.isModuleInner !== true">
        <div v-for="(child, cIdx) in (props.config?.schemaChild || props.config?.configurationUi?.schemaChild)" :key="`child-outer-${cIdx}`" class="mt-8">
          <div class="dynamic-renderer-card">
            <NestedModuleNative 
              :child="child"
              :model="model"
              :disabled="isSubmitting"
              :error-color="errorColor"
              :validation-errors="validationErrors"
              :backend-errors="backendErrors"
              :was-submitted="wasSubmitted"
              @update:model="({ prop, val }) => updateModel(prop, val)"
              @action="({ type, payload, context }) => {
                if (type === 'toolbar-click' || type === 'button-click') handleButtonClick(payload, context)
                else handleComponentAction(payload, payload.item, context)
              }"
            />
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { resolveOrchestrationTag } from '@/utils/module/orchestration'
/**
 * Architecture: Solutions Team
 * Methodology: AI Driven Development (AIDD)
 * Module: UI Metadata Render Logic
 */

import { DynamicParser } from './core/DynamicRenderer.utils'
import { ServiceLocator } from './core/ServiceLocator'
import { useRendererOrchestrator } from '@/composables/renderer/useRendererOrchestrator'
import BreadcrumbsNative from '@/components/atoms/display/BreadcrumbsNative.vue'
import ToolbarNative from '@/components/molecules/navigation/ToolbarNative.vue'
import NestedModuleNative from '@/components/molecules/module/NestedModuleNative.vue'
import type { SchemaField } from '@/lib/types/module'

const props = defineProps<{
  config: any
  orchestrationDetails?: any
  errorColor?: string
  hideFooterActions?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'action'])

// Toda la lógica y estado delegados al Orchestrator
const {
  model,
  schema,
  isDashboardView,
  processedBreadcrumbs,
  isSubmitting,
  wasSubmitted,
  feedback,
  fieldRefs,
  validationErrors,
  backendErrors,
  updateModel,
  handleButtonClick,
  handleComponentAction,
  getFieldValue,
  activeSubmodule,
  submoduleModel,
  backToMain,
  hasChildSubmit,
  updateSubmoduleModel
} = useRendererOrchestrator(props, emit)

function getComponentForSchema(item: SchemaField) {
  const type = resolveOrchestrationTag({
    metadata: props.config?.config?.metadata,
    originalType: item.type
  })
  
  const component = ServiceLocator.get(type)

  if (!component) {
    return ServiceLocator.get('fallback')
  }

  return component
}

function bindProps(item: SchemaField, index: number, curModel: any, overrideConfig?: any): Record<string, any> {
  const type = item.type || ''
  const component = ServiceLocator.get(type)
  const moduleName = props.config?.config?.module

  // Si el componente es el fallback, pasamos detalles del error
  if (!component || type === 'fallback') {
    return {
      type,
      module: moduleName,
      reason: component ? 'mismatch' : 'missing'
    }
  }

  const baseProps = {
    label: item.label,
    name: DynamicParser.getProp(item),
    inputId: `dr-${index}-${DynamicParser.getProp(item)}`,
    type: item.type,
    placeholder: (item as any).placeholder,
    options: (item as any).options || (item as any).values,
    variant: (item as any).variant,
    ...(item as any).config
  }

  // Mezclar con configuración local del hijo si existe
  return overrideConfig ? { ...baseProps, ...overrideConfig } : baseProps
}

</script>

<style scoped>
.dynamic-renderer-container { width: 100%; }
.dynamic-renderer-title {
  font-size: 1.75rem; font-weight: 700; color: #101828; margin: 0; letter-spacing: -0.02em;
}
.dynamic-renderer__standalone-header {
  display: flex;
  align-items: center;
}
.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: white;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  color: #344054;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}
.back-btn:hover {
  background: #F9FAFB;
  border-color: var(--primary-color);
  color: var(--primary-color);
}
.dynamic-renderer-card {
  background-color: #ffffff; border-radius: 12px; border: 1px solid #e4e7ec; padding: 2rem;
  box-shadow: var(--shadow-theme-lg, 0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03));
  margin-top: 1rem; width: 100%;
}
.feedback-msg { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
.feedback-msg.success { background: #ecfdf5; color: #065f46; }
.feedback-msg.error { background: #fef2f2; color: #991b1b; }
.dynamic-renderer-grid {
  display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; width: 100%;
}
.col-12 { grid-column: span 12 / span 12; }
.col-11 { grid-column: span 11 / span 11; }
.col-10 { grid-column: span 10 / span 10; }
.col-9 { grid-column: span 9 / span 9; }
.col-8 { grid-column: span 8 / span 8; }
.col-7 { grid-column: span 7 / span 7; }
.col-6 { grid-column: span 6 / span 6; }
.col-5 { grid-column: span 5 / span 5; }
.col-4 { grid-column: span 4 / span 4; }
.col-3 { grid-column: span 3 / span 3; }
.col-2 { grid-column: span 2 / span 2; }
.col-1 { grid-column: span 1 / span 1; }

/* Child Section Styles */
.dynamic-renderer__child-section {
  border-top: 1px solid #E4E7EC;
  padding-top: 2rem;
}

/* Separator Styles */
.dynamic-renderer__separator {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
.separator-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #101828;
  margin-bottom: 0.5rem;
}
.separator-line {
  height: 1px;
  background-color: #e4e7ec;
  width: 100%;
}
</style>
