<template>
  <div class="nested-module-native">
    <!-- Header: Title (Left) + Toolbar (Right) -->
    <div v-if="child.config" class="nested-module__header mb-5">
      <div class="nested-module__title-group">
        <h4 v-if="child.config.metadata?.title" class="nested-module__title">
          {{ child.config.metadata.title }}
        </h4>
        <div v-else class="h-1"></div>
      </div>

      <ToolbarNative 
        v-if="child.config.toolbar" 
        :items="child.config.toolbar"
        @action="onToolbarAction"
      />
    </div>

    <!-- Dynamic Grid for Child Module -->
    <div class="nested-module__grid">
      <template v-for="(item, index) in (child.module || child.schema || child.configurationUi?.schema || [])" :key="DynamicParser.fieldKey(item, Number(index))">
        <!-- Separator -->
        <div v-if="item.separator === true" class="nested-module__separator col-12">
          <h3 class="separator-title">{{ item.label }}</h3>
          <div class="separator-line"></div>
        </div>

        <!-- Field Component -->
        <div
          v-else
          class="nested-module__cell"
          :class="item.column || 'col-12'"
          :style="DynamicParser.columnStyle(item)"
          v-show="item.visible !== false"
        >
          <div :class="DynamicParser.alignClass(item)" class="nested-module__inner">
            <component
              :is="getComponentForSchema(item)"
              v-bind="bindProps(item, Number(index))"
              :model-value="getFieldValue(item)"
              :invalid="isInvalid(item)"
              :error-message="getErrorMessage(item)"
              :disabled="disabled || item.disabled"
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
import { DynamicParser } from '@/lib/components/core/DynamicRenderer.utils'
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
    metadata: props.child.config?.metadata,
    originalType: item.type
  })
  return ServiceLocator.get(type) || ServiceLocator.get('fallback')
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
}

.nested-module__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #101828;
  margin: 0;
}

.nested-module__grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  width: 100%;
}

.col-12 { grid-column: span 12 / span 12; }
.col-6 { grid-column: span 6 / span 6; }
.col-4 { grid-column: span 4 / span 4; }

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
