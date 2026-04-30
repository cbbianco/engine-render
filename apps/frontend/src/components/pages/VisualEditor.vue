<template>
  <div class="visual-editor-page">
    <div class="editor-header">
      <h2>
        {{ currentStep === 1 ? 'Paso 1: Diseño de Módulos' : 
           currentStep === 2 ? 'Paso 2: Validaciones y Lógica' : 
           currentStep === 3 ? 'Paso 3: Orquestación (Endpoints)' : 
           'Paso 4: Previsualización y Asignación' }}
      </h2>
      <div class="header-actions">
        <button class="app-button--secondary" @click="showHelpModal = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Instrucciones 📖
        </button>
        <button v-if="currentStep === 1" class="app-button--primary generate-btn" @click="showStepConfirmModal = true">
          Siguiente: Validaciones ➡️
        </button>
        <div v-else-if="currentStep === 2" class="step-actions">
          <button class="app-button--secondary" @click="currentStep = 1">⬅️ Volver al Diseño</button>
          <button class="app-button--primary generate-btn" @click="currentStep = 3">Siguiente: Orquestación ➡️</button>
        </div>
        <div v-else-if="currentStep === 3" class="step-actions">
          <button class="app-button--secondary" @click="currentStep = 2">⬅️ Volver a Validaciones</button>
          <button class="app-button--primary generate-btn" @click="currentStep = 4">Siguiente: Asignación ➡️</button>
        </div>
        <div v-else class="step-actions">
          <button class="app-button--secondary" @click="currentStep = 3">⬅️ Volver a Orquestación</button>
          <button class="app-button--primary generate-btn" @click="generateJSON">Finalizar y Generar JSON 🚀</button>
        </div>
      </div>
    </div>

    <div class="editor-layout">
      <!-- PANEL IZQUIERDO PASO 1: COMPONENTES -->
      <div v-if="currentStep === 1" class="sidebar">
        <h3>Componentes</h3>
        <div class="components-list">
          <div 
            v-for="(comp, i) in availableComponents" 
            :key="i"
            class="draggable-item"
            draggable="true"
            @dragstart="onDragStart($event, comp)"
          >
            <div class="icon" v-html="comp.icon"></div>
            <span>{{ comp.label }}</span>
          </div>
        </div>
      </div>

      <!-- PANEL IZQUIERDO PASO 2: VALIDACIONES -->
      <div v-if="currentStep === 2" class="sidebar sidebar-validations">
        <h3>Reglas de Validación</h3>
        <p class="sidebar-help">Arrastra estas reglas hacia los componentes</p>
        <div class="components-list">
          <div 
            v-for="(val, i) in availableValidations" 
            :key="i"
            class="draggable-item validation-item"
            draggable="true"
            @dragstart="onValidationDragStart($event, val)"
          >
            <div class="icon" v-html="val.icon"></div>
            <span>{{ val.label }}</span>
          </div>
        </div>
      </div>

      <!-- PANEL IZQUIERDO PASO 3: ORQUESTACIÓN -->
      <div v-if="currentStep === 3" class="sidebar sidebar-orchestration">
        <h3>Orquestación</h3>
        <p class="sidebar-help">Configura el endpoint de consulta base para el módulo.</p>
        <div class="form-group">
          <label>Método HTTP</label>
          <select v-model="orchestrationConfig.consult.method" class="styled-select">
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>
        <div class="form-group">
          <label>Backend URL</label>
          <input type="text" v-model="orchestrationConfig.consult.backend" class="styled-input" placeholder="http://localhost:4001" />
        </div>
        <div class="form-group">
          <label>URI Base</label>
          <input type="text" v-model="orchestrationConfig.consult.uri" class="styled-input" placeholder="{backend}/{endpoint}" />
        </div>
        <div class="form-group">
          <label>Endpoint</label>
          <select v-model="orchestrationConfig.consult.endpoint" class="styled-select">
            <option value="/api/v1/users">Usuarios (/api/v1/users)</option>
            <option value="/api/v1/users/profile">Perfil (/api/v1/users/profile)</option>
            <option value="/api/v1/products">Productos (/api/v1/products)</option>
            <option value="/api/v1/inventory">Inventario (/api/v1/inventory)</option>
            <option value="/api/v1/roles">Roles (/api/v1/roles)</option>
          </select>
        </div>
      </div>

      <!-- PANEL IZQUIERDO PASO 4: ASIGNACIÓN -->
      <div v-if="currentStep === 4" class="sidebar sidebar-assignment">
        <h3>Asignación de Módulo</h3>
        <p class="sidebar-help">Asigna este módulo a un usuario y rol específico.</p>
        <div class="form-group">
          <label>Usuario</label>
          <select v-model="assignmentConfig.user" class="styled-select">
            <option value="all">Todos los Usuarios</option>
            <option v-for="u in availableUsers" :key="u.id || u._id || u.userName" :value="u.id || u._id || u.userName">
              {{ u.userName || u.email || u.name || 'Usuario sin nombre' }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Rol Requerido</label>
          <select v-model="assignmentConfig.role" class="styled-select">
            <option value="Superadmin">Superadmin</option>
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>
      </div>

      <!-- ÁREA DE TRABAJO (DROP ZONE) PASOS 1 Y 2 -->
      <div v-if="currentStep === 1 || currentStep === 2" class="workspace">
        <div 
          class="drop-zone"
          :class="{ 'step-2-workspace': currentStep === 2 }"
          @dragover.prevent
          @dragenter.prevent
          @drop="onDrop($event)"
        >
          <div v-if="droppedComponents.length === 0" class="empty-state">
            Arrastra componentes aquí para formar tu módulo
          </div>
          
          <template v-else>
            <div 
              v-for="(comp, index) in droppedComponents" 
              :key="comp.id"
              class="dropped-item"
              :class="[`col-${comp.column}`, currentStep === 2 ? 'drop-target-validation' : '']"
              :draggable="currentStep === 1"
              @dragstart="currentStep === 1 ? onDragItemStart($event, index) : null"
              @dragover.prevent
              @drop.stop="currentStep === 2 ? onDropValidation($event, index) : onDrop($event, index)"
            >
              <!-- Cabecera del componente (Sólo reorganizable en Paso 1) -->
              <div class="item-header">
                <div v-if="currentStep === 1" class="drag-handle" title="Arrastra para reordenar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                </div>
                <strong>{{ comp.label }}</strong>
                <span v-if="currentStep === 2" class="prop-badge">{{ comp.property }}</span>
                <button v-if="currentStep === 1" class="remove-btn" @click="removeComponent(index)">X</button>
              </div>
              
              <!-- Configuración Paso 1 -->
              <div v-if="currentStep === 1" class="item-config">
                <div class="config-row">
                  <div class="config-field">
                    <label>Property Name (Key):</label>
                    <input type="text" v-model="comp.property" placeholder="Ej: nombre, id, etc." />
                  </div>
                  <div class="config-field">
                    <label>Columnas (Ancho de Grilla):</label>
                    <div class="column-controls">
                      <button class="col-preset" :class="{ active: comp.column === 3 }" @click="comp.column = 3">25%</button>
                      <button class="col-preset" :class="{ active: comp.column === 4 }" @click="comp.column = 4">33%</button>
                      <button class="col-preset" :class="{ active: comp.column === 6 }" @click="comp.column = 6">50%</button>
                      <button class="col-preset" :class="{ active: comp.column === 12 }" @click="comp.column = 12">100%</button>
                      <div class="col-spinner">
                        <button class="spin-btn" @click="comp.column > 1 && comp.column--">-</button>
                        <span>{{ comp.column }}/12</span>
                        <button class="spin-btn" @click="comp.column < 12 && comp.column++">+</button>
                      </div>
                    </div>
                  </div>
                  <div class="config-field">
                    <label>Opciones Adicionales:</label>
                    <div class="column-controls">
                      <label class="checkbox-label">
                        <input type="checkbox" v-model="comp.config.readonly" /> Solo Lectura
                      </label>
                      <label class="checkbox-label" style="margin-left: 10px;">
                        <input type="checkbox" v-model="comp.config.disabled" /> Deshabilitado
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Píldoras de Validación Paso 2 -->
              <div v-if="currentStep === 2" class="validations-container">
                <div v-if="!comp.validations || comp.validations.length === 0" class="no-validations">
                  Arrastra validaciones aquí
                </div>
                <div v-else class="validations-list">
                  <div v-for="(val, vIndex) in comp.validations" :key="val.id" class="validation-pill">
                    <div class="pill-header">
                      <span>{{ val.label }}</span>
                      <button class="pill-remove" @click="removeValidation(Number(index), Number(vIndex))">×</button>
                    </div>
                    
                    <!-- Configuración dinámica de la validación -->
                    <div v-if="val.type === 'pattern'" class="pill-config">
                      <input type="text" v-model="val.patternValue" placeholder="Regex Ej: ^[0-9]+$" />
                      <input type="text" v-model="val.message" placeholder="Mensaje de error" />
                    </div>
                    <div v-if="val.type === 'match'" class="pill-config">
                      <input type="text" v-model="val.matchProperty" placeholder="Key a coincidir (Ej: password)" />
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Vista Previa -->
              <div class="item-preview" :class="{ 'faded-preview': currentStep === 2 }">
                <component 
                  :is="ServiceLocator.get(comp.type)"
                  v-bind="getMockProps(comp)"
                />
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- ÁREA DE TRABAJO PASO 3: ORQUESTACIÓN -->
      <div v-if="currentStep === 3" class="workspace workspace-center">
        <div class="step-content json-preview-box">
          <h3>Configuración de Orquestación</h3>
          <p>El objeto <code>consult</code> se inyectará en el JSON final para obtener los datos iniciales.</p>
          <pre class="json-preview">{{ JSON.stringify(orchestrationConfig, null, 2) }}</pre>
        </div>
      </div>

      <!-- ÁREA DE TRABAJO PASO 4: PREVIEW -->
      <div v-if="currentStep === 4" class="workspace">
        <div class="drop-zone step-4-workspace">
          <div v-if="droppedComponents.length === 0" class="empty-state">
            No hay componentes para previsualizar.
          </div>
          <template v-else>
            <div 
              v-for="comp in droppedComponents" 
              :key="'prev_'+comp.id"
              class="dropped-item preview-item"
              :class="[`col-${comp.column}`]"
            >
              <div class="item-preview">
                <component 
                  :is="ServiceLocator.get(comp.type)"
                  v-bind="getMockProps(comp)"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Modal: Transición a Validaciones -->
    <div v-if="showStepConfirmModal" class="modal-overlay" @click.self="showStepConfirmModal = false">
      <div class="modal-content">
        <h3>Confirmar Diseño</h3>
        <p style="margin-bottom: 1.5rem; color: #475467;">
          ¿Estás seguro de continuar al Paso 2? En el siguiente paso te enfocarás exclusivamente en <strong>asignar validaciones (requeridos, reglas, regex)</strong> a los campos arrastrándolas sobre ellos. El diseño (ancho y orden) quedará fijo temporalmente.
        </p>
        <div class="modal-actions">
          <button class="app-button--secondary"  @click="showStepConfirmModal = false">Seguir editando diseño 🛠️</button>
          <button class="app-button--primary" @click="goToStep2">Ir a Validaciones ➡️</button>
        </div>
      </div>
    </div>

    <!-- Modal para mostrar el JSON generado -->
    <div v-if="showJsonModal" class="modal-overlay" @click.self="showJsonModal = false">
      <div class="modal-content">
        <h3>JSON Generado Final</h3>
        <textarea readonly :value="generatedJson"></textarea>
        <div class="modal-actions">
          <button class="app-button--primary" @click="copyJson">Copiar 📋</button>
          <button class="app-button--secondary" @click="showJsonModal = false">Cerrar ❌</button>
        </div>
      </div>
    </div>

    <!-- Modal de Instrucciones -->
    <div v-if="showHelpModal" class="modal-overlay" @click.self="showHelpModal = false">
      <div class="modal-content help-modal">
        <h3>Cómo usar el Editor Visual de 2 Pasos</h3>
        <div class="help-content">
          <p>Este editor te permite ensamblar módulos visualmente y luego inyectarles validaciones lógicas.</p>
          
          <div class="help-step">
            <strong>Paso 1: Maquetado (Drag & Drop)</strong>
            <p>Arrastra componentes desde la izquierda para formar tu formulario. Ajusta el "Property Name" (key del objeto) y define el ancho seleccionando de 1 a 12 columnas (25%, 50%, etc.).</p>
          </div>
          
          <div class="help-step">
            <strong>💡 Tip: Reordenar Layout</strong>
            <p>Puedes arrastrar cualquier componente desde su cabecera (ícono punteado) y soltarlo en medio de otros para organizarlos de manera responsiva.</p>
          </div>
          
          <div class="help-step">
            <strong>Paso 2: Validaciones y Lógica</strong>
            <p>Una vez satisfecho con el diseño, pasa al Paso 2. Ahora el panel izquierdo mostrará reglas de validación (Requerido, Email, Contraseña, Regex, Match). Arrástralas y suéltalas <strong>dentro</strong> del componente al que quieres aplicar la regla.</p>
          </div>
        </div>
        <div class="modal-actions">
          <button class="app-button--primary" @click="showHelpModal = false">Entendido 👍</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ServiceLocator } from '@/lib/components/core/ServiceLocator'
