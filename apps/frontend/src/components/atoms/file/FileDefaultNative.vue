<template>
  <div class="form-group form-group--plantilla">
    <AppLabel v-if="label" :for="inputId">{{ label }}</AppLabel>
    <div class="file-input-wrapper">
      <input
        :id="inputId"
        type="file"
        :name="name"
        :disabled="disabled || readonly"
        class="file-input-field"
        @change="onChange"
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
    modelValue?: any
    label?: string
    name?: string
    inputId?: string
    invalid?: boolean
    errorMessage?: string
    errorColor?: string
    disabled?: boolean
    readonly?: boolean
  }>(),
  {
    label: 'Upload file',
    invalid: false,
    disabled: false,
    readonly: false
  }
)

const emit = defineEmits<{ 'update:modelValue': [value: File | null] }>()

function onChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] || null
  emit('update:modelValue', file)
}
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

.file-input-wrapper {
  position: relative;
  width: 100%;
}

.file-input-field {
  width: 100%;
  cursor: pointer;
  border-radius: 0.5rem;
  border: 1.5px solid var(--primary-color);
  background: transparent;
  font-weight: 500;
  outline: none;
  transition: all 0.2s ease;
}

.file-input-field:focus {
  border-color: var(--primary-color);
}

.file-input-field::file-selector-button {
  margin-right: 1.25rem;
  cursor: pointer;
  border: 0;
  border-right: 1.5px solid var(--primary-color);
  background: var(--primary-bg-light, #f2f4f7);
  padding: 0.75rem 1.25rem;
  color: var(--primary-color);
  font-weight: 500;
  transition: all 0.2s ease;
}

.file-input-field:hover:not(:disabled)::file-selector-button {
  background: var(--primary-bg-light, #e5e9f0);
}

.file-input-field:disabled {
  cursor: default;
  opacity: 0.6;
}

/* Ajuste para que se parezca más a la imagen */
.file-input-field {
    font-size: 0.875rem;
}
</style>
