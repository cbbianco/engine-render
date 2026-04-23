<script setup lang="ts">
defineProps<{
  title?: string
  message: string
  visible: boolean
  /** Color de error (p. ej. del servicio customer); se usa en borde, título y botón */
  errorColor?: string
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-card" :style="errorColor ? { '--error-color': errorColor } : undefined">
        <h2 class="modal-title">{{ title ?? 'Error' }}</h2>
        <p class="modal-message">{{ message }}</p>
        <button type="button" class="modal-btn" @click="$emit('close')">
          Aceptar
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* --error-color lo provee el servicio customer en el contenedor padre */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
}

.modal-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
  border-top: 4px solid var(--error-color, #dc3545);
}

.modal-title {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
  color: var(--error-color, #dc3545);
}

.modal-message {
  margin: 0 0 1.25rem;
  color: #333;
  line-height: 1.5;
}

.modal-btn {
  padding: 0.5rem 1.25rem;
  background: var(--error-color, #dc3545);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.modal-btn:hover {
  opacity: 0.9;
}
</style>