import { HttpClient } from '@/services/core/http/HttpClient'
import * as sessionPersist from '@/persistence/auth/session.persistence'

const currentStep = ref(1)
const showStepConfirmModal = ref(false)
const showJsonModal = ref(false)
const showHelpModal = ref(false)
const generatedJson = ref('')
let itemIdCounter = 1

const droppedComponents = ref<any[]>([])

const orchestrationConfig = ref({
  consult: {
    method: 'GET',
    uri: '{backend}/{endpoint}',
    endpoint: '/api/v1/users/profile',
    backend: 'http://localhost:4001'
  }
})

const assignmentConfig = ref({
  user: 'all',
  role: 'Superadmin'
})

const availableUsers = ref<any[]>([])

onMounted(async () => {
  try {
    const session = sessionPersist.loadSession()
    if (session?.token) {
      const http = new HttpClient(import.meta.env.VITE_AUTH_API_BASE_URL ?? 'http://localhost:4001')
      const { data, status } = await http.get<any>('/api/v1/users', {
        Authorization: `Bearer ${session.token}`
      })
      if (status >= 200 && status < 300) {
        if (Array.isArray(data)) {
          availableUsers.value = data
        } else if (data && Array.isArray(data.data)) {
          availableUsers.value = data.data
        } else {
          availableUsers.value = []
        }
      } else {
        availableUsers.value = []
      }
    } else {
      availableUsers.value = []
    }
  } catch (error) {
    availableUsers.value = []
  }
})

