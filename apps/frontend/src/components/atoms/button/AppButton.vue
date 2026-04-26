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
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
}

.app-button--primary {
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
}

.app-button--primary:hover:not(:disabled) {
  filter: brightness(0.95);
  transform: translateY(-2px);
  box-shadow: 0 12px 20px -5px rgba(70, 95, 255, 0.35);
}

.app-button--secondary {
  background-color: #ffffff;
  color: var(--primary-color);
  border: 1.5px solid var(--primary-color);
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);
}

.app-button--secondary:hover:not(:disabled) {
  background-color: var(--primary-bg-light, rgba(70, 95, 255, 0.08));
  color: var(--primary-hover, #3549CC);
  border-color: var(--primary-hover, #3549CC);
}

.app-button:disabled {
  background-color: #F9FAFB;
  color: #D0D5DD;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
