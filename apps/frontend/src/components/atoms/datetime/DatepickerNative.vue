<template>
  <div class="form-group form-group--plantilla">
    <AppLabel v-if="label" :for="inputId">{{ label }}</AppLabel>
    <div class="app-datepicker-wrap">
      <input
        :id="inputId"
        type="date"
        :value="modelValue"
        :name="name"
        :placeholder="placeholder"
        :class="['app-datepicker-input', { 'app-datepicker-input--invalid': invalid }]"
        :aria-invalid="invalid"
        :disabled="disabled"
        @input="(e: any) => $emit('update:modelValue', (e.target as HTMLInputElement).value)"
      />
      <span :class="['app-datepicker-icon', { 'app-datepicker-icon--invalid': invalid }]" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </span>
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
    inputId?: string
    placeholder?: string
    invalid?: boolean
    errorMessage?: string
    errorColor?: string
    disabled?: boolean
    readonly?: boolean
  }>(),
  { invalid: false, placeholder: 'Select date', disabled: false, readonly: false }
)
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}
.app-datepicker-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 1px solid var(--primary-color);
  border-radius: 0.5rem;
  color: var(--primary-color);
  background-color: #ffffff;
  outline: none;
  box-shadow: none;
  font: inherit;
  font-size: 0.875rem;
  line-height: 1.25rem;
  transition: all 0.2s ease;
}
.app-datepicker-input:disabled,
.app-datepicker-input:read-only {
  background-color: #F3F4F6;
  color: var(--primary-color) !important;
  -webkit-text-fill-color: var(--primary-color) !important;
  opacity: 0.8 !important;
  cursor: not-allowed;
  border-color: var(--primary-color);
}
.app-datepicker-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0;
  width: 2.5rem;
  height: 100%;
  cursor: pointer;
}
.app-datepicker-input::-webkit-date-and-time-value {
  text-align: left;
}
.app-datepicker-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px var(--primary-bg-light, var(--primary-bg-light, rgba(70, 95, 255, 0.12)));
}
.app-datepicker-input--invalid {
  border-color: var(--error-color, #dc3545);
  box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.12);
}
.app-datepicker-input::placeholder {
  color: var(--gray-400, #98a2b3);
}
.app-datepicker-icon {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  color: var(--primary-color);
}
.app-datepicker-icon svg {
  display: block;
}
</style>