const mockColumns = [
  { label: 'ID', key: 'id' },
  { label: 'Nombre', key: 'name' },
  { label: 'Estado', key: 'status' }
]
const mockData = [
  { id: '1', name: 'Muestra A', status: 'Activo' },
  { id: '2', name: 'Muestra B', status: 'Pendiente' }
]

const getMockProps = (comp: any) => {
  const base: any = { 
    label: comp.property || comp.label,
    placeholder: `Escribe un ${comp.label.toLowerCase()}...`,
    ...comp.config
  }
  
  if (['select', 'radio', 'checkbox'].includes(comp.type)) {
    base.options = [{ id: 'opt1', label: 'Opción 1' }, { id: 'opt2', label: 'Opción 2' }]
  } else if (['table', 'table-products', 'list-invoices', 'data-table'].includes(comp.type)) {
    base.columns = mockColumns
    base.modelValue = mockData
  } else if (comp.type === 'kanban-board') {
    base.modelValue = []
  } else if (comp.type === 'button') {
    base.label = base.label || 'Botón'
  }
  
  return base
}

const icons = {
  text: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="10" width="18" height="10" rx="2"/><path d="M7 10V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4"/></svg>',
  number: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 10h16M4 14h16M10 4v16M14 4v16"/></svg>',
  checkbox: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 11 12 14 22 4"/></svg>',
  select: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="8 10 12 14 16 10"/></svg>',
  table: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>',
  file: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  calendar: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  layout: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
  validation: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
}

