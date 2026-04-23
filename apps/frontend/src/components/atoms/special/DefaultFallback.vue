<template>
  <div class="missing-component-warning">
    <div class="warning-wrapper" :class="{ 'is-mismatch': isMismatch }">
      <span class="warning-emoji">{{ isMismatch ? '🚫' : '⚠️' }}</span>
      <div class="warning-content">
        <p class="warning-title">{{ isMismatch ? 'Incompatibilidad Detectada' : 'Componente no disponible' }}</p>
        <p class="warning-detail">
          {{ isMismatch 
            ? `El componente inyectado no es compatible con el tipo solicitado: "${type}"`
            : `El tipo "${type || 'desconocido'}" no tiene un componente registrado en el ServiceLocator.` 
          }}
        </p>
        <p v-if="module" class="warning-module">Módulo: <code class="type-badge">{{ module }}</code></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type?: string
  module?: string
  reason?: 'missing' | 'mismatch'
}>()

const isMismatch = computed(() => props.reason === 'mismatch')
</script>

<style scoped>
.missing-component-warning {
  margin-bottom: 1rem;
  padding: 1.25rem;
  background-color: #FFFCF5;
  border: 1px solid #FEDF89;
  border-radius: 10px;
  width: 100%;
}
.warning-wrapper.is-mismatch {
  background-color: #FFF1F2;
  border-color: #FECDD3;
  padding: 0.5rem;
  border-radius: 6px;
}
.warning-wrapper.is-mismatch .warning-title,
.warning-wrapper.is-mismatch .warning-detail {
  color: #9F1239;
}
.warning-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.warning-emoji {
  font-size: 1.5rem;
}
.warning-content {
  display: flex;
  flex-direction: column;
}
.warning-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: #B54708;
}
.warning-detail {
  margin: 0.125rem 0 0 0;
  font-size: 0.75rem;
  color: #B54708;
  opacity: 0.9;
}
.warning-module {
  margin-top: 0.5rem;
  font-size: 0.7rem;
  color: #64748B;
}
.type-badge {
  background: rgba(0,0,0,0.05);
  padding: 0.125rem 0.35rem;
  border-radius: 4px;
  font-family: monospace;
}
</style>
