<template>
  <div class="form-group form-group--plantilla">
    <AppLabel v-if="label" :for="inputId">{{ label }}</AppLabel>
    <textarea
      :id="inputId"
      :value="modelValue"
      :name="name"
      :placeholder="placeholder"
      :rows="rows"
      :class="['app-textarea', { 'app-textarea--invalid': invalid, 'app-textarea--code': variant === 'code' }]"
      :aria-invalid="invalid"
      :disabled="disabled"
      :readonly="readonly"
      @input="(e: any) => $emit('update:modelValue', (e.target as HTMLTextAreaElement).value)"
    ></textarea>
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
    rows?: number
    invalid?: boolean
    errorMessage?: string
    errorColor?: string
    disabled?: boolean
    readonly?: boolean
    /** 'code' para body JSON (input_body): fuente monospace, estilo código. */
    variant?: 'default' | 'code'
  }>(),
  { rows: 4, invalid: false, variant: 'default', disabled: false, readonly: false }
)
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}
.app-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--primary-color);
  border-radius: 0.5rem;
  color: var(--primary-color);
  background-color: #ffffff;
  outline: none;
  box-shadow: none;
  font: inherit;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 6rem;
  transition: all 0.2s ease;
}
.app-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px var(--primary-bg-light, var(--primary-bg-light, rgba(70, 95, 255, 0.12)));
}
.app-textarea::placeholder {
  color: var(--gray-400, #98a2b3);
}
.app-textarea--invalid {
  border-color: var(--error-color, #dc3545);
  box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.12);
}
.app-textarea:disabled,
.app-textarea:read-only {
  background-color: #F3F4F6 !important;
  color: var(--primary-color) !important;
  -webkit-text-fill-color: var(--primary-color) !important;
  opacity: 1 !important;
  cursor: not-allowed;
  border-color: var(--primary-color) !important;
}
.app-textarea--code {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 0.8125rem;
  line-height: 1.5;
  background: var(--color-gray-50, #f9fafb);
}
</style>
