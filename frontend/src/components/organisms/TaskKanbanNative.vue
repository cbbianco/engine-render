<!-- 
  Architecture: Solutions Team
  Methodology: AI Driven Development (AIDD)
  Component: UI Metadata Render - Kanban Native View
-->
<template>
  <div class="kanban-outer-premium">
    <div class="kanban-wrapper">
      <!-- Premium Board Actions -->
      <div class="kanban-actions-row">
        <div class="flex items-center gap-3">
          <button class="btn-kanban btn-kanban--secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 3H2l8 9v6l4 3v-9l8-9z"></path></svg>
            Filtrar
          </button>
          <button class="btn-kanban btn-kanban--primary" @click="showModal = true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Nueva Tarea
          </button>
        </div>
      </div>

      <!-- Premium Board -->
      <div class="kanban-board-scroll">
        <div class="kanban-board-grid">
        <div 
          v-for="column in columns" 
          :key="column.id" 
          class="kanban-column-premium"
          :class="{ 'accordion-open': activeAccordion === column.id || !isMobile }"
        >
          <div class="column-header-premium" @click="toggleAccordion(column.id)">
            <div class="flex items-center gap-3">
              <span class="column-dot" :class="column.color"></span>
              <h3 class="column-name">{{ column.label }}</h3>
              <span class="column-badge">{{ getTasksByStatus(column.id).length }}</span>
            </div>
            
            <div class="column-header-actions" @click.stop>
              <!-- 3 Dots Menu Trigger -->
              <div class="column-menu-wrapper">
                <button 
                  class="column-more-btn" 
                  @click="toggleColumnMenu(column.id)"
                  :class="{ 'active': activeColumnMenu === column.id }"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                </button>

                <!-- Premium Dropdown Menu -->
                <div v-if="activeColumnMenu === column.id" class="column-dropdown-premium">
                  <button @click="handleColumnAction('edit', column.id)" class="dropdown-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    Edit
                  </button>
                  <button @click="handleColumnAction('delete', column.id)" class="dropdown-item text-danger">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Delete
                  </button>
                  <div class="dropdown-divider"></div>
                  <button @click="handleColumnAction('clear', column.id)" class="dropdown-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
                    Clear All
                  </button>
                </div>
              </div>

              <!-- Accordion Arrow (Mobile Only) -->
              <svg v-if="isMobile" class="accordion-icon" :class="{ 'rotate-180': activeAccordion === column.id }" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>

          <!-- Column Content (Draggable and Add button) -->
          <div class="column-content-wrapper" v-show="activeAccordion === column.id || !isMobile">
              <draggable
                :list="tasksByStatus[column.id]"
                group="tasks"
                item-key="id"
                class="column-drop-zone"
                ghost-class="task-ghost"
                drag-class="task-dragging"
                @change="(evt: any) => handleDragChange(evt, column.id)"
              >
                <template #item="{ element: task }">
                  <div class="task-card-premium" @click="openTaskDetail(task)">
                    <div v-if="task.tags?.length" class="task-card__tags">
                      <span 
                        v-for="tag in task.tags" 
                        :key="tag.label" 
                        :class="['card-tag', tag.color]"
                      >
                        {{ tag.label }}
                      </span>
                    </div>

                    <h3 class="task-card__title">{{ task.title }}</h3>
                    <p v-if="task.description" class="task-card__description">{{ task.description }}</p>

                    <div v-if="task.image" class="task-card__image">
                      <img :src="task.image" :alt="task.title" />
                    </div>

                    <div class="task-card__footer">
                      <div class="card-meta">
                        <div v-if="task.dueDate" class="meta-icon-text">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" ry="2"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          {{ task.dueDate }}
                        </div>
                        <div class="meta-icon-text">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                          {{ task.comments || 0 }}
                        </div>
                      </div>
                      
                      <div class="card-assignees">
                        <div 
                          v-for="(assignee, idx) in task.assignees" 
                          :key="idx" 
                          class="card-avatar"
                          :style="{ zIndex: 10 - Number(idx) }"
                        >
                          <img v-if="assignee.avatar" :src="assignee.avatar" :alt="assignee.name" />
                          <div v-else class="avatar-text">{{ assignee.name[0] }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                
                <template #header>
                  <div v-if="!tasksByStatus[column.id]?.length" class="empty-column-message">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>No hay tareas</span>
                  </div>
                </template>
              </draggable>
              
              <button class="column-add-task-btn" @click="openModalWithStatus(column.id)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Añadir Tarea
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Overlay Components -->
      <Teleport to="body">
        <div v-if="showModal" class="modal-overlay-premium" @click.self="showModal = false">
          <div class="modal-content-premium">
            <!-- Modal existing content... -->
            <div class="modal-header-premium">
              <h2 class="modal-title-text">Crear Nueva Tarea</h2>
              <button @click="showModal = false" class="modal-close-btn">&times;</button>
            </div>
            <form @submit.prevent="handleSubmit" class="modal-form-body">
              <div class="form-group-premium">
                <label class="pkg-label">Título de la Tarea</label>
                <input v-model="newTask.title" placeholder="¿Qué hay que hacer?" required class="pkg-input" />
              </div>
              
              <div class="form-row-premium">
                <div class="form-group-premium">
                  <label class="pkg-label">Fecha Límite</label>
                  <input v-model="newTask.dueDate" type="date" class="pkg-input" />
                </div>
                <div class="form-group-premium">
                  <label class="pkg-label">Estado</label>
                  <select v-model="newTask.status" class="pkg-input">
                    <option v-for="col in columns" :key="col.id" :value="col.id">{{ col.label }}</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group-premium">
                <label class="pkg-label">Descripción</label>
                <textarea v-model="newTask.description" rows="3" class="pkg-input" placeholder="Detalles adicionales..."></textarea>
              </div>
              
              <div class="modal-footer-premium">
                <button type="button" @click="showModal = false" class="btn-pkg-secondary">Cancelar</button>
                <button type="submit" class="btn-pkg-primary">Crear Tarea</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Scroll to Top Button -->
        <Transition name="fade">
          <button 
            v-if="showScrollTop" 
            @click="scrollToTop" 
            class="scroll-to-top-btn"
            title="Volver Arriba"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import draggable from 'vuedraggable'
import demoTasks from '../../../tmp/kanban-demo.json'

const props = defineProps<{
  modelValue?: any
  config?: any
  type?: string
}>()

const emit = defineEmits(['update:modelValue', 'action'])

const showModal = ref(false)
const columns = [
  { id: 'todo', label: 'To Do', color: 'bg-blue-500' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-amber-500' },
  { id: 'completed', label: 'Completed', color: 'bg-emerald-500' }
]

// Estado para el acordeón responsive (solo móvil)
const activeAccordion = ref<string | null>(columns[0]?.id || null)
const isMobile = ref(false)
const activeColumnMenu = ref<string | null>(null)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

function toggleColumnMenu(columnId: string) {
  activeColumnMenu.value = activeColumnMenu.value === columnId ? null : columnId
}

function handleColumnAction(action: string, columnId: string) {
  if (action === 'clear') {
    tasks.value = tasks.value.filter(t => t.status !== columnId)
    syncInternalLists()
  }
  // Otras acciones...
  activeColumnMenu.value = null
}

// Cerrar menú al hacer clic fuera
function handleClickOutside(e: MouseEvent) {
  if (activeColumnMenu.value && !(e.target as HTMLElement).closest('.column-menu-wrapper')) {
    activeColumnMenu.value = null
  }
}

const showScrollTop = ref(false)

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleScroll() {
  showScrollTop.value = window.scrollY > 400
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('mousedown', handleClickOutside)
})

import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('mousedown', handleClickOutside)
})

