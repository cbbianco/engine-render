<template>
  <div class="form-group form-group--plantilla">
    <AppLabel v-if="label" :for="inputId">{{ label }}</AppLabel>
    <div class="password-input-wrap">
      <input
        :id="inputId"
        :type="showPassword ? 'text' : 'password'"
        :value="model"
        @input="model = ($event.target as HTMLInputElement).value"
        :placeholder="placeholder"
        :name="name"
        :class="['app-input', { 'app-input--invalid': invalid }]"
        :aria-invalid="invalid"
        :disabled="disabled"
        autocomplete="off"
      />
      <button
        type="button"
        :class="['password-input__toggle', { 'password-input__toggle--invalid': invalid }]"
        :disabled="disabled"
        :style="invalid && errorColor ? { '--input-error-color': errorColor } : undefined"
        :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        @click="showPassword = !showPassword"
      >
        <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>
    </div>
    <AppFieldError v-if="invalid && errorMessage" :error-color="errorColor">
      {{ errorMessage }}
    </AppFieldError>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AppLabel, AppFieldError } from '@/components/atoms'

const model = defineModel<string>()

withDefaults(
  defineProps<{
    label?: string
    name?: string
    placeholder?: string
    inputId?: string
    invalid?: boolean
    errorMessage?: string
    errorColor?: string
    disabled?: boolean
    readonly?: boolean
  }>(),
  { invalid: false, placeholder: '••••••••', disabled: false, readonly: false }
)

const showPassword = ref(false)
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}
.password-input-wrap {
  position: relative;
  display: block;
  width: 100%;
}
.password-input-wrap .app-input {
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 1rem;
  border: 1px solid var(--primary-color);
  border-radius: 0.5rem;
  color: var(--primary-color);
  outline: none;
  font: inherit;
  font-size: 0.875rem;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.password-input-wrap .app-input:disabled,
.password-input-wrap .app-input:read-only {
  background-color: #F3F4F6;
  color: var(--primary-color) !important;
  -webkit-text-fill-color: var(--primary-color) !important;
  opacity: 0.8 !important;
  cursor: not-allowed;
  border-color: var(--primary-color);
}

.password-input-wrap .app-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px var(--primary-bg-light, var(--primary-bg-light, rgba(70, 95, 255, 0.12)));
}

.password-input-wrap .app-input--invalid {
  border-color: var(--error-color, #dc3545);
  box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.12);
}

.password-input__toggle {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  padding: 0.25rem;
  border: none;
  background: none;
  color: var(--primary-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.password-input__toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.password-input__toggle--invalid {
  color: var(--error-color, #dc3545);
}

.password-input__toggle:hover:not(:disabled) {
  color: var(--gray-900, #101828);
}
</style>
