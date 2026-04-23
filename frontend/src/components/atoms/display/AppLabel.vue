<script setup lang="ts">
defineProps<{
  for?: string
}>()
</script>

<template>
  <label class="app-label" :for="for">
    <slot />
  </label>
</template>

<style scoped>
.app-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--secondary-color, var(--primary-color));
  font-weight: 500;
  font-size: 0.875rem;
}
</style>