function toggleAccordion(columnId: string) {
  if (isMobile.value) {
    activeAccordion.value = activeAccordion.value === columnId ? null : columnId
  }
}

// Datos iniciales reactivos: Preferir modelValue, si no hay usar demoTasks
const tasks = ref<any[]>(props.modelValue?.tasks?.length > 0 
  ? props.modelValue.tasks 
  : demoTasks
)

// Mapeo dinámico para vuedraggable
const tasksByStatus = reactive<Record<string, any[]>>({
  todo: [],
  'in-progress': [],
  completed: []
})

// Sincronizar listas internas con el estado global
function syncInternalLists() {
  columns.forEach(col => {
    tasksByStatus[col.id] = tasks.value.filter((t: any) => t.status === col.id)
  })
}

syncInternalLists()

function getTasksByStatus(status: string) {
  return tasksByStatus[status] || []
}

function handleDragChange(evt: any, status: string) {
  if (evt.added?.element) {
    const task = evt.added.element
    task.status = status
    updateGlobalState()
  }
}

function updateGlobalState() {
  const allTasks = [
    ...(tasksByStatus.todo || []),
    ...(tasksByStatus['in-progress'] || []),
    ...(tasksByStatus.completed || [])
  ]
  tasks.value = allTasks
  emit('update:modelValue', { ...props.modelValue, tasks: allTasks })
}