const availableComponents = [
  { type: 'title', label: 'Título', icon: icons.text },
  { type: 'separator', label: 'Separador Línea', icon: icons.layout },
  { type: 'input', label: 'Texto Corto', icon: icons.text },
  { type: 'textarea', label: 'Texto Largo (Área)', icon: icons.text },
  { type: 'input', label: 'Numérico', config: { type: 'number' }, icon: icons.number },
  { type: 'email', label: 'Correo Electrónico', icon: icons.text },
  { type: 'password', label: 'Contraseña', icon: icons.text },
  { type: 'phone', label: 'Teléfono', icon: icons.text },
  { type: 'url', label: 'Enlace URL', icon: icons.text },
  { type: 'checkbox', label: 'Selección Múltiple', icon: icons.checkbox },
  { type: 'radio', label: 'Opción Única', icon: icons.checkbox },
  { type: 'select', label: 'Menú Desplegable', icon: icons.select },
  { type: 'switch', label: 'Interruptor (Toggle)', icon: icons.checkbox },
  { type: 'datepicker', label: 'Fecha (Datepicker)', icon: icons.calendar },
  { type: 'file', label: 'Subida de Archivo', icon: icons.file },
  { type: 'button', label: 'Botón de Acción', icon: icons.layout },
  { type: 'table', label: 'Tabla Premium', icon: icons.table },
  { type: 'kanban-board', label: 'Tablero Kanban', icon: icons.layout },
]

