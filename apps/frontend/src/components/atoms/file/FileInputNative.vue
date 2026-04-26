<template>
  <div class="form-group form-group--plantilla">
    <AppLabel v-if="label" :for="inputId">{{ label }}</AppLabel>
    <div
      class="file-input-dropzone"
      :class="{ 
        'file-input-dropzone--invalid': invalid, 
        'file-input-dropzone--dragover': isDragover,
        'file-input-dropzone--disabled': disabled || readonly 
      }"
      @dragover.prevent="!(disabled || readonly) && (isDragover = true)"
      @dragleave.prevent="isDragover = false"
      @drop.prevent="!(disabled || readonly) && onDrop($event)"
      @click="!(disabled || readonly) && fileInputRef?.click()"
    >
      <input
        :id="inputId"
        ref="fileInputRef"
        type="file"
        :name="name"
        class="file-input-dropzone__hidden"
        @change="onChange"
      />
      <p class="file-input-dropzone__text">{{ fileName || 'Arrastre archivos aquí o haga clic para seleccionar' }}</p>
      <button 
        type="button" 
        class="file-input-dropzone__btn" 
        :disabled="disabled || readonly"
        @click.stop="!(disabled || readonly) && fileInputRef?.click()"
      >
        Seleccionar archivo
      </button>
    </div>
    <AppFieldError v-if="invalid && errorMessage" :error-color="errorColor">
      {{ errorMessage }}
    </AppFieldError>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AppLabel, AppFieldError } from '@/components/atoms'

withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    name?: string
    inputId?: string
    invalid?: boolean
    errorMessage?: string
    errorColor?: string
    disabled?: boolean
    readonly?: boolean
  }>(),
  { invalid: false, disabled: false, readonly: false }
)
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const isDragover = ref(false)
const fileName = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

function onChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  fileName.value = file ? file.name : ''
  emit('update:modelValue', file ? file.name : '')
}

function onDrop(e: DragEvent) {
  isDragover.value = false
  const file = e.dataTransfer?.files?.[0]
  fileName.value = file ? file.name : ''
  emit('update:modelValue', file ? file.name : '')
  if (file && fileInputRef.value) {
    const dt = new DataTransfer()
    dt.items.add(file)
    fileInputRef.value.files = dt.files
  }
}
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}
.file-input-dropzone {
  border: 2px dashed var(--primary-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  background-color: #ffffff;
  transition: all 0.2s ease;
  cursor: pointer;
}
.file-input-dropzone--disabled {
  background-color: #ffffff;
  cursor: not-allowed;
  border-style: solid;
  border-color: var(--primary-color);
}
.file-input-dropzone--disabled .file-input-dropzone__text {
  color: var(--primary-color) !important;
  opacity: 1 !important;
}
.file-input-dropzone--disabled .file-input-dropzone__btn {
  cursor: not-allowed;
  opacity: 0.6;
}
.file-input-dropzone--dragover {
  border-color: var(--primary-color);
  background: var(--primary-bg-light, rgba(70, 95, 255, 0.05));
}
.file-input-dropzone--invalid {
  border-color: var(--error-color, #dc3545);
  background-color: rgba(220, 53, 69, 0.02);
}
.file-input-dropzone__hidden {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}
.file-input-dropzone__text {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  color: var(--primary-color);
  font-weight: 500;
}
.file-input-dropzone__btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  border: 1px solid var(--primary-color);
  background: #ffffff;
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.file-input-dropzone__btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  background: var(--primary-bg-light, #ecf3ff);
}
</style>
