<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="modal-overlay" @click.self="$emit('cancel')">
        <Transition name="scale">
          <div v-if="show" class="modal-card">
            <div class="modal-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-error">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            
            <h3 class="modal-title">{{ title }}</h3>
            <p class="modal-description">{{ message }}</p>
            
            <div class="modal-actions">
              <button class="btn-cancel" @click="$emit('cancel')" :disabled="loading">
                {{ cancelLabel }}
              </button>
              <button class="btn-confirm" @click="$emit('confirm')" :disabled="loading">
                <span v-if="loading" class="loader"></span>
                <span v-else>{{ confirmLabel }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  loading?: boolean
}>()

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(16, 24, 40, 0.4);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}

.modal-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  text-align: center;
}

.modal-icon {
  width: 48px;
  height: 48px;
  background: #FEF3F2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.text-error { color: #D92D20; }

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #101828;
  margin-bottom: 0.5rem;
}

.modal-description {
  font-size: 0.875rem;
  color: #475467;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.btn-cancel {
  padding: 0.625rem;
  background: white;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  color: #344054;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover:not(:disabled) { background: #F9FAFB; }

.btn-confirm {
  padding: 0.625rem;
  background: #D92D20;
  border: 1px solid #D92D20;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-confirm:hover:not(:disabled) { background: #B42318; border-color: #B42318; }
.btn-confirm:disabled { opacity: 0.7; cursor: not-allowed; }

.loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.scale-enter-active, .scale-leave-active { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.scale-enter-from, .scale-leave-to { transform: scale(0.9); }
</style>