const availableValidations = [
  { type: 'required', label: 'Campo Obligatorio', icon: icons.validation },
  { type: 'rule', ruleType: 'password', label: 'Regla: Contraseña Segura', icon: icons.validation },
  { type: 'rule', ruleType: 'userName', label: 'Regla: Formato de Usuario', icon: icons.validation },
  { type: 'rule', ruleType: 'nombre', label: 'Regla: Nombres / Solo Texto', icon: icons.validation },
  { type: 'pattern', label: 'RegEx Personalizado', icon: icons.validation },
  { type: 'match', label: 'Coincidir con campo', icon: icons.validation }
]

// Drag and drop Step 1
const onDragStart = (event: DragEvent, comp: any) => {
  event.dataTransfer?.setData('component', JSON.stringify(comp))
  event.dataTransfer!.effectAllowed = 'copy'
}

const onDragItemStart = (event: DragEvent, index: number) => {
  event.stopPropagation()
  event.dataTransfer?.setData('reorder-index', String(index))
  event.dataTransfer!.effectAllowed = 'move'
}

const onDrop = (event: DragEvent, targetIndex?: number) => {
  if (currentStep.value !== 1) return

  const compData = event.dataTransfer?.getData('component')
  const reorderIndex = event.dataTransfer?.getData('reorder-index')

  if (compData) {
    const comp = JSON.parse(compData)
    const newComp = {
      ...comp,
      config: comp.config ? { ...comp.config } : {},
      id: `item_${itemIdCounter++}`,
      property: `field_${droppedComponents.value.length + 1}`,
      column: 12,
      validations: []
    }
    
    if (typeof targetIndex === 'number') {
      droppedComponents.value.splice(targetIndex, 0, newComp)
    } else {
      droppedComponents.value.push(newComp)
    }
  } else if (reorderIndex !== undefined && reorderIndex !== '') {
    const fromIndex = parseInt(reorderIndex, 10)
    let toIndex = typeof targetIndex === 'number' ? targetIndex : droppedComponents.value.length
    
    if (fromIndex === toIndex) return
    const [movedItem] = droppedComponents.value.splice(fromIndex, 1)
    
    if (typeof targetIndex === 'number' && fromIndex < targetIndex) toIndex--
    
    droppedComponents.value.splice(toIndex, 0, movedItem)
  }
}

