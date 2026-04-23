<script setup lang="ts">
withDefaults(
  defineProps<{
    level?: 1 | 2 | 3
  }>(),
  { level: 1 }
)
</script>

<template>
  <component :is="`h${level}`" class="app-title">
    <slot />
  </component>
</template>

<style scoped>
.app-title {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

h1.app-title {
  margin-bottom: 1rem;
}
</style>
