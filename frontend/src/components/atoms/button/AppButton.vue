<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit'
    disabled?: boolean
    variant?: 'primary' | 'secondary'
  }>(),
  { type: 'button', variant: 'primary' }
)
</script>

<template>
  <button :type="type" :class="['app-button', `app-button--${variant}`]" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.app-button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.app-button--primary {
  background-color: var(--primary-color);
  color: white;
}

.app-button--primary:hover:not(:disabled) {
  opacity: 0.9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.app-button--secondary {
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.app-button--secondary:hover:not(:disabled) {
  background-color: var(--primary-bg-light, rgba(0, 0, 0, 0.05));
}

.app-button:disabled {
  background-color: #F9FAFB;
  color: #D0D5DD;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
