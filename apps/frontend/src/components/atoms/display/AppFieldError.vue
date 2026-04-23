<script setup lang="ts">
defineProps<{
  id?: string
  /** Color de error que provee el backend (servicio customer). */
  errorColor?: string
}>()
</script>

<template>
  <small v-if="$slots.default" class="app-field-error" :id="id" :style="errorColor ? { color: errorColor } : undefined">
    <slot />
  </small>
</template>

<style scoped>
.app-field-error {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  line-height: 1.3;
  color: var(--error-color, #dc3545);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
