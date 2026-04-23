<template>
  <div class="form-group draw-owner">
    <div class="draw-owner__header">
      <div class="draw-owner__info">
        <AppLabel v-if="label" class="draw-owner__title">{{ label }}</AppLabel>
        <p class="draw-owner__subtitle">Arrastre los componentes para reordenarlos</p>
      </div>
      
      <!-- Tabs Premium -->
      <div v-if="tagsToShow.length > 0" class="draw-owner__tabs">
        <button 
          type="button"
          :class="['draw-owner__tab', { 'draw-owner__tab--active': activeTab === 'visual' }]"
          @click="activeTab = 'visual'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          Constructor Visual
        </button>
        <button 
          type="button"
          :class="['draw-owner__tab', { 'draw-owner__tab--active': activeTab === 'json' }]"
          @click="activeTab = 'json'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          Schema JSON
        </button>
      </div>
    </div>

    <!-- Constructor View (with vuedraggable) -->
    <div v-if="activeTab === 'visual'" class="draw-owner__canvas">
      <draggable
        v-if="preview && tagsToShow.length > 0"
        v-model="tagsToShow"
        item-key="id"
        class="draw-owner__grid"
        handle=".draw-owner__drag-handle"
        animation="250"
        ghost-class="draw-owner__ghost"
      >
        <template #item="{ element: item, index }">
          <div
            :class="[
              'draw-owner__cell', 
              item.column,
              { 'draw-owner__cell--narrow': item.column === 'col-1' || item.column === 'col-2' }
            ]"
            :style="fieldColumnStyle(item.column)"
          >
            <div class="draw-owner__field-card">
              <div class="draw-owner__field-overlay">
                <div class="draw-owner__field-type">
                  {{ String(item.type).toUpperCase() }}
                </div>
                
                <div class="draw-owner__controls">
                  <!-- Column Selector -->
                  <div class="draw-owner__control-item">
                    <span class="draw-owner__control-label">Width</span>
                    <select 
                      v-model="item.column" 
                      class="draw-owner__col-select"
                      title="Ancho de columna"
                    >
                      <option value="col-1">1/12</option>
                      <option value="col-2">2/12</option>
                      <option value="col-3">1/4</option>
                      <option value="col-4">1/3</option>
                      <option value="col-6">1/2</option>
                      <option value="col-9">3/4</option>
                      <option value="col-12">Full</option>
                    </select>
                  </div>

                  <div class="draw-owner__drag-handle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>

                  <!-- Delete Button -->
                  <button 
                    type="button" 
                    class="draw-owner__delete-btn" 
                    @click="removeField(index)"
                    title="Eliminar campo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              </div>

              <!-- New Settings Section -->
              <div class="draw-owner__field-settings">
                <div class="draw-owner__settings-row">
                  <div class="draw-owner__input-group">
                    <label class="draw-owner__input-label">Label</label>
                    <input v-model="item.label" type="text" class="draw-owner__input" placeholder="Nombre del campo" />
                  </div>
                  <div class="draw-owner__input-group">
                    <label class="draw-owner__input-label">Placeholder</label>
                    <input v-model="item.placeholder" type="text" class="draw-owner__input" placeholder="Ej: Ingrese valor..." />
                  </div>
                  <div class="draw-owner__input-group">
                    <label class="draw-owner__input-label">Validation</label>
                    <select v-model="item.validationRule" class="draw-owner__input">
                      <option value="">None</option>
                      <option value="nombre">Nombre/Apellido</option>
                      <option value="username">Username</option>
                      <option value="password">Password</option>
                      <option value="email">Email</option>
                      <option value="number">Número/ID</option>
                      <option value="phone">Teléfono</option>
                      <option value="default">Default (Requerido)</option>
                    </select>
                  </div>
                  <div class="draw-owner__input-group draw-owner__input-group--toggle">
                    <label class="draw-owner__toggle">
                      <input v-model="item.disabled" type="checkbox" />
                      <span class="draw-owner__toggle-slider"></span>
                      <span class="draw-owner__toggle-text">Disabled</span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="draw-owner__field-content" :class="{ 'draw-owner--disabled-preview': item.disabled }">
                <component
                  :is="getPreviewComponent(item.type)"
                  v-bind="getPreviewProps(item.type, index)"
                  :model-value="previewModelValue(item.type, index)"
                  @update:model-value="(val: string | string[]) => onPreviewUpdate(index, val)"
                />
              </div>
            </div>
          </div>
        </template>
      </draggable>
      <div v-else class="draw-owner__empty">
        <div class="draw-owner__empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/><path d="m15 5 3 3"/></svg>
        </div>
        <span class="draw-owner__empty-text">Seleccione componentes para empezar a diseñar su módulo</span>
      </div>
    </div>

    <!-- JSON View -->
    <div v-else class="draw-owner__json-view">
      <div class="draw-owner__json-header">
        <span class="text-theme-xs font-medium text-gray-500">Módulo Autogenerado (Schema)</span>
        <button type="button" class="draw-owner__copy-btn" @click="copyJson">
          Copiar JSON
        </button>
      </div>
      <pre class="draw-owner__code"><code>{{ JSON.stringify(generatedSchema, null, 2) }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { AppLabel } from '@/components/atoms'
import { ServiceLocator } from '@/lib/components/core/ServiceLocator'
import type { DrawConfig, SchemaField } from '@/lib/types/module'

const props = withDefaults(
  defineProps<{
    label?: string
    drawConfig?: DrawConfig
    dataSourceValue?: string | string[]
  }>(),
  { drawConfig: undefined, dataSourceValue: () => [] }
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

interface FieldItem {
  id: string
  type: string
  column: string
  label: string
  placeholder: string
  disabled: boolean
  validationRule: string
}

const activeTab = ref<'visual' | 'json'>('visual')
const previewValues = ref<Record<number, string | string[]>>({})
const tagsToShow = ref<FieldItem[]>([])

const selectedTags = computed(() => {
  const v = props.dataSourceValue
  
  // 1. Si es un string directo, intentamos parsear o separar por comas
  if (typeof v === 'string') {
    const str = v.trim()
    if (!str) return []
    try {
      const parsed = JSON.parse(str)
      if (Array.isArray(parsed)) return parsed.map(x => String(x).trim())
    } catch {
      if (str.includes(',')) return str.split(',').map(s => s.trim()).filter(Boolean)
      return [str]
    }
  }

  // 2. Si es un array, revisamos si el primer elemento es un JSON serializado (típico error de transporte)
  if (Array.isArray(v)) {
    if (v.length === 1 && typeof v[0] === 'string' && (v[0].startsWith('[') || v[0].startsWith('{'))) {
      try {
        const parsed = JSON.parse(v[0])
        if (Array.isArray(parsed)) {
          return parsed.map(x => {
            if (typeof x === 'string') return x.trim()
            if (x && typeof x === 'object' && x.type) return String(x.type).trim()
            return String(x).trim()
          }).filter(Boolean)
        }
      } catch { /* fallback to direct map */ }
    }
    return v.map((x) => {
      if (typeof x === 'object' && x !== null && (x as any).type) return String((x as any).type).trim()
      return String(x).trim()
    }).filter(Boolean)
  }

  return []
})

const lastSeenTags = ref<string[]>([])

watch(
  () => selectedTags.value,
  (newTags) => {
    if (!newTags) return
    
    // Identificamos qué se ha añadido REALMENTE en este cambio del picker
    const addedTags = newTags.filter(tag => !lastSeenTags.value.includes(tag))
    
    addedTags.forEach((typeName) => {
      tagsToShow.value.push({
        id: `f-${Math.random().toString(36).substr(2, 9)}`,
        type: typeName,
        column: getDefaultColumn(typeName),
        label: getDefaultLabel(typeName, tagsToShow.value.length),
        placeholder: `Ingrese ${typeName}...`,
        disabled: false,
        validationRule: getDefaultValidationRule(typeName)
      })
    })

    // Actualizamos el historial para la próxima comparación
    lastSeenTags.value = [...newTags]
  },
  { deep: true, immediate: true }
)

function getDefaultColumn(tag: string): string {
  const t = tag.toLowerCase()
  if (t === 'table' || t === 'data-table' || t === 'textarea' || t.includes('invoice')) return 'col-12'
  if (t === 'button' || t === 'toggle' || t === 'switch') return 'col-3'
  return 'col-6'
}

function getDefaultValidationRule(tag: string): string {
  const t = tag.toLowerCase().replace(/_/g, '-')
  if (t === 'email') return 'email'
  if (t === 'password' || t === 'password-input') return 'password'
  if (t === 'phone' || t === 'phone-input' || t === 'tel') return 'phone'
  if (t === 'number' || t === 'input-number') return 'number'
  if (t === 'text' || t === 'input-text') return 'nombre'
  return ''
}

function getDefaultLabel(tag: string, count: number): string {
  const t = tag.charAt(0).toUpperCase() + tag.slice(1).replace(/_/g, ' ')
  return `${t} ${count + 1}`
}

function removeField(index: number) {
  tagsToShow.value.splice(index, 1)
}

const preview = computed(() => props.drawConfig?.preview !== false)

const validationMap: Record<string, { pattern: string; message: string }> = {
  nombre: { pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]{2,50}$', message: 'Solo letras, 2-50 caracteres' },
  userName: { pattern: '^[a-zA-Z0-9_]{3,20}$', message: 'Alfanumérico, 3-20 caracteres, sin espacios' },
  password: { pattern: '^(?=.*[A-Z])(?=.*[0-9]).{8,}$', message: 'Mínimo 8 caracteres, una mayúscula y un número' },
  email: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'Formato de correo inválido' },
  number: { pattern: '^[0-9]+$', message: 'Solo números' },
  phone: { pattern: '^\\+?[0-9]{7,15}$', message: 'Formato de teléfono inválido' },
  default: { pattern: '^.{1,255}$', message: 'Campo requerido' }
}

const generatedSchema = computed<SchemaField[]>(() => {
  return tagsToShow.value.map((item) => {
    const typeName = String(item.type).trim()
    const typeNorm = typeName.replace(/_/g, '-')
    
    // Propiedades generadas DINÁMICAMENTE basadas en el label
    const propKey = item.label.toLowerCase().replace(/\s+/g, '_')
    
    // Estructura completa base según el ejemplo del usuario
    const field: any = {
      type: typeName,
      label: item.label,
      property: propKey,
      placeholder: item.placeholder,
      column: item.column,
      align: 'left',
      visible: true,
      disabled: item.disabled,
      readonly: false
    }

    // Hidratación de VALIDACIÓN (REGLA 4 — Prioridad Rule)
    if (item.validationRule && validationMap[item.validationRule]) {
      field.validation = {
        rule: item.validationRule,
        ...validationMap[item.validationRule]
      }
    }

    // Campos específicos por tipo
    if (typeNorm === 'select' || typeNorm === 'multiple-select-options' || typeNorm === 'radio' || typeNorm === 'checkbox') {
      field.options = ['Opción 1', 'Opción 2']
      field.values = ['Opción 1', 'Opción 2']
    }

    if (typeNorm === 'button') {
      field.label = 'Ejecutar Acción'
      field.endpoint = {
        method: 'POST',
        uri: '{backend}/{endpoint}',
        endpoint: '/v1/api/action',
        backend: 'ms-modules'
      }
    }

    if (typeNorm.includes('input') || typeNorm === 'text' || typeNorm === 'email' || typeNorm === 'password' || typeNorm === 'textarea') {
      field.placeholder = `Ingrese ${typeName}...`
    }

    if (typeNorm === 'textarea') {
      field.rows = 4
    }

    if (typeNorm === 'table' || typeNorm === 'data-table') {
      field.config = {
        columns: [
          { "label": "Usuario", "key": "name", "type": "avatar" },
          { "label": "Posición", "key": "position" },
          { "label": "Salario", "key": "salary" }
        ]
      }
    }

    if (typeNorm === 'list-invoices' || typeNorm === 'invoices-list') {
      field.actions = {
        "row-click": { "type": "navigate", "module": "invoice-detail", "params": { "id": "{id}" } },
        "create-invoice": { "type": "navigate", "module": "invoice-create" }
      }
    }

    return field as SchemaField
  })
})

function fieldColumnStyle(colClass: string | unknown): { gridColumn: string } {
  const match = String(colClass || 'col-6').match(/^col-(\d+)$/)
  const span = match && match[1] ? parseInt(match[1], 10) : 12
  return { gridColumn: `span ${span}` }
}

/** Sync order back to parent if needed */
watch(
  () => tagsToShow.value,
  () => {
    // Sincronizamos el esquema generado hacia el padre
    emit('update:modelValue', JSON.stringify(generatedSchema.value))
  },
  { deep: true }
)

function copyJson() {
  const text = JSON.stringify(generatedSchema.value, null, 2)
  navigator.clipboard.writeText(text)
  alert('Se ha copiado el JSON al portapapeles')
}

function getPreviewComponent(type: string) {
  const normalized = String(type).trim().replace(/_/g, '-')
  const c = ServiceLocator.get(type) ?? ServiceLocator.get(normalized)
  return c || ServiceLocator.get('fallback')
}

function getPreviewProps(type: string, index: number): Record<string, unknown> {
  const item = tagsToShow.value[index]
  if (!item) return {}

  const base: Record<string, unknown> = {
    label: item.label,
    inputId: `draw-preview-${index}-${type}`,
    selectId: `draw-preview-${index}-${type}`,
    placeholder: item.placeholder,
    disabled: item.disabled
  }
  const typeNorm = String(type).toLowerCase().replace(/_/g, '-')
  if (typeNorm === 'select' || typeNorm === 'multiple-select-options' || typeNorm === 'radio' || typeNorm === 'checkbox') {
    base.options = ['Opción 1', 'Opción 2']
  }
  if (typeNorm === 'button') base.label = 'Botón'
  if (typeNorm === 'textarea') {
    base.placeholder = 'Escriba aquí...'
    base.rows = 3
  }
  if (typeNorm === 'phone' || typeNorm === 'phone-input') {
    base.placeholder = '+1 (555) 000-0000'
    base.label = 'Phone'
  }
  if (typeNorm === 'url' || typeNorm === 'url-input') {
    base.placeholder = 'www.tailadmin.com'
    base.label = 'URL'
  }
  if (typeNorm === 'table' || typeNorm === 'data-table') {
    base.columns = [
      { "label": "Usuario", "key": "name", "type": "avatar" },
      { "label": "Posición", "key": "position" },
      { "label": "Salario", "key": "salary" }
    ]
  }
  return base
}

function previewModelValue(type: string, index: number): string | string[] {
  const stored = previewValues.value[index]
  if (stored !== undefined) return stored
  const typeNorm = String(type).toLowerCase().replace(/_/g, '-')
  if (typeNorm === 'multiple-select-options' || typeNorm === 'checkbox') return []
  if (typeNorm === 'switch' || typeNorm === 'toggle') return 'false'
  if (typeNorm === 'table' || typeNorm === 'data-table') {
    return [
      { "name": "Abram Schleifer", "position": "Sales Assistant", "salary": "$89,500" },
      { "name": "Carla George", "position": "Sales Assistant", "salary": "$15,500" }
    ] as any
  }
  if (typeNorm === 'list-invoices' || typeNorm === 'invoices-list') {
    return {
      invoices: [
        { id: '#323534', customer: 'Lindsey Curtis', creationDate: 'August 7, 2028', dueDate: 'February 28, 2028', total: 999, status: 'Paid' },
        { id: '#323535', customer: 'John Doe', creationDate: 'July 1, 2028', dueDate: 'January 1, 2029', total: 1200, status: 'Unpaid' }
      ]
    } as any
  }
  return ''
}

function onPreviewUpdate(index: number, val: string | string[]) {
  previewValues.value = { ...previewValues.value, [index]: val }
}
</script>

<style scoped>
.form-group { margin-bottom: 1.5rem; }

.draw-owner {
  width: 100%;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
}

.draw-owner__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem 1.75rem;
  background: #fcfcfd;
  border-bottom: 1px solid #f1f5f9;
}

