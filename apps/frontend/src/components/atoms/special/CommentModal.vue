<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="handleCancel">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-icon" :class="{ 'has-comment': !!initialComment }">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-10.6 8.5 8.5 0 0 1 7.6 10.6L21 15v-3.5z"></path>
            </svg>
          </div>
          <div class="header-content">
            <h3 class="modal-title">{{ initialComment ? 'Editar Comentario' : 'Añadir Comentario' }}</h3>
            <p class="modal-subtitle">Puedes taguear a alguien usando @usuario</p>
          </div>
          <button class="close-btn" @click="handleCancel">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="#667085" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <div class="comment-input-wrapper">
            <textarea 
              ref="textareaRef"
              v-model="comment" 
              class="comment-textarea" 
              placeholder="Escribe un comentario... Ej: Hola @admin"
              rows="4"
              @input="handleInput"
              @keydown="handleKeyDown"
            ></textarea>

            <!-- Mentions Dropdown -->
            <div v-if="showMentions" class="mentions-dropdown" :style="dropdownStyle">
              <div 
                v-for="(user, idx) in suggestions" 
                :key="user.id"
                :class="['mention-item', { active: idx === activeIndex }]"
                @click="selectUser(user)"
              >
                <div class="mention-avatar">{{ user.userName[0].toUpperCase() }}</div>
                <div class="mention-info">
                  <span class="mention-name">{{ user.firstName }} {{ user.lastName }}</span>
                  <span class="mention-username">@{{ user.userName }}</span>
                </div>
              </div>
              <div v-if="suggestions.length === 0" class="mention-empty">
                No se encontraron usuarios
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn btn--secondary" @click="handleCancel" :disabled="loading">
            Cancelar
          </button>
          <button class="btn btn--primary" @click="handleConfirm" :disabled="loading || !comment.trim()">
            <span v-if="loading" class="btn-spinner"></span>
            {{ initialComment ? 'Actualizar' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { rendererService } from '@/services/renderer/RendererService'

const props = defineProps<{
  show: boolean
  initialComment?: string
  loading?: boolean
  availableUsers?: any[] // Lista de usuarios para búsqueda local
}>()

const emit = defineEmits(['confirm', 'cancel'])

const comment = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// Mentions State
const showMentions = ref(false)
const suggestions = ref<any[]>([])
const activeIndex = ref(0)
const mentionQuery = ref('')
const dropdownStyle = ref({ top: '0px', left: '0px' })
const taggedUsers = ref<any[]>([])

const allUsersForMentions = ref<any[]>([])

watch(() => props.show, async (isShowing) => {
  if (isShowing) {
    comment.value = props.initialComment || ''
    showMentions.value = false
    taggedUsers.value = []
    
    // Carga de todos los usuarios del sistema para el tagueo global
    if (allUsersForMentions.value.length === 0) {
      allUsersForMentions.value = await rendererService.getAllUsersForMentions()
    }
  }
})

async function handleInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  const value = target.value
  const cursor = target.selectionStart

  const lastAt = value.lastIndexOf('@', cursor - 1)
  
  if (lastAt !== -1) {
    const query = value.substring(lastAt + 1, cursor).toLowerCase()
    if (!query.includes(' ')) {
      mentionQuery.value = query
      showMentions.value = true
      activeIndex.value = 0
      
      // Búsqueda en la lista global de usuarios (Paso 2 solicitado)
      const queryLower = query.toLowerCase()
      suggestions.value = allUsersForMentions.value.filter(u => 
        u.userName?.toLowerCase().includes(queryLower)
      ).slice(0, 10) // Mostrar máximo 10
      
      updateDropdownPosition(target)
      return
    }
  }
  
  showMentions.value = false
}

function updateDropdownPosition(textarea: HTMLTextAreaElement) {
  // Una forma simple de posicionar el dropdown cerca del cursor
  // Para una precisión real se necesitaría una librería de posicionamiento de careta
  const lines = textarea.value.substr(0, textarea.selectionStart).split('\n')
  const lineCount = lines.length
  const lastLine = lines[lineCount - 1]
  
  dropdownStyle.value = {
    top: `${lineCount * 24 + 10}px`,
    left: `${Math.min(lastLine.length * 8 + 20, 300)}px`
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (!showMentions.value) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % suggestions.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + suggestions.value.length) % suggestions.value.length
  } else if (e.key === 'Enter' || e.key === 'Tab') {
    if (suggestions.value.length > 0) {
      e.preventDefault()
      selectUser(suggestions.value[activeIndex.value])
    }
  } else if (e.key === 'Escape') {
    showMentions.value = false
  }
}

function selectUser(user: any) {
  const value = comment.value
  const cursor = textareaRef.value?.selectionStart || 0
  const lastAt = value.lastIndexOf('@', cursor - 1)
  
  if (lastAt !== -1) {
    const before = value.substring(0, lastAt)
    const after = value.substring(cursor)
    comment.value = `${before}@${user.userName} ${after}`
    showMentions.value = false
    
    // Guardar para enviar al backend (evitar duplicados)
    if (!taggedUsers.value.find(u => u.id === user.id)) {
      taggedUsers.value.push({
        id: user.id,
        userName: user.userName
      })
    }
    
    // Devolver foco y posicionar cursor
    setTimeout(() => {
      textareaRef.value?.focus()
      const newCursor = (before + '@' + user.userName + ' ').length
      textareaRef.value?.setSelectionRange(newCursor, newCursor)
    }, 0)
  }
}

function handleConfirm() {
  emit('confirm', {
    message: comment.value,
    mentions: taggedUsers.value
  })
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(16, 24, 40, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-container {
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 24px -4px rgba(16, 24, 40, 0.1), 0 8px 8px -4px rgba(16, 24, 40, 0.04);
  overflow: hidden;
  animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modal-in {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  position: relative;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: #F2F4F7;
  color: var(--primary-color, #465FFF);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-icon.has-comment {
  background: #ECFDF3;
  color: #027A48;
}

.header-content {
  flex: 1;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #101828;
  margin: 0 0 0.25rem 0;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: #667085;
  margin: 0;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #F9FAFB;
}

.modal-body {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.comment-input-wrapper {
  position: relative;
}

.comment-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-size: 1rem;
  color: #101828;
  outline: none;
  resize: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.comment-textarea:focus {
  border-color: var(--primary-color, #465FFF);
  box-shadow: 0 0 0 4px rgba(70, 95, 255, 0.1);
}

/* Mentions Dropdown */
.mentions-dropdown {
  position: absolute;
  background: #ffffff;
  border: 1px solid #E4E7EC;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(16, 24, 40, 0.1);
  width: 240px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
}

.mention-item {
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.mention-item:hover, .mention-item.active {
  background: #F9FAFB;
}

.mention-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F2F4F7;
  color: var(--primary-color, #465FFF);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.mention-info {
  display: flex;
  flex-direction: column;
}

.mention-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #101828;
}

.mention-username {
  font-size: 0.75rem;
  color: #667085;
}

.mention-empty {
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: #667085;
}

.modal-footer {
  padding: 1.5rem;
  background: #F9FAFB;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn {
  height: 44px;
  padding: 0 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn--secondary {
  background: #ffffff;
  border: 1px solid #D0D5DD;
  color: #344054;
}

.btn--secondary:hover:not(:disabled) {
  background: #F9FAFB;
}

.btn--primary {
  background: var(--primary-color, #465FFF);
  border: 1px solid var(--primary-color, #465FFF);
  color: #ffffff;
}

.btn--primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
