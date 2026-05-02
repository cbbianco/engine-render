<template>
  <div 
    class="form-group form-group--plantilla"
    :style="{ 
      display: align ? 'flex' : 'block',
      justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'
    }"
  >
    <AppButton 
      type="button" 
      :disabled="loading || disabled" 
      :variant="variant" 
      @click="$emit('click')"
      :style="{ width: block ? '100%' : 'auto', minWidth: '120px' }"
    >
      <span v-if="loading" class="form-group__spinner" />
      {{ label }}
    </AppButton>
  </div>
</template>

<script setup lang="ts">
import { AppButton } from '@/components/atoms'

withDefaults(
  defineProps<{
    label?: string
    loading?: boolean
    disabled?: boolean
    variant?: 'primary' | 'secondary'
    align?: 'left' | 'center' | 'right'
    block?: boolean
  }>(),
  { 
    loading: false, 
    disabled: false, 
    variant: 'primary',
    align: 'left',
    block: false
  }
)
defineEmits<{ click: [] }>()
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}
.form-group__spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  vertical-align: -0.2em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
