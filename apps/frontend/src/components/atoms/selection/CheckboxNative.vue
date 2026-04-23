<template>
  <div class="form-group form-group--plantilla">
    <AppLabel v-if="label">{{ label }}</AppLabel>
    <div class="app-checkbox-group" :class="{ 'app-checkbox-group--invalid': invalid }">
      <label
        v-for="(opt, i) in options"
        :key="i"
        class="app-checkbox-wrap"
      >
        <input
          type="checkbox"
          :name="name"
          :value="typeof opt === 'object' ? opt.id : opt"
          :checked="isChecked(typeof opt === 'object' ? opt.id : opt)"
          :disabled="disabled"
          class="app-checkbox"
          @change="onChange(typeof opt === 'object' ? opt.id : opt, ($event.target as HTMLInputElement).checked)"
        />
        <span class="app-checkbox-label">{{ typeof opt === 'object' ? opt.label : opt }}</span>
      </label>
    </div>
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
    modelValue?: string | string[]
    label?: string
    name?: string
    options?: any[]
    invalid?: boolean
    errorMessage?: string
    errorColor?: string
    disabled?: boolean
  }>(),
  { options: () => [], disabled: false }
)

const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

const checkedList = computed(() => {
  const v = props.modelValue
  if (Array.isArray(v)) return v
  if (v == null || v === '') return []
  try {
    const parsed = JSON.parse(String(v)) as unknown
    return Array.isArray(parsed) ? parsed.map(String) : [String(v)]
  } catch {
    return [String(v)]
  }
})

function isChecked(opt: string): boolean {
  return checkedList.value.includes(opt)
}

function onChange(opt: string, checked: boolean) {
  if (props.disabled || props.readonly) return
  const next = checked
    ? [...checkedList.value, opt]
    : checkedList.value.filter((x) => x !== opt)
  emit('update:modelValue', next)
}
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}
.app-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  padding: 0.5rem 0;
}
.app-checkbox-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--primary-color);
  transition: color 0.2s;
}
.app-checkbox-wrap:hover:not(.app-checkbox-wrap--disabled) {
  color: var(--primary-color);
  opacity: 0.8;
}
.app-checkbox {
  width: 1.125rem;
  height: 1.125rem;
  margin: 0;
  accent-color: var(--primary-color, var(--primary-color));
  cursor: pointer;
}
.app-checkbox:disabled,
.app-checkbox:read-only {
  cursor: not-allowed;
  opacity: 1;
}
.app-checkbox-wrap--disabled {
  cursor: not-allowed;
  color: var(--primary-color) !important;
  opacity: 1 !important;
}
.app-checkbox-label {
  user-select: none;
}
</style>
