<template>
  <div class="form-group form-group--plantilla">
    <AppLabel v-if="label">{{ label }}</AppLabel>
    <div class="app-radio-group" :class="{ 'app-radio-group--invalid': invalid }">
      <label
        v-for="(opt, i) in options"
        :key="i"
        class="app-radio-wrap"
      >
        <input
          type="radio"
          :name="name"
          :value="typeof opt === 'object' ? opt.id : opt"
          :checked="modelValue === (typeof opt === 'object' ? opt.id : opt)"
          :disabled="disabled"
          class="app-radio"
          @change="onChange(typeof opt === 'object' ? opt.id : opt)"
        />
        <span class="app-radio-label">{{ typeof opt === 'object' ? opt.label : opt }}</span>
      </label>
    </div>
    <AppFieldError v-if="invalid && errorMessage" :error-color="errorColor">
      {{ errorMessage }}
    </AppFieldError>
  </div>
</template>

<script setup lang="ts">
import { AppLabel, AppFieldError } from '@/components/atoms'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    name?: string
    options?: any[]
    invalid?: boolean
    errorMessage?: string
    errorColor?: string
    disabled?: boolean
    readonly?: boolean
  }>(),
  { options: () => [], disabled: false, readonly: false }
)
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onChange(opt: string) {
  if (props.disabled || props.readonly) return
  emit('update:modelValue', opt)
}
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}
.app-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  padding: 0.5rem 0;
}
.app-radio-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--primary-color);
  transition: color 0.2s;
}
.app-radio-wrap:hover:not(.app-radio-wrap--disabled) {
  color: var(--primary-color);
  opacity: 0.8;
}
.app-radio {
  width: 1.125rem;
  height: 1.125rem;
  margin: 0;
  accent-color: var(--primary-color, var(--primary-color));
  cursor: pointer;
}
.app-radio:disabled,
.app-radio:read-only {
  cursor: not-allowed;
  opacity: 1;
}
.app-radio-wrap--disabled {
  cursor: not-allowed;
  color: var(--primary-color) !important;
  opacity: 1 !important;
}
.app-radio-label {
  user-select: none;
}
</style>
