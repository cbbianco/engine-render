<template>
  <div class="form-group form-group--plantilla">
    <AppButton type="button" :disabled="loading || disabled" :variant="variant" @click="$emit('click')">
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
  }>(),
  { loading: false, disabled: false, variant: 'primary' }
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
