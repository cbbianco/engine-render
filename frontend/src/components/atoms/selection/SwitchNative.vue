<template>
  <div class="form-group form-group--plantilla">
    <AppLabel v-if="label" class="switch-label">{{ label }}</AppLabel>
    <label :class="['switch-wrap', { 'switch-wrap--disabled': disabled, 'switch-wrap--invalid': invalid }]">
      <input
        type="checkbox"
        :checked="isOn"
        :name="name"
        :disabled="disabled"
        class="switch-input"
        @change="onChange"
      />
      <span class="switch-slider" />
    </label>
    <AppFieldError v-if="invalid && errorMessage" :error-color="errorColor">
      {{ errorMessage }}
    </AppFieldError>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AppLabel, AppFieldError } from '@/components/atoms'

const props = withDefaults(
  defineProps<{
    modelValue?: string | boolean
    label?: string
    name?: string
    invalid?: boolean
    errorMessage?: string
    errorColor?: string
    disabled?: boolean
    readonly?: boolean
  }>(),
  { invalid: false, disabled: false, readonly: false }
)
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const isOn = computed(() => {
  const v = props.modelValue
  if (v === true || v === 'true' || v === '1' || v === 'on') return true
  return false
})

function onChange(e: Event) {
  if (props.disabled || props.readonly) return
  const checked = (e.target as HTMLInputElement).checked
  emit('update:modelValue', checked ? 'true' : 'false')
}
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}
.switch-label {
  display: block;
  margin-bottom: 0.625rem;
  font-weight: 500;
  color: var(--primary-color);
}
.switch-wrap {
  position: relative;
  display: inline-block;
  width: 3.5rem; /* 56px */
  height: 1.75rem; /* 28px */
  flex-shrink: 0;
  cursor: pointer;
}
.switch-wrap--disabled {
  cursor: not-allowed;
  opacity: 1;
}
.switch-wrap--disabled .switch-slider {
  background-color: var(--gray-200, #e2e8f0);
}
.switch-wrap--disabled .switch-input:checked + .switch-slider {
  background-color: var(--primary-color, var(--primary-color));
  opacity: 0.6;
}
.switch-wrap--invalid .switch-slider {
  border: 1px solid var(--error-color, #dc3545);
}
.switch-input {
  opacity: 0;
  width: 0;
  height: 0;
}
.switch-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--gray-200, #e2e8f0);
  border-radius: 9999px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.switch-slider::before {
  content: '';
  position: absolute;
  height: 1.375rem; /* 22px */
  width: 1.375rem; /* 22px */
  left: 3px;
  bottom: 3px;
  background-color: #ffffff;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.switch-input:checked + .switch-slider {
  background-color: var(--primary-color, var(--primary-color));
}
.switch-input:checked + .switch-slider::before {
  transform: translateX(1.75rem);
}
.switch-input:focus + .switch-slider {
  box-shadow: 0 0 0 4px var(--primary-bg-light, rgba(70, 95, 255, 0.2));
}
</style>
