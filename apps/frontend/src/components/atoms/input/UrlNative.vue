<template>
  <div class="form-group form-group--plantilla">
    <AppLabel v-if="label" :for="inputId">{{ label }}</AppLabel>
    <div 
      class="url-input-wrap"
      :class="{ 'url-input-wrap--invalid': invalid, 'url-input-wrap--disabled': disabled }"
    >
      <span :class="['url-input__prefix', { 'url-input__prefix--invalid': invalid }]" aria-hidden="true">http://</span>
      <input
        :id="inputId"
        type="text"
        :value="modelValue"
        :name="name"
        :placeholder="placeholder"
        :class="['url-input__field', 'app-input', { 'app-input--invalid': invalid }]"
        :aria-invalid="invalid"
        :disabled="disabled"
        autocomplete="url"
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
  }>(),
  { 
    label: 'URL',
    invalid: false, 
    placeholder: 'www.tailadmin.com',
    disabled: false
  }
)
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}
.url-input-wrap {
  display: flex;
  width: 100%;
  border: 1px solid var(--primary-color);
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.url-input-wrap--disabled {
  background-color: #F3F4F6 !important;
  cursor: not-allowed;
  border-color: var(--primary-color) !important;
}

.url-input-wrap:focus-within:not(.url-input-wrap--disabled) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px var(--primary-bg-light, var(--primary-bg-light, rgba(70, 95, 255, 0.12)));
}

.url-input-wrap--invalid {
  border-color: var(--error-color, #dc3545);
  box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.12);
}

.url-input__prefix {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--primary-bg-light, #f2f4f7);
  color: var(--primary-color);
  font-size: 0.875rem;
  border-right: 1px solid var(--primary-color);
}

.url-input__prefix--invalid {
  color: var(--error-color, #dc3545);
}

.url-input__field {
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

.url-input__field:disabled,
.url-input__field:read-only {
  cursor: not-allowed;
  color: var(--primary-color) !important;
  -webkit-text-fill-color: var(--primary-color) !important;
  opacity: 1 !important;
}

.url-input__field:focus {
  outline: none;
}

.url-input__field::placeholder {
  color: var(--gray-400, #98a2b3);
}
</style>
