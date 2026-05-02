<template>
  <div class="form-group form-group--plantilla" :style="{ textAlign: align }">
    <AppLabel v-if="label" :for="inputId">{{ label }}</AppLabel>
    <div
      class="email-input-wrap"
      :class="{ 'email-input-wrap--invalid': invalid, 'email-input-wrap--disabled': disabled }"
    >
      <span :class="['email-input__icon', { 'email-input__icon--invalid': invalid }]" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
      </span>
      <input
        :id="inputId"
        type="email"
        :value="modelValue"
        :name="name"
        :placeholder="placeholder"
        :class="['email-input__field', 'app-input', { 'app-input--invalid': invalid }]"
        :aria-invalid="invalid"
        :disabled="disabled"
        autocomplete="email"
        @input="(e: any) => $emit('update:modelValue', (e.target as HTMLInputElement).value)"
      />
    </div>
    <AppFieldError v-if="invalid && errorMessage" :error-color="errorColor">
      {{ errorMessage }}
    </AppFieldError>
  </div>
</template>

<script setup lang="ts">
import { AppLabel, AppFieldError } from '@/components/atoms'

withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    name?: string
    placeholder?: string
    inputId?: string
    invalid?: boolean
    errorMessage?: string
    errorColor?: string
    disabled?: boolean
    align?: 'left' | 'center' | 'right'
  }>(),
  { 
    label: 'Email',
    invalid: false, 
    placeholder: 'info@gmail.com',
    disabled: false,
    align: 'left'
  }
)
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

.email-input-wrap {
  display: flex;
  width: 100%;
  border: 1px solid var(--primary-color);
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.email-input-wrap--disabled {
  background-color: #F3F4F6;
  cursor: not-allowed;
  border-color: var(--primary-color);
  opacity: 0.8;
}

.email-input-wrap:focus-within:not(.email-input-wrap--disabled) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px var(--primary-bg-light, var(--primary-bg-light, rgba(70, 95, 255, 0.12)));
}

.email-input-wrap--invalid {
  border-color: var(--error-color, #dc3545);
  box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.12);
}

.email-input__icon {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: transparent;
  color: var(--primary-color);
  border-right: 1px solid var(--primary-color);
}

.email-input__icon--invalid {
  color: var(--error-color, #dc3545);
}

.email-input__field {
  flex: 1;
  min-width: 0;
  border: none !important;
  border-radius: 0;
  padding: 0.75rem 1rem;
  font: inherit;
  font-size: 0.875rem;
  background-color: transparent;
  color: var(--primary-color);
}

.email-input__field:disabled,
.email-input__field:read-only {
  cursor: not-allowed;
  color: var(--primary-color) !important;
  -webkit-text-fill-color: var(--primary-color) !important;
  opacity: 1 !important;
}

.email-input__field:focus {
  outline: none;
}

.email-input__field::placeholder {
  color: var(--gray-400, #94a3b8);
}
</style>
