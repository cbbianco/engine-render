<script setup lang="ts">
const model = defineModel<string>()

withDefaults(
  defineProps<{
    type?: string
    placeholder?: string
    required?: boolean
    id?: string
    invalid?: boolean
    disabled?: boolean
    readonly?: boolean
    /** Color de error que provee el backend (servicio customer). Se aplica al borde cuando invalid. */
    errorColor?: string
  }>(),
  { invalid: false, disabled: false, readonly: false }
)
</script>

<template>
  <input
    :class="['app-input', { 'app-input--invalid': invalid }]"
    :style="invalid && errorColor ? { '--input-error-color': errorColor } : undefined"
    :type="type ?? 'text'"
    v-model="model"
    :placeholder="placeholder"
    :required="required"
    :id="id"
    :disabled="disabled"
    :readonly="readonly"
    :aria-invalid="invalid"
    :aria-describedby="invalid && id ? `${id}-error` : undefined"
  />
</template>

<style scoped>
.app-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--primary-color);
  border-radius: 0.5rem;
  color: var(--primary-color);
  background-color: #ffffff;
  font: inherit;
  font-size: 0.875rem;
  outline: none;
  box-shadow: none;
  transition: all 0.2s ease;
}

.app-input:disabled,
.app-input:read-only {
  background-color: #F3F4F6 !important;
  color: var(--primary-color) !important;
  -webkit-text-fill-color: var(--primary-color) !important;
  opacity: 1 !important;
  cursor: not-allowed;
  border-color: var(--primary-color) !important;
}

.app-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px var(--primary-bg-light, var(--primary-bg-light, rgba(70, 95, 255, 0.12)));
}

.app-input--invalid {
  border-color: var(--error-color, #dc3545);
  box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.12);
}

.app-input--invalid:focus {
  border-color: var(--error-color, #dc3545);
  box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.2);
}

.app-input::placeholder {
  color: var(--primary-color);
  opacity: 0.5;
}
</style>