const removeComponent = (index: number) => {
  droppedComponents.value.splice(index, 1)
}

const goToStep2 = () => {
  showStepConfirmModal.value = false
  currentStep.value = 2
}

// Drag and drop Step 2 (Validations)
const onValidationDragStart = (event: DragEvent, val: any) => {
  event.dataTransfer?.setData('validation', JSON.stringify(val))
  event.dataTransfer!.effectAllowed = 'copy'
}

const onDropValidation = (event: DragEvent, compIndex: number) => {
  if (currentStep.value !== 2) return
  
  const data = event.dataTransfer?.getData('validation')
  if (data) {
    const val = JSON.parse(data)
    
    if (!droppedComponents.value[compIndex].validations) {
      droppedComponents.value[compIndex].validations = []
    }
    
    // Evitar duplicados del mismo tipo base (excepto regex si lo deseas, pero por consistencia limitamos 1 por tipo)
    const exists = droppedComponents.value[compIndex].validations.some((v: any) => v.type === val.type && v.ruleType === val.ruleType)
    if (exists) return
    
    const newVal = { ...val, id: Date.now() }
    
    if (val.type === 'pattern') {
      newVal.patternValue = ''
      newVal.message = 'Formato inválido'
    } else if (val.type === 'match') {
      newVal.matchProperty = ''
    }
    
    droppedComponents.value[compIndex].validations.push(newVal)
  }
}

const removeValidation = (compIndex: number, valIndex: number) => {
  droppedComponents.value[compIndex].validations.splice(valIndex, 1)
}

const generateJSON = () => {
  const schema = droppedComponents.value.map((comp) => {
    // Esqueleto Base
    const fieldSchema: any = {
      type: comp.type,
      label: comp.label,
      property: comp.property,
      column: `col-${comp.column}`,
      ...(comp.config || {})
    }
    
    // Inyectar validaciones en base a las píldoras asignadas en Paso 2
    let validationObj: any = null
    
    if (comp.validations && comp.validations.length > 0) {
      comp.validations.forEach((val: any) => {
        if (val.type === 'required') {
          fieldSchema.required = true
        } else if (val.type === 'rule') {
          if (!validationObj) validationObj = {}
          validationObj.rule = val.ruleType
        } else if (val.type === 'pattern') {
          if (!validationObj) validationObj = {}
          validationObj.pattern = val.patternValue
          validationObj.message = val.message
        } else if (val.type === 'match') {
          fieldSchema.match = val.matchProperty
        }
      })
    }
    
    // Si no hay rule ni pattern pero la propiedad 'validation' ya se creó, la dejamos,
    // de lo contrario la omitimos para limpieza. Si es requerido, DynamicRenderer.utils asume `required`.
    if (validationObj) {
      fieldSchema.validation = validationObj
    }
    
    return fieldSchema
  })

  const output = {
    modulo: "ModuloGenerado",
    assignedUser: assignmentConfig.value.user,
    assignedRole: assignmentConfig.value.role,
    configurationUi: {
      config: {
        isModuleInner: false,
        actions: { create: true, edit: true, delete: true }
      },
      schema: schema,
      model: {}
    },
    orchestrationDetails: orchestrationConfig.value
  }

  generatedJson.value = JSON.stringify(output, null, 2)
  showJsonModal.value = true
}

const copyJson = () => {
  navigator.clipboard.writeText(generatedJson.value)
  alert('JSON copiado al portapapeles')
}
</script>

