<template>
  <div class="form-group form-group--plantilla">
    <AppLabel v-if="label" :for="inputId">{{ label }}</AppLabel>
    <AppInput
      :id="inputId"
      type="text"
      :model-value="modelValue"
      :placeholder="placeholder"
      :name="name"
      :invalid="invalid"
      :disabled="disabled"
      :readonly="readonly"
      :error-color="errorColor"
      @update:model-value="(val: any) => $emit('update:modelValue', val ?? '')"
    />
    <AppFieldError v-if="invalid && errorMessage" :error-color="errorColor">
      {{ errorMessage }}
    </AppFieldError>
  </div>
</template>

<script setup lang="ts">
import { AppLabel, AppInput, AppFieldError } from '@/components/atoms'

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
    readonly?: boolean
  }>(),
  { 
    invalid: false, 
    placeholder: 'Escriba aquí...',
    disabled: false,
    readonly: false
  }
)
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}
</style>
