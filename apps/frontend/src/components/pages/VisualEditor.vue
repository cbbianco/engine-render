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
        <button class="app-button--secondary" @click="showImportModal = true">
          Importar JSON 📥
        </button>
        <button class="app-button--secondary" @click="showHelpModal = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Instrucciones 📖
        </button>
        <button v-if="currentStep === 1" class="app-button--primary" :disabled="droppedComponents.length === 0" @click="showStepConfirmModal = true">
          Siguiente: Validaciones ➡️
        </button>
        <div v-else-if="currentStep === 2" class="step-actions">
          <button class="app-button--secondary" @click="currentStep = 1">⬅️ Volver al Diseño</button>
          <button class="app-button--primary" :disabled="droppedComponents.length === 0" @click="currentStep = 3">Siguiente: Orquestación ➡️</button>
        </div>
        <div v-else-if="currentStep === 3" class="step-actions">
          <button class="app-button--secondary" @click="currentStep = 2">⬅️ Volver a Validaciones</button>
          <button class="app-button--primary" :disabled="droppedComponents.length === 0" @click="goToStep4">Siguiente: Asignación ➡️</button>
        </div>
        <div v-else class="step-actions">
          <button class="app-button--secondary" style="color: #ef4444; border-color: #ef4444;" @click="clearEditor">Limpiar Editor 🗑️</button>
          <button class="app-button--secondary" @click="currentStep = 3">⬅️ Volver a Orquestación</button>
          <button class="app-button--primary" :disabled="droppedComponents.length === 0" @click="generateJSON">Finalizar y Generar JSON 🚀</button>
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
        <p class="sidebar-help">Configura la lógica y los metadatos base del módulo.</p>
        <div class="orchestration-panel">
          <div class="orchestration-section">
            <h4>General</h4>
            <div class="config-grid">
              <div class="config-field">
                <label>Título:</label>
                <input type="text" v-model="moduleMetadata.title" />
              </div>
              <div class="config-field">
                <label>Ruta (URL):</label>
                <input type="text" v-model="moduleMetadata.path" />
              </div>
            </div>
          </div>
          <div class="orchestration-section" style="margin-top: 1rem;">
            <h4>Datos</h4>
            <div class="config-field">
              <label>Tipo:</label>
              <select v-model="moduleMetadata.orchestrationType">
                <option value="CONSULT">CONSULTA (GET)</option>
                <option value="PROCESS">PROCESO (POST)</option>
              </select>
            </div>
            <div class="config-field">
              <label>Backend URL:</label>
              <input type="text" v-model="orchestrationConfig.backend" />
            </div>
            <div class="config-field">
              <label>Endpoint:</label>
              <input type="text" v-model="orchestrationConfig.endpoint" />
            </div>
          </div>
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
            <option v-if="availableUsers.length === 0" disabled>Cargando usuarios...</option>
            <option v-for="u in availableUsers" :key="u.id || u.userName" :value="u.userName || u.id">
              {{ u.userName || u.name || u.email || 'Usuario sin nombre' }}
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
              <div class="item-header">
                <div v-if="currentStep === 1" class="drag-handle" title="Arrastra para reordenar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                </div>
                <strong>{{ comp.label }}</strong>
                <span v-if="currentStep === 2" class="prop-badge">{{ comp.property }}</span>
                <button v-if="currentStep === 1" class="remove-btn" @click="removeComponent(index)">X</button>
              </div>
              
              <div v-if="currentStep === 1" class="item-config">
                <div class="config-field" v-if="comp.type === 'button'">
                  <label>Endpoint de Acción:</label>
                  <div class="endpoint-config">
                    <select v-model="comp.config.endpoint.method">
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="GET">GET</option>
                    </select>
                    <input type="text" v-model="comp.config.endpoint.backend" placeholder="Backend URL" />
                    <input type="text" v-model="comp.config.endpoint.endpoint" placeholder="Path" />
                  </div>
                </div>
                <div class="config-row" :style="getConfigRowStyle(comp.column)">
                  <div class="config-field">
                    <label>Nombre:</label>
                    <input type="text" v-model="comp.label" placeholder="Ej: Información Personal" />
                  </div>
                  <div class="config-field">
                    <label>Property (Key):</label>
                    <input type="text" v-model="comp.property" placeholder="Ej: nombre, id, etc." />
                  </div>
                  <div v-if="['text', 'input', 'textarea', 'email', 'password', 'phone', 'url', 'number', 'select', 'datepicker'].includes(comp.type)" class="config-field">
                    <label>Placeholder:</label>
                    <input type="text" v-model="comp.placeholder" placeholder="Ej: Ingrese su nombre..." />
                  </div>
                  <div class="config-field">
                    <label>Ancho (Columnas):</label>
                    <div class="column-controls">
                      <button class="col-preset" :class="{ active: comp.column === 3 }" @click="comp.column = 3">25%</button>
                      <button class="col-preset" :class="{ active: comp.column === 4 }" @click="comp.column = 4">33%</button>
                      <button class="col-preset" :class="{ active: comp.column === 6 }" @click="comp.column = 6">50%</button>
                      <button class="col-preset" :class="{ active: comp.column === 12 }" @click="comp.column = 12">100%</button>
                    </div>
                  </div>
                  <div class="config-field">
                    <label>Alineación:</label>
                    <div class="column-controls">
                      <button title="Izquierda" class="col-preset" :class="{ active: comp.config.align === 'left' || !comp.config.align }" @click="comp.config.align = 'left'">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
                      </button>
                      <button title="Centro" class="col-preset" :class="{ active: comp.config.align === 'center' }" @click="comp.config.align = 'center'">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>
                      </button>
                      <button title="Derecha" class="col-preset" :class="{ active: comp.config.align === 'right' }" @click="comp.config.align = 'right'">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
                      </button>
                    </div>
                  </div>
                  <div v-if="['text', 'input', 'textarea', 'email', 'password', 'phone', 'url', 'number', 'button', 'select', 'datepicker'].includes(comp.type)" class="config-field">
                    <label>Opciones Adicionales:</label>
                    <div class="column-controls options-group">
                      <label v-if="comp.type !== 'button'" class="checkbox-label">
                        <input type="checkbox" v-model="comp.config.readonly" /> Solo Lectura
                      </label>
                      <label class="checkbox-label">
                        <input type="checkbox" v-model="comp.config.disabled" /> Deshabilitado
                      </label>
                      
                      <!-- Propiedades Dinámicas Globales (Aprendidas) -->
                      <label v-for="key in dynamicExtraKeys" :key="'dyn_'+key" class="checkbox-label">
                        <input type="checkbox" 
                          :checked="!!comp.config[key]" 
                          @change="e => comp.config[key] = (e.target as HTMLInputElement).checked" />
                        <span>{{ key }}</span>
                        <button class="remove-prop-minimal" @click="dynamicExtraKeys = dynamicExtraKeys.filter(k => k !== key)" title="Eliminar del catálogo global">×</button>
                      </label>

                      <!-- Propiedades Locales -->
                      <label v-for="key in getExtraProperties(comp.config)" :key="'loc_'+key" class="checkbox-label">
                        <input type="checkbox" v-model="comp.config[key]" v-if="typeof comp.config[key] === 'boolean'" />
                        <input type="text" v-model="comp.config[key]" v-else :placeholder="key" class="mini-input" />
                        <span>{{ key }}</span>
                        <button class="remove-prop-minimal" @click="removeCustomProperty(comp, key)">×</button>
                      </label>

                      <button class="add-prop-link" @click="addCustomProperty(comp)">+ Añadir Atributo</button>
                    </div>
                  </div>
                </div>
              </div>

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
                  </div>
                </div>
              </div>
              
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

      <div v-if="currentStep === 3" class="workspace workspace-center">
        <div class="step-content json-preview-box">
          <h3>Configuración de Orquestación</h3>
          <pre class="json-preview">{{ JSON.stringify({ metadata: moduleMetadata, consult: orchestrationConfig }, null, 2) }}</pre>
        </div>
      </div>

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

    <div v-if="showStepConfirmModal" class="modal-overlay" @click.self="showStepConfirmModal = false">
      <div class="modal-content">
        <h3>Confirmar Diseño</h3>
        <p>¿Estás seguro de continuar al Paso 2?</p>
        <div class="modal-actions">
          <button class="app-button--secondary"  @click="showStepConfirmModal = false">Seguir editando diseño 🛠️</button>
          <button class="app-button--primary" @click="goToStep2">Ir a Validaciones ➡️</button>
        </div>
      </div>
    </div>

    <div v-if="showJsonModal" class="modal-overlay" @click.self="showJsonModal = false">
      <div class="modal-content" style="position: relative;">
        <h3>JSON Generado Final</h3>
        <textarea readonly :value="generatedJson"></textarea>
        <div class="modal-actions">
          <button class="app-button--secondary" @click="copyJson">Copiar 📋</button>
          <button class="app-button--primary" @click="showConfirmGenerateModal = true" :disabled="isGenerating">
            {{ isGenerating ? 'Generando...' : 'Generar Módulo 🚀' }}
          </button>
          <button class="app-button--secondary" style="border-color: #ef4444; color: #ef4444;" @click="showJsonModal = false">Cerrar ❌</button>
        </div>
      </div>
    </div>
    <!-- Modal de Importación -->
    <div v-if="showImportModal" class="modal-overlay" @click.self="showImportModal = false">
      <div class="modal-content">
        <template v-if="importStatus === 'idle'">
          <h3>Importar Diseño desde JSON</h3>
          <p>Pega aquí el JSON generado previamente para cargarlo en el editor.</p>
          <textarea v-model="importJsonRaw" placeholder='{ "configurationUi": { "schema": [...] }, ... }'></textarea>
          <div class="modal-actions">
            <button class="app-button--secondary" @click="showImportModal = false">Cancelar ❌</button>
            <button class="app-button--primary" @click="processImportJson">Cargar Diseño 📥</button>
          </div>
        </template>

        <template v-else-if="importStatus === 'success'">
          <div class="status-view success">
            <div class="status-icon">🚀</div>
            <h3>¡Diseño Cargado!</h3>
            <p>El esquema se ha procesado correctamente.</p>
            <div class="modal-actions" style="justify-content: center; margin-top: 2rem;">
              <button class="app-button--primary" @click="closeImportModal">Ir al Diseño 🎨</button>
            </div>
          </div>
        </template>

        <template v-else-if="importStatus === 'error'">
          <div class="status-view error">
            <div class="status-icon">⚠️</div>
            <h3>Error al Importar</h3>
            <p>{{ importErrorMessage }}</p>
            <div class="modal-actions" style="justify-content: center; margin-top: 2rem;">
              <button class="app-button--secondary" @click="importStatus = 'idle'">Regresar e Intentar ⬅️</button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Modal de Instrucciones -->
    <div v-if="showHelpModal" class="modal-overlay" @click.self="showHelpModal = false">
      <div class="modal-content help-modal">
        <h3>Cómo usar el Editor Visual</h3>
        <div class="help-content">
          <div class="help-step">
            <strong>Paso 1: Maquetado</strong>
            <p>Arrastra componentes y define su ancho (25% a 100%). Puedes reordenarlos arrastrando desde el icono de la izquierda.</p>
          </div>
          <div class="help-step">
            <strong>Paso 2: Validaciones</strong>
            <p>Arrastra reglas lógicas sobre los componentes para definir campos obligatorios, correos, etc.</p>
          </div>
          <div class="help-step">
            <strong>Paso 3: Orquestación</strong>
            <p>Configura los metadatos del módulo (título, ruta /pepe, orden) y el endpoint de consulta.</p>
          </div>
        </div>
        <div class="modal-actions">
          <button class="app-button--primary" @click="showHelpModal = false">Entendido 👍</button>
        </div>
      </div>
    </div>
    <!-- Modal de Descubrimiento de Características -->
    <div v-if="showImportDiscoveryModal" class="modal-overlay">
      <div class="modal-content discovery-modal">
        <div class="discovery-header">
          <div class="discovery-icon">🔍</div>
          <h3>Nuevas opciones detectadas</h3>
        </div>
        <p>El JSON cargado contiene configuraciones que no son estándar en el editor actual. Se han mapeado automáticamente:</p>
        <ul class="discovery-list">
          <li v-for="feat in discoveredFeatures" :key="feat">
            <span class="feat-bullet">✓</span> {{ feat }}
          </li>
        </ul>
        <div class="discovery-notice">
          Estas opciones se preservarán al generar el nuevo JSON para garantizar la integridad del módulo.
        </div>
        <div class="modal-actions">
          <button class="app-button--secondary" @click="showImportDiscoveryModal = false">Cancelar</button>
          <button class="app-button--primary" @click="applyImport(pendingImportData.components, pendingImportData.raw)">
            Confirmar y Cargar Diseño
          </button>
        </div>
      </div>
    </div>
    <!-- Modal de Confirmación de Generación -->
    <div v-if="showConfirmGenerateModal" class="modal-overlay" @click.self="showConfirmGenerateModal = false">
      <div class="modal-content">
        <h3>¿Generar Módulo en el Backend?</h3>
        <p>Esta acción creará físicamente el módulo y lo asignará al usuario seleccionado. ¿Deseas continuar?</p>
        <div class="modal-actions">
          <button class="app-button--secondary" @click="showConfirmGenerateModal = false">Cancelar</button>
          <button class="app-button--primary" @click="generateModuleBackend" :disabled="isGenerating">
            {{ isGenerating ? 'Procesando...' : 'Sí, Generar Ahora 🚀' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para Añadir Atributo Personalizado -->
    <div v-if="showAddPropertyModal" class="modal-overlay" @click.self="showAddPropertyModal = false">
      <div class="modal-content status-modal">
        <div class="status-header">
          <div class="status-badge">➕</div>
          <h3>Nuevo Atributo</h3>
        </div>
        <p>Ingresa el nombre de la propiedad técnica (ej: noSubmit, hidden, logicKey):</p>
        <input type="text" v-model="newPropertyName" class="styled-input" placeholder="Nombre de la propiedad" @keyup.enter="confirmAddProperty" />
        <div class="modal-actions">
          <button class="app-button--secondary" @click="showAddPropertyModal = false">Cancelar</button>
          <button class="app-button--primary" @click="confirmAddProperty">Agregar Atributo</button>
        </div>
      </div>
    </div>

    <!-- Modal de Estado Universal (Reemplaza alert/confirm) -->
    <div v-if="statusModal.show" class="modal-overlay" @click.self="statusModal.show = false">
      <div class="modal-content status-modal" :class="statusModal.type">
        <div class="status-header">
          <div class="status-badge">{{ statusModal.type === 'confirm' ? '❓' : (statusModal.type === 'error' ? '⚠️' : '✨') }}</div>
          <h3>{{ statusModal.title }}</h3>
        </div>
        <p>{{ statusModal.message }}</p>
        <div class="modal-actions">
          <button v-if="statusModal.type === 'confirm'" class="app-button--secondary" @click="statusModal.show = false">Cancelar</button>
          <button class="app-button--primary" @click="() => { if(statusModal.onConfirm) statusModal.onConfirm(); statusModal.show = false; }">
            {{ statusModal.type === 'confirm' ? 'Sí, continuar' : 'Entendido' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ServiceLocator } from '@/lib/components/core/ServiceLocator'
import { HttpClient } from '@/services/core/http/HttpClient'
import * as sessionPersist from '@/persistence/auth/session.persistence'

const currentStep = ref(1)
const showStepConfirmModal = ref(false)
const showJsonModal = ref(false)
const showHelpModal = ref(false)
const showImportModal = ref(false)
const importJsonRaw = ref('')
const importStatus = ref<'idle' | 'success' | 'error'>('idle')
const importErrorMessage = ref('')
const generatedJson = ref('')
let itemIdCounter = 1

const statusModal = ref({
  show: false,
  title: '',
  message: '',
  type: 'info' as 'info' | 'success' | 'error' | 'confirm',
  onConfirm: null as (() => void) | null
})

const showStatus = (title: string, message: string, type: 'info' | 'success' | 'error' | 'confirm' = 'info', onConfirm?: () => void) => {
  statusModal.value = { show: true, title, message, type, onConfirm: onConfirm || null }
}

const showAddPropertyModal = ref(false)
const newPropertyName = ref('')
let targetCompForProperty: any = null

const addCustomProperty = (comp: any) => {
  targetCompForProperty = comp
  newPropertyName.value = ''
  showAddPropertyModal.value = true
}

const confirmAddProperty = () => {
  const name = newPropertyName.value.trim()
  if (name && targetCompForProperty) {
    if (!targetCompForProperty.config[name]) {
      targetCompForProperty.config[name] = true
    }
    if (!standardConfigKeys.value.includes(name) && !dynamicExtraKeys.value.includes(name)) {
      dynamicExtraKeys.value.push(name)
    }
    showAddPropertyModal.value = false
    targetCompForProperty = null
  }
}

const droppedComponents = ref<any[]>([])

const orchestrationConfig = ref({
  backend: 'http://localhost:4001',
  endpoint: '/api/v1/users/profile',
  method: 'GET'
})

const moduleMetadata = ref({
  title: 'Nuevo Módulo',
  module: 'NuevoModulo',
  path: '/nuevo-modulo',
  order: 1,
  icon: 'svg-layers',
  menu: 'General',
  orchestrationType: 'CONSULT'
})

const assignmentConfig = ref({
  user: 'all',
  role: 'Superadmin'
})

const availableUsers = ref<any[]>([])

const showImportDiscoveryModal = ref(false)
const discoveredFeatures = ref<string[]>([])
const pendingImportData = ref<any>(null)

const STORAGE_KEY = 'visual-editor-session-state'

const closeImportModal = () => {
  showImportModal.value = false
  importStatus.value = 'idle'
  importJsonRaw.value = ''
}

const processImportJson = () => {
  try {
    const raw = JSON.parse(importJsonRaw.value)
    const schema = raw.configurationUi?.schema || []
    const discovered: string[] = []
    
    // Mapeo exhaustivo de componentes y validaciones
    const newComponents = schema.map((item: any) => {
        const validations: any[] = []
        let counter = Date.now() + Math.random()

        if (item.required) {
          validations.push({ id: counter++, type: 'required', label: 'Campo Obligatorio', icon: icons.validation })
        }
        if (item.validation?.rule) {
          validations.push({ id: counter++, type: 'rule', ruleType: item.validation.rule, label: `Regla: ${item.validation.rule}`, icon: icons.validation })
        }
        if (item.validation?.pattern) {
          validations.push({ id: counter++, type: 'pattern', label: 'Regex', patternValue: item.validation.pattern, message: item.validation.message || 'Error', icon: icons.validation })
        }
        if (item.match) {
          validations.push({ id: counter++, type: 'match', label: 'Coincidir', matchProperty: item.match, icon: icons.validation })
        }

        // Detectar campos extra (ej: noSubmit, disabled, etc)
        const knownKeys = ['type', 'label', 'property', 'placeholder', 'column', 'align', 'required', 'validation', 'match', 'endpoint']
        Object.keys(item).forEach(key => {
          if (!knownKeys.includes(key) && !discovered.includes(`Propiedad: ${key}`)) {
            discovered.push(`Propiedad: ${key}`)
          }
        })

        if (!availableComponents.value.some(c => c.type === item.type) && !discovered.includes(`Tipo: ${item.type}`)) {
          discovered.push(`Tipo: ${item.type}`)
        }

        return {
            id: `item_${itemIdCounter++}`,
            type: item.type,
            label: item.label,
            property: item.property,
            placeholder: item.placeholder,
            column: item.column ? parseInt(item.column.replace('col-', '')) : 12,
            config: { ...item },
            validations: validations
        }
    })

    const metadata = raw.configurationUi?.config || {}
    if (metadata.module && !discovered.includes('Configuración de Módulo')) discovered.push('Configuración de Módulo')

    if (discovered.length > 0) {
      discoveredFeatures.value = discovered
      pendingImportData.value = { components: newComponents, raw }
      showImportDiscoveryModal.value = true
    } else {
      applyImport(newComponents, raw)
    }
  } catch (e) {
    importStatus.value = 'error'
    importErrorMessage.value = 'JSON inválido o incompatible.'
  }
}

const applyImport = (components: any[], raw: any) => {
    droppedComponents.value = components
    
    if (raw.configurationUi?.config) {
        const c = raw.configurationUi.config
        moduleMetadata.value.title = c.metadata?.title || moduleMetadata.value.title
        moduleMetadata.value.module = c.module || moduleMetadata.value.module
        moduleMetadata.value.path = c.path || moduleMetadata.value.path
        moduleMetadata.value.order = c.order || moduleMetadata.value.order
        moduleMetadata.value.menu = c.menu || moduleMetadata.value.menu
        moduleMetadata.value.icon = c.icon || moduleMetadata.value.icon
        moduleMetadata.value.orchestrationType = c.metadata?.orchestrationType || moduleMetadata.value.orchestrationType
    }

    if (raw.orchestrationDetails) {
        orchestrationConfig.value.backend = raw.orchestrationDetails.backend || orchestrationConfig.value.backend
        orchestrationConfig.value.endpoint = raw.orchestrationDetails.endpoint || orchestrationConfig.value.endpoint
    }

    if (raw.assignedUser) assignmentConfig.value.user = raw.assignedUser
    if (raw.assignedRole) assignmentConfig.value.role = raw.assignedRole

    // APRENDIZAJE DINÁMICO: Registrar nuevos componentes y propiedades
    components.forEach(comp => {
      if (!availableComponents.value.some(c => c.type === comp.type)) {
        availableComponents.value.push({
          type: comp.type,
          label: comp.type.charAt(0).toUpperCase() + comp.type.slice(1),
          icon: icons.layout
        })
      }
      
      Object.keys(comp.config || {}).forEach(key => {
        if (!standardConfigKeys.value.includes(key) && !dynamicExtraKeys.value.includes(key)) {
          dynamicExtraKeys.value.push(key)
        }
      })
    })

    currentStep.value = 1
    importStatus.value = 'success'
    showImportDiscoveryModal.value = false
}

const createComponentFromTemplate = (comp: any) => ({
  ...comp,
  config: { 
    ...(comp.config || {}), 
    align: 'left',
    endpoint: comp.type === 'button' ? { method: 'POST', backend: 'http://localhost:4001', endpoint: '' } : undefined
  },
  id: `item_${itemIdCounter++}`,
  property: comp.type === 'button' ? undefined : `field_${droppedComponents.value.length + 1}`,
  label: comp.label,
  placeholder: comp.type === 'button' ? undefined : `Ingrese ${comp.label.toLowerCase()}...`,
  column: 12,
  validations: []
})

const saveState = () => {
  const state = {
    currentStep: currentStep.value,
    droppedComponents: JSON.parse(JSON.stringify(droppedComponents.value)),
    orchestrationConfig: orchestrationConfig.value,
    assignmentConfig: assignmentConfig.value,
    moduleMetadata: moduleMetadata.value,
    availableComponents: availableComponents.value,
    standardConfigKeys: standardConfigKeys.value,
    dynamicExtraKeys: dynamicExtraKeys.value,
    itemIdCounter
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const loadState = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const state = JSON.parse(saved)
      currentStep.value = state.currentStep || 1
      droppedComponents.value = state.droppedComponents || []
      orchestrationConfig.value = state.orchestrationConfig || orchestrationConfig.value
      assignmentConfig.value = state.assignmentConfig || assignmentConfig.value
      moduleMetadata.value = state.moduleMetadata || moduleMetadata.value
      if (state.availableComponents) availableComponents.value = state.availableComponents
      if (state.standardConfigKeys) standardConfigKeys.value = state.standardConfigKeys
      if (state.dynamicExtraKeys) dynamicExtraKeys.value = state.dynamicExtraKeys
      itemIdCounter = state.itemIdCounter || 1
    } catch (e) {
      console.error(e)
    }
  }
}



const getConfigRowStyle = (column: number) => {
  if (column <= 4) return { gridTemplateColumns: '1fr' }
  if (column <= 6) return { gridTemplateColumns: 'repeat(2, 1fr)' }
  return { gridTemplateColumns: 'repeat(4, 1fr)' }
}

const standardConfigKeys = ref([
  'type', 'label', 'property', 'placeholder', 'column', 'align', 
  'required', 'validation', 'match', 'endpoint', 'readonly', 'disabled', 'separator'
])

const dynamicExtraKeys = ref<string[]>([])

const getExtraProperties = (config: any) => {
  // Solo las que están en el objeto actual pero NO son dinámicas globales ni estándar
  return Object.keys(config || {}).filter(key => 
    !standardConfigKeys.value.includes(key) && !dynamicExtraKeys.value.includes(key)
  )
}



const removeCustomProperty = (comp: any, key: string) => {
  delete comp.config[key]
}

watch([currentStep, droppedComponents, orchestrationConfig, assignmentConfig, moduleMetadata], () => {
  saveState()
}, { deep: true })

const fetchUsersForAssignment = async () => {
  try {
    const session = sessionPersist.loadSession()
    if (session?.token) {
      const http = new HttpClient(import.meta.env.VITE_AUTH_API_BASE_URL ?? 'http://localhost:4001')
      const { data, status } = await http.get<any>('/api/v1/users/mentions/all', {
        Authorization: `Bearer ${session.token}`
      })
      if (status >= 200 && status < 300) {
        const users = Array.isArray(data) ? data : (data.data || [])
        availableUsers.value = users
        console.log(`[VisualEditor] ${users.length} usuarios cargados para asignación.`)
      }
    }
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

onMounted(() => {
  loadState()
  fetchUsersForAssignment()
})

const getMockProps = (comp: any) => {
  const base: any = { 
    label: comp.label,
    placeholder: comp.placeholder,
    ...comp.config
  }
  if (['select', 'radio', 'checkbox'].includes(comp.type)) {
    base.options = [{ id: '1', label: 'Opción A' }, { id: '2', label: 'Opción B' }]
  } else if (comp.type === 'table') {
    base.columns = [{ label: 'ID', key: 'id' }, { label: 'Nombre', key: 'name' }]
    base.modelValue = [{ id: '1', name: 'Ejemplo' }]
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

const availableComponents = ref([
  { type: 'title', label: 'Título', icon: icons.text },
  { type: 'text', label: 'Texto Corto', icon: icons.text },
  { type: 'textarea', label: 'Texto Largo', icon: icons.text },
  { type: 'email', label: 'Email', icon: icons.text },
  { type: 'password', label: 'Contraseña', icon: icons.text },
  { type: 'phone', label: 'Teléfono', icon: icons.text },
  { type: 'number', label: 'Número', icon: icons.number },
  { type: 'select', label: 'Selector', icon: icons.select },
  { type: 'checkbox', label: 'Checkbox', icon: icons.checkbox },
  { type: 'datepicker', label: 'Fecha', icon: icons.calendar },
  { type: 'button', label: 'Botón de Acción', icon: icons.layout },
  { type: 'table', label: 'Tabla Premium', icon: icons.table },
])

const availableValidations = [
  { type: 'required', label: 'Campo Obligatorio', icon: icons.validation },
  { type: 'rule', ruleType: 'email', label: 'Formato Email', icon: icons.validation },
  { type: 'rule', ruleType: 'password', label: 'Contraseña Segura', icon: icons.validation },
  { type: 'pattern', label: 'Regex Personalizado', icon: icons.validation },
  { type: 'match', label: 'Coincidir con campo', icon: icons.validation },
]

const onDragStart = (event: DragEvent, comp: any) => {
  event.dataTransfer?.setData('component', JSON.stringify(comp))
}

const onDragItemStart = (event: DragEvent, index: number) => {
  event.dataTransfer?.setData('reorder-index', String(index))
}

const onDrop = (event: DragEvent, targetIndex?: number) => {
  if (currentStep.value !== 1) return
  const compData = event.dataTransfer?.getData('component')
  const reorderIndex = event.dataTransfer?.getData('reorder-index')

  if (compData) {
    const newComp = createComponentFromTemplate(JSON.parse(compData))
    if (typeof targetIndex === 'number') {
      droppedComponents.value.splice(targetIndex, 0, newComp)
    } else {
      droppedComponents.value.push(newComp)
    }
  } else if (reorderIndex !== undefined && reorderIndex !== '') {
    const fromIndex = parseInt(reorderIndex, 10)
    let toIndex = typeof targetIndex === 'number' ? targetIndex : droppedComponents.value.length
    const [movedItem] = droppedComponents.value.splice(fromIndex, 1)
    droppedComponents.value.splice(toIndex, 0, movedItem)
  }
}

const onValidationDragStart = (event: DragEvent, val: any) => {
  event.dataTransfer?.setData('validation', JSON.stringify(val))
}

const onDropValidation = (event: DragEvent, compIndex: number) => {
  const data = event.dataTransfer?.getData('validation')
  if (data) {
    const val = JSON.parse(data)
    const newVal = { ...val, id: Date.now() }
    if (val.type === 'pattern') { newVal.patternValue = ''; newVal.message = 'Error' }
    else if (val.type === 'match') { newVal.matchProperty = '' }
    droppedComponents.value[compIndex].validations.push(newVal)
  }
}

const removeComponent = (index: number) => {
  droppedComponents.value.splice(index, 1)
}

const generateJSON = () => {
  const schema = droppedComponents.value.map((comp) => {
    const fieldSchema: any = {
      type: comp.type,
      label: comp.label,
      column: `col-${comp.column}`,
      ...comp.config,
      align: comp.config.align || 'left'
    }

    // Limpieza de campos que no van en la raíz
    delete fieldSchema.endpoint

    if (comp.type !== 'button') {
      fieldSchema.property = comp.property
      fieldSchema.placeholder = comp.placeholder || `Ingrese ${comp.label.toLowerCase()}...`
    } else if (comp.config.endpoint) {
      fieldSchema.endpoint = {
        ...comp.config.endpoint,
        uri: "{backend}/{endpoint}"
      }
    }

    let validationObj: any = null
    comp.validations.forEach((val: any) => {
      if (val.type === 'required') fieldSchema.required = true
      else if (val.type === 'rule') { if (!validationObj) validationObj = {}; validationObj.rule = val.ruleType }
      else if (val.type === 'pattern') { if (!validationObj) validationObj = {}; validationObj.pattern = val.patternValue; validationObj.message = val.message }
      else if (val.type === 'match') fieldSchema.match = val.matchProperty
    })
    if (validationObj) fieldSchema.validation = validationObj
    
    return fieldSchema
  })

  const output = {
    assignedUser: assignmentConfig.value.user,
    assignedRole: assignmentConfig.value.role,
    configurationUi: {
      config: {
        metadata: {
          orchestrationType: moduleMetadata.value.orchestrationType,
          title: moduleMetadata.value.title
        },
        module: moduleMetadata.value.module,
        path: moduleMetadata.value.path,
        method: "GET",
        order: moduleMetadata.value.order,
        menu: moduleMetadata.value.menu,
        icon: moduleMetadata.value.icon,
        breadcrumb: [{ label: 'Dashboard', path: '/dashboard' }]
      },
      schema: schema
    },
    orchestrationDetails: {
      [moduleMetadata.value.orchestrationType.toLowerCase()]: {
        ...orchestrationConfig.value,
        uri: "{backend}/{endpoint}",
        method: moduleMetadata.value.orchestrationType === 'CONSULT' ? 'GET' : 'POST'
      }
    }
  }

  generatedJson.value = JSON.stringify(output, null, 2)
  showJsonModal.value = true
}

const isGenerating = ref(false)
const showConfirmGenerateModal = ref(false)

const generateModuleBackend = async () => {
  try {
    isGenerating.value = true
    const session = sessionPersist.loadSession()
    if (!session?.token) throw new Error('Sesión no válida')

    const payload = JSON.parse(generatedJson.value)
    const http = new HttpClient(import.meta.env.VITE_MODULES_API_BASE_URL ?? 'http://localhost:4002')
    
    const { data, status } = await http.post<any>('/api/v1/module/generate', payload, {
      Authorization: `Bearer ${session.token}`
    })

    if (status >= 200 && status < 300) {
      showStatus('¡Éxito! 🚀', 'Módulo generado y asignado correctamente.', 'success')
      showJsonModal.value = false
      showConfirmGenerateModal.value = false
      clearEditor()
    } else {
      throw new Error(data?.message || 'Error en la generación')
    }
  } catch (error: any) {
    showStatus('Error ⚠️', error.message, 'error')
  } finally {
    isGenerating.value = false
  }
}

const copyJson = () => {
  navigator.clipboard.writeText(generatedJson.value)
  showStatus('Copiado 📋', 'El JSON se ha copiado al portapapeles.', 'info')
}

const clearEditor = () => {
  showStatus('¿Limpiar Editor? 🗑️', '¿Estás seguro de que quieres borrar todo el diseño actual?', 'confirm', () => {
    droppedComponents.value = []
    currentStep.value = 1
    saveState()
  })
}

const goToStep2 = () => { showStepConfirmModal.value = false; currentStep.value = 2 }
const goToStep4 = async () => { currentStep.value = 4; await fetchUsersForAssignment() }
const removeValidation = (c: number, v: number) => { droppedComponents.value[c].validations.splice(v, 1) }
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

.header-actions, .step-actions {
  display: flex;
  gap: 1rem;
}

.app-button--primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--primary-color, #465FFF);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}
.app-button--primary:disabled { background-color: #cbd5e1; cursor: not-allowed; opacity: 0.7; }
.app-button--primary:hover:not(:disabled) { opacity: 0.9; }

.app-button--secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: white;
  color: var(--primary-color, #465FFF);
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  border: 1.5px solid var(--primary-color, #465FFF);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.app-button--secondary:hover { 
  background-color: rgba(70, 95, 255, 0.05);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(70, 95, 255, 0.1);
}

.editor-layout {
  display: flex;
  gap: 2rem;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 320px;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar h3 {
  margin-top: 0;
  color: var(--secondary-color, #1D2939);
  font-size: 1.1rem;
}

.components-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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

/* Responsividad de la Grilla de Diseño */
@media (max-width: 1024px) {
  .col-3, .col-4 { grid-column: span 6 / span 6; } /* 2 por línea en tablets */
}

@media (max-width: 640px) {
  .col-3, .col-4, .col-6 { grid-column: span 12 / span 12; } /* 1 por línea en móviles */
}

.sidebar-help {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.orchestration-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.orchestration-section h4 {
  margin: 0 0 1.25rem 0;
  font-size: 0.85rem;
  color: var(--primary-color, #465FFF);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  border-bottom: 2px solid rgba(70, 95, 255, 0.1);
  padding-bottom: 0.5rem;
}

.config-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--secondary-color, #1D2939);
}

.sidebar-orchestration input, 
.sidebar-orchestration select {
  width: 100%;
  padding: 0.75rem;
  border: 1.5px solid #E4E7EC;
  border-radius: 8px;
  background: white;
  color: #1D2939;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.sidebar-orchestration input:focus,
.sidebar-orchestration select:focus {
  border-color: var(--primary-color, #465FFF);
  box-shadow: 0 0 0 4px rgba(70, 95, 255, 0.1);
  outline: none;
}

.sidebar-orchestration label {
  color: #475467;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  display: block;
}

.json-preview {
  background: #1e293b;
  color: #94a3b8;
  padding: 2rem;
  border-radius: 12px;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.1);
  min-height: 450px;
  border: 1px solid #e2e8f0;
  overflow: auto;
  margin: 0;
}

.json-preview span { color: #38bdf8; } /* Color para las llaves/propiedades si hiciéramos resaltado */

.workspace-center {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem !important;
  background: #f1f5f9 !important;
}

.json-preview-box {
  width: 100%;
  max-width: 1000px;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.04);
  border: 1px solid #E4E7EC;
}

.json-preview-box h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  color: #1D2939;
  font-weight: 700;
  background: transparent !important;
  padding: 0 !important;
}

.status-modal {
  max-width: 450px;
  text-align: center;
}
.status-header {
  margin-bottom: 1.5rem;
}
.status-badge {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.status-modal.confirm { border-top: 4px solid var(--primary-color); }
.status-modal.error { border-top: 4px solid #ef4444; }
.status-modal.success { border-top: 4px solid #10b981; }

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.dropped-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
  position: relative;
}

.preview-item {
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  background: transparent !important;
}

.preview-item .item-preview {
  background: white;
  border: 1px solid #E4E7EC;
  border-radius: 12px;
  padding: 1.5rem;
  pointer-events: auto;
}

.step-4-workspace {
  border: none !important;
  background: #f8fafc !important;
  padding: 2rem !important;
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
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem 1rem;
  align-items: start;
}

.config-field {
  width: 100%;
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

.endpoint-config {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.endpoint-config select, .endpoint-config input {
  font-size: 0.8rem;
  padding: 0.4rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
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

/* Estilos para el estado de importación */
.status-view {
  text-align: center;
  padding: 1rem;
}
.status-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}
.status-view.success h3 {
  color: #10b981;
}
.status-view.error h3 {
  color: #ef4444;
}
.status-view p {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 1.5rem;
}

/* Modal de Confirmación Interno */
.confirm-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 12px;
}
.confirm-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 400px;
}
.confirm-card h4 { color: var(--primary-color); margin-bottom: 1rem; }
.confirm-card p { font-size: 0.9rem; color: #64748b; margin-bottom: 1.5rem; }
.sidebar-orchestration input, 
.sidebar-orchestration select,
.sidebar-assignment select,
.styled-input,
.styled-select {
  width: 100%;
  padding: 0.75rem;
  border: 1.5px solid #E4E7EC;
  border-radius: 8px;
  background: white;
  color: #1D2939;
  font-size: 0.9rem;
  transition: all 0.2s;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23667085'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
}

.sidebar-orchestration input:focus,
.sidebar-orchestration select:focus,
.sidebar-assignment select:focus,
.styled-input:focus,
.styled-select:focus {
  border-color: var(--primary-color, #465FFF);
  box-shadow: 0 0 0 4px rgba(70, 95, 255, 0.1);
}

.sidebar-orchestration input:not(select),
.styled-input:not(select) {
  background-image: none;
}

.sidebar-assignment label {
  color: #475467;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  display: block;
}
.confirm-actions { display: flex; gap: 1rem; justify-content: center; }

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--primary-color, #465FFF);
  cursor: pointer;
  white-space: nowrap;
}
.checkbox-label input {
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: var(--primary-color, #465FFF);
}
.options-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  width: 100%;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.remove-prop-minimal {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0 4px;
  line-height: 1;
  margin-left: -2px;
  transition: color 0.2s;
}
.remove-prop-minimal:hover {
  color: #ef4444;
}

.add-prop-link {
  background: none;
  border: none;
  color: var(--primary-color, #465FFF);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.add-prop-link:hover {
  opacity: 0.8;
}
.discovery-modal {
  border-top: 4px solid #10b981;
}
.discovery-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.discovery-icon {
  font-size: 2rem;
}
.discovery-list {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
  background: #f0fdf4;
  border-radius: 8px;
  padding: 1rem;
}
.discovery-list li {
  padding: 0.5rem 0;
  color: #166534;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.feat-bullet {
  color: #10b981;
  font-weight: bold;
}
.discovery-notice {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 1.5rem;
  font-style: italic;
}
</style>

<style scoped>
@media (max-width: 1200px) {
  .config-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .editor-layout {
    flex-direction: column;
    overflow-y: auto;
  }
  .sidebar {
    width: 100%;
    max-height: 300px;
  }
  .config-row {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  .column-controls {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    width: 100%;
  }
  .col-preset {
    padding: 0.5rem;
    text-align: center;
  }
  .options-group {
    grid-template-columns: 1fr !important;
    display: grid !important;
    gap: 0.75rem !important;
  }
}

@media (max-width: 480px) {
  .column-controls {
    grid-template-columns: 1fr;
  }
}
</style>
