<template>
  <div class="nested-module-native">
    <!-- Header: Title (Left) + Toolbar (Right) -->
    <div v-if="child.config && (child.config.toolbarTopLeft || child.config.toolbarTopRight || child.config.toolbar)" class="nested-module__header mb-6">
      <div class="nested-module__header-left">
        <ToolbarNative 
          v-if="child.config.toolbarTopLeft" 
          :items="child.config.toolbarTopLeft"
          @action="onToolbarAction"
        />
      </div>

      <div class="nested-module__header-right">
        <ToolbarNative 
          v-if="child.config.toolbarTopRight" 
          :items="child.config.toolbarTopRight"
          @action="onToolbarAction"
        />
        <ToolbarNative 
          v-else-if="child.config.toolbar" 
          :items="child.config.toolbar"
          @action="onToolbarAction"
        />
      </div>
    </div>

    <!-- Dynamic Grid for Child Module -->
    <div class="nested-module__grid">
      <template v-for="(item, index) in (child.module || child.schema || child.configurationUi?.schema || [])" :key="DynamicParser.fieldKey(item, Number(index))">
        <!-- Field Component -->
        <div
          class="nested-module__cell"
          :class="item.column || 'col-12'"
          :style="StyleUtils.columnStyle(item)"
          v-show="item.visible !== false"
        >
          <div :class="StyleUtils.alignClass(item)" class="nested-module__inner">
            <component
              :is="getComponentForSchema(item)"
              v-bind="bindProps(item, Number(index))"
              :model-value="getFieldValue(item)"
              :invalid="isInvalid(item)"
              :error-message="getErrorMessage(item)"
              :disabled="disabled || item.disabled || (item.property === 'logoUrl' ? !!model.logoFile : item.property === 'logoFile' ? !!model.logoUrl : false)"
              :readonly="item.readonly"
              :error-color="errorColor"
              @update:model-value="(val: any) => emit('update:model', { prop: DynamicParser.getProp(item), val })"
              @click="DynamicParser.isButton(item) ? emit('action', { type: 'button-click', payload: item, context: child }) : undefined"
              @action="(e: any) => emit('action', { type: 'component-action', payload: e, item, context: child })"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import ToolbarNative from '../navigation/ToolbarNative.vue'
import { DynamicParser } from '@/utils/renderer/DynamicRenderer.utils'
import { StyleUtils } from '@/utils/renderer/StyleUtils'
import { ServiceLocator } from '@/lib/components/core/ServiceLocator'
import { resolveOrchestrationTag } from '@/utils/module/orchestration'

const props = defineProps<{
  child: any
  model: any
  disabled?: boolean
  errorColor?: string
  validationErrors?: any
  backendErrors?: any
  wasSubmitted?: boolean
}>()

const emit = defineEmits(['update:model', 'action'])

function onToolbarAction(btn: any) {
  emit('action', { type: 'toolbar-click', payload: btn, context: props.child })
}

function getComponentForSchema(item: any) {
  const type = resolveOrchestrationTag({
    metadata: props.child.config?.metadata || props.child.config,
    originalType: item.type
  })
  
  const component = ServiceLocator.get(type)
  
  if (!component) {
    const errorMsg = `[ERROR DE CONFIGURACIÓN]: El componente tipo '${type}' no existe en el ServiceLocator para el submódulo '${props.child.config?.title || 'desconocido'}'.`
    emit('action', { type: 'critical-error', payload: errorMsg })
    return ServiceLocator.get('fallback')
  }

  return component
}

function bindProps(item: any, index: number): Record<string, any> {
  return {
    label: item.label,
    name: DynamicParser.getProp(item),
    inputId: `nested-${index}-${DynamicParser.getProp(item)}`,
    type: item.type,
    placeholder: item.placeholder,
    options: item.options || item.values,
    variant: item.variant,
    separator: item.separator,
    align: item.align,
    block: item.block,
    ...item.config
  }
}

function getFieldValue(item: any) {
  const prop = DynamicParser.getProp(item)
  return props.model[prop]
}

function isInvalid(item: any) {
  const prop = DynamicParser.getProp(item)
  return ((props.wasSubmitted && props.validationErrors?.[prop]?.invalid) ?? false) || !!props.backendErrors?.[prop]
}

function getErrorMessage(item: any) {
  const prop = DynamicParser.getProp(item)
  return props.backendErrors?.[prop] || (props.wasSubmitted ? props.validationErrors?.[prop]?.message : undefined)
}
</script>

<style scoped>
.nested-module-native {
  width: 100%;
}

.nested-module__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #E4E7EC;
  padding-bottom: 1rem;
}

.nested-module__header-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.nested-module__header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nested-module__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #101828;
  margin: 0;
  letter-spacing: -0.01em;
}

.nested-module__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  width: 100%;
}

.nested-module__inner {
  width: 100%;
}

.nested-module__cell {
  width: 100%;
  min-height: 1px;
}

.col-12 { width: 100%; }
.col-6 { width: calc(50% - 0.75rem); }
.col-4 { width: calc(33.33% - 1rem); }

.nested-module__separator {
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

.mb-5 { margin-bottom: 1.25rem; }
.mt-8 { margin-top: 2rem; }
</style>
