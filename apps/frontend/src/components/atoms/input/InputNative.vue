<template>
  <div class="form-group form-group--plantilla" :style="{ textAlign: align }">
    <AppLabel v-if="label" :for="inputId">{{ label }}</AppLabel>
    <AppInput
      :id="inputId"
      :type="type"
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
import { ref, computed } from 'vue'
import { AppLabel, AppInput, AppFieldError } from '@/components/atoms'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    name?: string
    type?: string
    placeholder?: string
    inputId?: string
    invalid?: boolean
    errorMessage?: string
    errorColor?: string
    disabled?: boolean
    readonly?: boolean
    align?: 'left' | 'center' | 'right'
  }>(),
  { type: 'text', invalid: false, disabled: false, readonly: false, align: 'left' }
)
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}
</style>