.draw-owner__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.draw-owner__title {
  margin-bottom: 0 !important;
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
}

.draw-owner__subtitle {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0;
}

.draw-owner__tabs {
  display: flex;
  background: #f1f5f9;
  padding: 0.375rem;
  border-radius: 10px;
  gap: 0.25rem;
}

.draw-owner__tab {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  border-radius: 7px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
}

.draw-owner__tab--active {
  background: #fff;
  color: var(--primary-color);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.draw-owner__canvas {
  background: #f8fafc;
  padding: 2rem;
  min-height: 400px;
}

.draw-owner__grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.draw-owner__cell {
  position: relative;
  transition: all 0.3s ease;
  z-index: 1;
}

.draw-owner__cell:hover {
  z-index: 10;
}

.draw-owner__field-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  position: relative;
  transition: all 0.2s ease;
  /* El ancho se ajusta automáticamente a la celda de la rejilla */
}

.draw-owner__field-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 10px 15px -3px var(--primary-bg-light, rgba(70, 95, 255, 0.1));
  transform: translateY(-2px);
}

.draw-owner__field-overlay {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.draw-owner__field-card:hover .draw-owner__field-overlay {
  opacity: 1;
}

.draw-owner__field-type {
  font-size: 0.625rem;
  font-weight: 800;
  color: var(--primary-color);
  background: #eff2ff;
  padding: 0.375rem 0.625rem;
  border-radius: 6px;
  letter-spacing: 0.05em;
  border: 1px solid #dce3ff;
}

.draw-owner__controls {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex: 1 0 auto;
  justify-content: flex-end;
}

.draw-owner__cell--narrow .draw-owner__control-label {
  display: none;
}

.draw-owner__cell--narrow .draw-owner__field-card {
  padding: 0.625rem;
}

.draw-owner__cell--narrow .draw-owner__field-overlay {
  margin-bottom: 0.5rem;
  gap: 0.25rem;
}

.draw-owner__cell--narrow .draw-owner__field-type {
  font-size: 0.5625rem;
  padding: 0.25rem 0.375rem;
}

.draw-owner__cell--narrow .draw-owner__input {
  font-size: 0.75rem;
  padding: 0.375rem 0.5rem;
}

.draw-owner__cell--narrow .draw-owner__col-select {
  padding: 0.125rem 1rem 0.125rem 0.25rem;
  font-size: 0.625rem;
}

.draw-owner__cell--narrow .draw-owner__settings-row {
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.draw-owner__col-select {
  font-size: 0.6875rem;
  padding: 0.25rem 1.25rem 0.25rem 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.375rem center;
  transition: all 0.2s;
}

.draw-owner__col-select:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.draw-owner__control-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.draw-owner__control-label {
  font-size: 0.625rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.draw-owner__field-settings {
  background: #fcfcfd;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1.25rem;
}

.draw-owner__settings-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem 1rem;
  align-items: end;
}

.draw-owner__input-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

.draw-owner__input-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #64748b;
}

.draw-owner__input {
  width: 100%;
  font-size: 0.8125rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: border-color 0.2s;
}

.draw-owner__input:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Toggle Switch Styled */
.draw-owner__toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding-bottom: 0.25rem;
}

