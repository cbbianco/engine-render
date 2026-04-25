<template>
  <Teleport to="body">
    <div v-if="error" class="config-error-overlay">
    <div class="config-error-modal">
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <h2>Error Crítico de Configuración</h2>
      <p class="error-message">{{ error }}</p>
      <div class="error-details">
        <p><strong>Causa:</strong> Se ha detectado una inconsistencia en el esquema JSON del módulo.</p>
        <p><strong>Acción:</strong> Revise las propiedades "match" y "property" en el archivo de plantilla correspondiente.</p>
      </div>
      <button @click="reloadPage" class="reload-btn">
        Recargar Aplicación
      </button>
    </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  error: string | null
}>()

const reloadPage = () => {
  window.location.reload()
}
</script>

<style scoped>
.config-error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999;
  backdrop-filter: blur(8px);
}

.config-error-modal {
  background: #ffffff;
  padding: 3rem;
  border-radius: 1.5rem;
  max-width: 600px;
  width: 90%;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 4px solid #ef4444;
  animation: modalIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes modalIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.error-icon {
  color: #ef4444;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

h2 {
  color: #1e293b;
  font-size: 1.875rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.error-message {
  background: #fee2e2;
  color: #b91c1c;
  padding: 1rem;
  border-radius: 0.75rem;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 600;
  margin-bottom: 2rem;
  border-left: 4px solid #dc2626;
}

.error-details {
  text-align: left;
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.reload-btn {
  background: #1e293b;
  color: white;
  padding: 0.875rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.reload-btn:hover {
  background: #0f172a;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}
</style>