const newTask = reactive({ title: '', dueDate: '', status: 'todo', description: '' })

function openModalWithStatus(status: string) {
  newTask.status = status
  showModal.value = true
}

function handleSubmit() {
  const task = {
    id: Date.now(),
    ...newTask,
    comments: 0,
    assignees: [{ name: 'Admin', avatar: 'https://i.pravatar.cc/150?u=admin' }]
  }
  const targetColumn = tasksByStatus[task.status]
  if (targetColumn) {
    targetColumn.push(task)
  }
  updateGlobalState()
  showModal.value = false
  newTask.title = ''; newTask.dueDate = ''; newTask.description = '';
}

function openTaskDetail(task: any) {
  emit('action', { type: 'view-task', payload: task })
}
</script>

<style scoped>
.kanban-outer-premium {
  width: 100%;
  min-height: calc(100vh - 120px);
  padding: 1.5rem;
  background-color: #F1F5F9;
  font-family: 'Inter', sans-serif;
}

.kanban-wrapper { max-width: 1600px; margin: 0 auto; }

/* Actions Bar (Pinned to Right) */
.kanban-actions-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}

.btn-kanban {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-kanban--primary { background: var(--primary-color); color: white; border: none; box-shadow: 0 4px 6px -1px var(--primary-bg-light, rgba(70, 95, 255, 0.2)); }
.btn-kanban--primary:hover { background: #3144c1; transform: translateY(-1px); }
.btn-kanban--secondary { background: white; color: #1C2434; border: 1.5px solid #E2E8F0; }
.btn-kanban--secondary:hover { background: #F8FAFC; border-color: var(--primary-color); color: var(--primary-color); }

/* Kanban Columns & Grid */
.kanban-board-scroll { overflow-x: auto; padding-bottom: 2rem; }
.kanban-board-grid { display: flex; gap: 1.5rem; min-width: 1000px; align-items: flex-start; }

.kanban-column-premium {
  flex: 1;
  background: transparent;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.column-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding: 0.5rem 0;
}

.column-dot { width: 10px; height: 10px; border-radius: 50%; }
.column-name { font-size: 1.1rem; font-weight: 700; color: #1C2434; }
.column-badge { background: #E2E8F0; color: #64748B; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 99px; }

.column-header-actions { display: flex; align-items: center; gap: 0.5rem; position: relative; }

/* Column Dropdown Menu */
.column-menu-wrapper { position: relative; }
.column-more-btn { 
  background: transparent; border: none; color: #64748B; cursor: pointer; 
  border-radius: 6px; padding: 6px; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.column-more-btn:hover, .column-more-btn.active { background: #E2E8F0; color: #1C2434; }

.column-dropdown-premium {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  width: 160px;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  z-index: 1000;
  padding: 0.5rem;
  animation: dropdownFade 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dropdownFade {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748B;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-item svg { color: #94A3B8; }
.dropdown-item:hover { background: #F1F5F9; color: #1C2434; }
.dropdown-item:hover svg { color: var(--primary-color); }

.dropdown-item.text-danger:hover { color: #D34053; background: #FFF5F5; }
.dropdown-item.text-danger:hover svg { color: #D34053; }

.dropdown-divider { height: 1px; background: #F1F5F9; margin: 0.4rem 0.2rem; }

.accordion-icon { display: none; color: #64748B; transition: transform 0.3s ease; }

/* Cards & Draggable */
.column-drop-zone { min-height: 250px; display: flex; flex-direction: column; gap: 1.25rem; }

.task-card-premium {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1.5px solid transparent;
  cursor: grab;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.task-card-premium:hover { border-color: var(--primary-color); transform: translateY(-3px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1); }
.task-card-premium:active { cursor: grabbing; scale: 0.98; }

.task-ghost { opacity: 0.2; background: var(--primary-color) !important; border: 2px dashed var(--primary-color) !important; }
.task-dragging { transform: rotate(1.5deg); scale: 1.03; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15) !important; z-index: 100; }

.task-card__title { font-size: 1rem; font-weight: 700; color: #1C2434; margin-bottom: 0.5rem; line-height: 1.4; }
.task-card__description { font-size: 0.875rem; color: #64748B; line-height: 1.5; margin-bottom: 1.25rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.task-card__image { border-radius: 10px; overflow: hidden; margin: 1.25rem 0; border: 1px solid #F1F5F9; }
.task-card__image img { width: 100%; height: 160px; object-fit: cover; }

.task-card__footer { display: flex; justify-content: space-between; align-items: center; border-top: 1.5px solid #F1F5F9; pt: 1rem; }
.card-meta { display: flex; gap: 1rem; }
.meta-icon-text { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: #64748B; font-weight: 600; }

.card-assignees { display: flex; }
.card-avatar { width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid white; margin-left: -10px; background: #E2E8F0; overflow: hidden; }
.card-avatar:first-child { margin-left: 0; }
.card-avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar-text { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #1C2434; font-size: 11px; font-weight: 700; }

/* Modal Premium (Fixed) */
.modal-overlay-premium { position: fixed; inset: 0; background: rgba(28, 36, 52, 0.6); backdrop-filter: blur(8px); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
.modal-content-premium { background: white; width: 100%; max-width: 550px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; border: 1px solid #E2E8F0; }

.modal-header-premium { padding: 1.25rem 2rem; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; }
.modal-title-text { font-size: 1.25rem; font-weight: 800; color: #1C2434; }
.modal-close-btn { font-size: 2rem; color: #64748B; border: none; background: transparent; cursor: pointer; transition: color 0.2s; }
.modal-close-btn:hover { color: #1C2434; }

.modal-form-body { padding: 2rem; display: flex; flex-direction: column; gap: 1.75rem; }
.form-group-premium { display: flex; flex-direction: column; gap: 0.6rem; }
.form-row-premium { display: grid; grid-template-cols: 1fr 1fr; gap: 1.5rem; }

.pkg-label { display: block; font-size: 0.875rem; font-weight: 700; color: #1C2434; }
.pkg-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  outline: none;
  font-size: 0.95rem;
  color: #1C2434;
  background: white;
  transition: all 0.2s;
}
.pkg-input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 4px var(--primary-bg-light, rgba(70, 95, 255, 0.1)); }
textarea.pkg-input { resize: vertical; min-height: 100px; }

.modal-footer-premium { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 0.5rem; pt: 1rem; border-top: 1px solid #F1F5F9; }
.btn-pkg-primary { background: var(--primary-color); color: white; padding: 0.75rem 2rem; border-radius: 10px; border: none; font-weight: 700; cursor: pointer; transition: background 0.2s; }
.btn-pkg-primary:hover { background: #3144c1; }
.btn-pkg-secondary { background: white; color: #64748B; border: 1.5px solid #E2E8F0; padding: 0.75rem 2rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
.btn-pkg-secondary:hover { background: #F8FAFC; }

.column-add-task-btn {
  margin-top: 1rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem;
  background: white;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  color: var(--primary-color); /* Premium Blue */
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.column-add-task-btn:hover { 
  background: #F1F5F9; 
  border-color: var(--primary-color); 
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(60, 80, 224, 0.15);
}

/* Scroll to Top Button */
.scroll-to-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(60, 80, 224, 0.4);
  z-index: 99999;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scroll-to-top-btn:hover {
  background: #3144c1;
  transform: scale(1.1) translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(60, 80, 224, 0.5);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Responsive Accordion Mode (Mobile) */
@media (max-width: 767px) {
  .kanban-outer-premium { padding: 1rem; }
  .kanban-actions-row { margin-bottom: 1.5rem; justify-content: center; }
  
  .kanban-board-grid { flex-direction: column; min-width: 100%; gap: 0.75rem; }
  .kanban-column-premium {
    background: white;
    border-radius: 12px;
    border: 1px solid #E2E8F0;
    overflow: hidden;
  }
  
  .column-header-premium {
    padding: 1.25rem;
    margin-bottom: 0;
    cursor: pointer;
    background: #F8FAFC;
    user-select: none;
  }
  
  .column-header-premium:hover { background: #F1F5F9; }
  .accordion-icon { display: block; }
  .column-badge { background: var(--primary-color); color: white; }
  
  .column-content-wrapper { padding: 1.25rem; border-top: 1px solid #F1F5F9; }
  .column-drop-zone { min-height: 100px; }
  
  .form-row-premium { grid-template-cols: 1fr; }
  .modal-content-premium { margin: 0; max-height: 90vh; overflow-y: auto; }
  
  .scroll-to-top-btn { bottom: 1.5rem; right: 1.5rem; width: 44px; height: 44px; }
}

/* Helpers */
.bg-blue-500 { background-color: var(--primary-color); }
.bg-amber-500 { background-color: #F59E0B; }
.bg-emerald-500 { background-color: #10B981; }
.flex { display: flex; }
.items-center { align-items: center; }
.gap-3 { gap: 0.75rem; }
.empty-column-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: #94A3B8;
  gap: 0.75rem;
  border: 2px dashed #E2E8F0;
  border-radius: 0.75rem;
}
</style>
