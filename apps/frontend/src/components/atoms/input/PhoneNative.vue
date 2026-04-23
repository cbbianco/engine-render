<template>
  <div class="form-group form-group--plantilla">
    <AppLabel v-if="label" :for="inputId">{{ label }}</AppLabel>
    <div class="phone-input-wrap" :class="{ 'phone-input-wrap--invalid': invalid, 'phone-input-wrap--disabled': disabled }">
      <select
        v-model="countryCode"
        :class="['phone-input__country', { 'phone-input__country--invalid': invalid }]"
        :aria-label="'Código de país'"
        :disabled="disabled"
      >
        <option v-for="opt in countryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <input
        :id="inputId"
        type="tel"
        :value="modelValue"
        :name="name"
        :placeholder="placeholder"
        :class="['phone-input__field', 'app-input', { 'app-input--invalid': invalid }]"
        :aria-invalid="invalid"
        :disabled="disabled"
        autocomplete="tel"
        @input="(e: any) => $emit('update:modelValue', (e.target as HTMLInputElement).value)"
      />
    </div>
    <AppFieldError v-if="invalid && errorMessage" :error-color="errorColor">
      {{ errorMessage }}
    </AppFieldError>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AppLabel, AppFieldError } from '@/components/atoms'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    name?: string
    placeholder?: string
    inputId?: string
    invalid?: boolean
    errorMessage?: string
    errorColor?: string
    countryOptions?: { value: string; label: string }[]
    disabled?: boolean
  }>(),
  {
    invalid: false,
    placeholder: '+1 (555) 000-0000',
    disabled: false,
    countryOptions: () => [
      { value: 'US', label: 'US' },
      { value: 'MX', label: 'MX' },
      { value: 'CO', label: 'CO' },
      { value: 'ES', label: 'ES' },
      { value: 'AR', label: 'AR' }
    ]
  }
)
defineEmits<{ 'update:modelValue': [value: string] }>()

const countryCode = ref(props.countryOptions[0]?.value ?? 'US')
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}
.phone-input-wrap {
  display: flex;
  width: 100%;
  border: 1px solid var(--primary-color);
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #ffffff;
  transition: all 0.2s ease;
}
.phone-input-wrap--disabled {
  background-color: #ffffff;
  cursor: not-allowed;
  opacity: 0.6;
}
.phone-input__country {
  padding: 0.75rem 0.5rem 0.75rem 0.75rem;
  border: none;
  border-right: 1px solid var(--primary-color);
  background: var(--primary-bg-light, #f2f4f7);
  color: var(--primary-color);
  font: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  min-width: 4rem;
  outline: none;
}
.phone-input__country:disabled,
.phone-input__country:read-only {
  cursor: not-allowed;
  color: var(--primary-color) !important;
  -webkit-text-fill-color: var(--primary-color) !important;
  opacity: 1 !important;
}
.phone-input__field {
  flex: 1;
  min-width: 0;
  border: none !important;
  border-radius: 0;
  padding: 0.75rem 1rem;
  background-color: transparent;
  color: var(--primary-color);
  font: inherit;
  font-size: 0.875rem;
  outline: none;
}
.phone-input__field:disabled,
.phone-input__field:read-only {
  cursor: not-allowed;
  color: var(--primary-color) !important;
  -webkit-text-fill-color: var(--primary-color) !important;
  opacity: 1 !important;
}
.phone-input-wrap:focus-within:not(.phone-input-wrap--disabled) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px var(--primary-bg-light, var(--primary-bg-light, rgba(70, 95, 255, 0.12)));
}
.phone-input-wrap--invalid {
  border-color: var(--error-color, #dc3545);
  box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.12);
}
.phone-input__country--invalid {
  color: var(--error-color, #dc3545);
}
.phone-input__field::placeholder {
  color: var(--gray-400, #98a2b3);
}
</style>