.draw-owner__toggle input {
  display: none;
}

.draw-owner__toggle-slider {
  width: 32px;
  height: 18px;
  background: #e2e8f0;
  border-radius: 100px;
  position: relative;
  transition: background 0.3s;
}

.draw-owner__toggle-slider::before {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.draw-owner__toggle input:checked + .draw-owner__toggle-slider {
  background: var(--primary-color);
}

.draw-owner__toggle input:checked + .draw-owner__toggle-slider::before {
  transform: translateX(14px);
}

.draw-owner__toggle-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}

.draw-owner--disabled-preview {
  opacity: 0.5;
  pointer-events: none;
}

.draw-owner__delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.draw-owner__delete-btn:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #ef4444;
}

.draw-owner__drag-handle {
  color: #94a3b8;
  cursor: grab;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.draw-owner__drag-handle:hover {
  background: #f1f5f9;
  color: var(--primary-color);
}

.draw-owner__drag-handle:active {
  cursor: grabbing;
}

.draw-owner__ghost {
  opacity: 0.4;
  border: 2px dashed var(--primary-color) !important;
  background: #f0f4ff !important;
}

.draw-owner__field-content {
  pointer-events: none; /* Prevents interaction with inner components while building */
}

/* JSON View improvements */
.draw-owner__json-view {
  background: #1e293b;
}

.draw-owner__json-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.75rem;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.draw-owner__copy-btn {
  font-size: 0.8125rem;
  color: #fff;
  background: var(--primary-color);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.draw-owner__copy-btn:hover {
  background: var(--primary-hover);
}

.draw-owner__code {
  margin: 0;
  padding: 2rem;
  color: #9cdcfe;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}

.draw-owner__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  text-align: center;
  background: #fff;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  margin: 1rem;
}

.draw-owner__empty-icon {
  margin-bottom: 1.5rem;
  background: #f8fafc;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.draw-owner__empty-text {
  color: #64748b;
  font-size: 0.9375rem;
  font-weight: 500;
}
</style>