<style scoped>
.visual-editor-page {
  padding: 2rem;
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.editor-header h2 {
  color: var(--secondary-color, #1D2939);
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.step-actions {
  display: flex;
  gap: 1rem;
}

.app-button--secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: white;
  color: var(--primary-color, #465FFF);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--primary-color, #465FFF);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.app-button--secondary:hover {
  background-color: var(--primary-color, #465FFF);
  color: white;
}

.generate-btn {
  background-color: var(--primary-color, #465FFF);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

.generate-btn:hover {
  opacity: 0.9;
}

.app-button--primary {
  background-color: var(--primary-color, #465FFF);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

.app-button--primary:hover {
  opacity: 0.9;
}

.app-button--secondary {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--primary-color, #465FFF);
  background: white;
  color: var(--primary-color, #465FFF);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.app-button--secondary:hover {
  background: rgba(70, 95, 255, 0.05);
  color: var(--primary-color, #465FFF);
}

/* Nuevos inputs para sidebars */
.form-group {
  margin-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--secondary-color, #1D2939);
}
.styled-input, .styled-select {
  padding: 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
  color: var(--secondary-color, #1D2939);
  background: #f8fafc;
  outline: none;
  transition: border-color 0.2s;
}
.styled-input:focus, .styled-select:focus {
  border-color: var(--primary-color, #465FFF);
  background: white;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--secondary-color, #64748b);
  cursor: pointer;
}
.checkbox-label input {
  cursor: pointer;
}

.workspace-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.json-preview-box {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  text-align: left;
}
.json-preview-box h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  color: #334155;
}
.json-preview-box p {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
.json-preview {
  background: #1e293b;
  color: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  font-family: monospace;
  overflow-x: auto;
  margin-top: 1rem;
}
.step-4-workspace {
  border-color: transparent;
  background-color: transparent;
  opacity: 1;
}
.preview-item {
  border-color: transparent;
  box-shadow: none;
  padding: 0;
  background: transparent;
}
.preview-item .item-preview {
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  padding: 1.5rem;
  opacity: 1;
  pointer-events: auto; /* Editable preview */
}

.editor-layout {
  display: flex;
  gap: 2rem;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.sidebar-validations {
  border-top: 4px solid var(--primary-color, #465FFF);
}

.sidebar-help {
  font-size: 0.85rem;
  color: var(--secondary-color, #64748b);
  margin-top: 0.5rem;
  line-height: 1.4;
}

.sidebar h3 {
  color: var(--secondary-color, #1D2939);
}

.components-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.draggable-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #ffffff;
  border: 1px solid #E4E7EC;
  border-radius: 8px;
  cursor: grab;
  color: var(--secondary-color, #1D2939);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.draggable-item:hover {
  background: rgba(70, 95, 255, 0.05);
  border-color: var(--primary-color, #465FFF);
  color: var(--primary-color, #465FFF);
}

.validation-item {
  border-left: 3px solid var(--primary-color, #465FFF);
}

.icon {
  display: flex;
  color: inherit;
  width: 20px;
  height: 20px;
}
.icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.workspace {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  overflow-y: auto;
}

.drop-zone {
  min-height: 100%;
  border: 2px dashed var(--primary-color, #465FFF);
  border-radius: 8px;
  padding: 1rem;
  background-color: #F9FAFB;
  opacity: 0.8;
  transition: opacity 0.2s, border-color 0.2s;
  
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  align-content: start;
}

.step-2-workspace {
  border-color: transparent;
  background-color: transparent;
  opacity: 1;
}

.drop-zone:hover {
  opacity: 1;
}

.empty-state {
  grid-column: span 12;
  margin: auto;
  color: var(--secondary-color, #667085);
  font-size: 1rem;
  text-align: center;
  font-weight: 500;
  padding: 3rem 0;
}

/* Grilla CSS */
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

.dropped-item {
  background: white;
  border: 1px solid var(--primary-color, #465FFF);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.dropped-item[draggable="true"] {
  cursor: grab;
}
.dropped-item[draggable="true"]:active {
  cursor: grabbing;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  z-index: 10;
}

/* Efecto al arrastrar una validación sobre él */
.drop-target-validation {
  border: 2px dashed var(--primary-color, #465FFF);
}
.drop-target-validation:hover {
  border-color: var(--primary-color, #465FFF);
  background-color: rgba(70, 95, 255, 0.05);
}

.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  color: var(--primary-color, #465FFF);
}

.drag-handle {
  margin-right: 0.5rem;
  color: var(--secondary-color, #98A2B3);
  display: flex;
  align-items: center;
}

.item-header strong {
  flex: 1;
}

.prop-badge {
  background: rgba(70, 95, 255, 0.1);
  color: var(--primary-color, #465FFF);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: monospace;
}

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-weight: bold;
}

.item-config {
  margin-bottom: 0.5rem;
}

.config-row {
  display: flex;
  gap: 1rem;
}

.config-field {
  flex: 1;
}

.config-field label {
  display: block;
  font-size: 0.8rem;
  color: var(--secondary-color, #64748b);
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.config-field input[type="text"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: var(--primary-color, #465FFF);
}

.column-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.col-preset {
  padding: 0.25rem 0.5rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--secondary-color, #64748b);
  transition: all 0.2s;
}
.col-preset:hover {
  border-color: var(--primary-color, #465FFF);
  color: var(--primary-color, #465FFF);
}
.col-preset.active {
  background: var(--primary-color, #465FFF);
  color: white;
  border-color: var(--primary-color, #465FFF);
}

.col-spinner {
  display: flex;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: white;
  overflow: hidden;
  margin-left: auto;
}
.spin-btn {
  background: #f8fafc;
  border: none;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  color: var(--secondary-color, #64748b);
  font-weight: bold;
}
.spin-btn:hover { background: rgba(70, 95, 255, 0.1); color: var(--primary-color, #465FFF); }
.col-spinner span {
  padding: 0 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--secondary-color, #1D2939);
  min-width: 40px;
  text-align: center;
}

/* Validaciones Visuales */
.validations-container {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--primary-color, #465FFF);
}
.no-validations {
  color: var(--secondary-color, #94a3b8);
  font-size: 0.85rem;
  text-align: center;
  padding: 1rem;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
}
.validations-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.validation-pill {
  background: white;
  border: 1px solid var(--primary-color, #465FFF);
  border-radius: 6px;
  overflow: hidden;
}
.pill-header {
  background: rgba(70, 95, 255, 0.1);
  color: var(--primary-color, #465FFF);
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pill-remove {
  background: none;
  border: none;
  color: var(--primary-color, #465FFF);
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
}
.pill-config {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-top: 1px solid rgba(70, 95, 255, 0.2);
}
.pill-config input {
  padding: 0.4rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--primary-color, #465FFF);
}

.item-preview {
  margin-top: auto;
  padding: 1rem;
  background: rgba(70, 95, 255, 0.02);
  border: 1px dashed var(--primary-color, #465FFF);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: none;
}
.faded-preview {
  opacity: 0.6;
}
.item-preview > * {
  width: 100%;
  min-width: 100%;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 600px;
  max-width: 90vw;
}
.modal-content textarea {
  width: 100%;
  height: 300px;
  margin: 1rem 0;
  font-family: monospace;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  color: var(--secondary-color, #1D2939);
}
.help-modal h3, .modal-content h3 { 
  color: var(--primary-color, #465FFF); 
  font-size: 1.5rem; 
  margin-bottom: 1.5rem; 
}
.modal-content p {
  color: var(--secondary-color, #475467);
}
.help-content { margin-bottom: 2rem; color: var(--primary-color, #465FFF); line-height: 1.6; }
.help-step {
  margin-top: 1.25rem; padding: 1rem; background: #ffffff;
  border: 1px solid #E4E7EC; border-radius: 8px; border-left: 4px solid var(--primary-color, #465FFF);
}
.help-step strong { display: block; color: var(--primary-color, #465FFF); margin-bottom: 0.25rem; font-weight: 600; }
.help-step p { margin: 0; font-size: 0.9rem; color: var(--primary-color, #465FFF); }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.modal-actions button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}
</style>

<style scoped>
@media (max-width: 768px) {
  .config-row {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 1rem;
  }
  .config-field {
    width: 100%;
  }
  .column-controls {
    flex-wrap: wrap;
    gap: 0.5rem;
    width: 100%;
  }
  .col-preset {
    flex: 1 1 calc(25% - 0.5rem);
    text-align: center;
  }
  .col-spinner {
    width: 100%;
    justify-content: space-between;
    margin-top: 0.5rem;
  }
}
</style>
