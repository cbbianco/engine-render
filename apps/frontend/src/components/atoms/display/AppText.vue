<script setup lang="ts">
withDefaults(
  defineProps<{
    tag?: 'p' | 'span' | 'div'
    variant?: 'primary' | 'secondary' | 'error'
  }>(),
  { tag: 'p', variant: 'secondary' }
)
</script>

<template>
  <component :is="tag" :class="['app-text', `app-text--${variant}`]">
    <slot />
  </component>
</template>

<style scoped>
.app-text--primary {
  color: var(--primary-color);
}

.app-text--secondary {
  color: var(--secondary-color);
}

/* --error-color lo provee el servicio customer (theme) en el contenedor padre */
.app-text--error {
  color: var(--error-color, #dc3545);
}
</style>
