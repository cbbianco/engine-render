<template>
  <div ref="rootRef" class="form-group form-group--plantilla multi-select-root">
    <AppLabel v-if="label" :for="selectId">{{ label }}</AppLabel>
    <div
      :id="selectId"
      class="multi-select-wrap"
      :class="{ 'multi-select-wrap--invalid': showError, 'multi-select-wrap--disabled': disabled }"
      :aria-invalid="showError"
      role="combobox"
      :aria-expanded="open"
      @click="!disabled && toggleOpen()"
    >
      <div class="multi-select__chips">
        <span
          v-for="opt in selectedList"
          :key="opt"
          class="multi-select__chip"
        >
          {{ opt }}
          <button
            type="button"
            class="multi-select__chip-remove"
            :aria-label="`Quitar ${opt}`"
            :disabled="disabled"
            @click.stop="!disabled && remove(opt)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </span>
        <span v-if="selectedList.length === 0" class="multi-select__placeholder">{{ placeholder }}</span>
      </div>
      <span class="multi-select__chevron" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </span>
    </div>
    <div v-if="open" class="multi-select__dropdown" ref="dropdownRef">
      <button
        v-for="opt in optionList"
        :key="opt"
        type="button"
        class="multi-select__option"
        :class="{ 'multi-select__option--selected': selectedList.includes(opt) }"
        @mousedown.prevent="toggle(opt)"
      >
        {{ opt }}
      </button>
      <p v-if="optionList.length === 0" class="multi-select__empty">Sin opciones</p>
    </div>
    <AppFieldError v-if="showError && errorMessage" class="text-meta-1">{{ errorMessage }}</AppFieldError>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { AppLabel } from '@/components/atoms'
import { AppFieldError } from '@/components/atoms'

const props = withDefaults(
  defineProps<{
    modelValue?: string | string[]
    label?: string
    name?: string
    placeholder?: string
    options?: string[]
    selectId?: string
    invalid?: boolean
    errorMessage?: string
    disabled?: boolean
  }>(),
  { options: () => [], invalid: false, placeholder: 'Seleccione...', disabled: false }
)

const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

const isDirty = ref(false)
const showError = computed(() => props.invalid && isDirty.value)
const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

/** Opciones del schema (input, input-with-placeholder, password-input, etc.). */
const optionList = computed(() => props.options ?? [])

const selectedList = computed(() => {
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

function toggleOpen() {
  open.value = !open.value
}

function toggle(opt: string) {
  isDirty.value = true
  const list = [...selectedList.value]
  const i = list.indexOf(opt)
  if (i >= 0) list.splice(i, 1)
  else list.push(opt)
  emit('update:modelValue', list)
}

function remove(opt: string) {
  isDirty.value = true
  const list = selectedList.value.filter((o) => o !== opt)
  emit('update:modelValue', list)
}

function handleClickOutside(e: MouseEvent) {
  if (rootRef.value && rootRef.value.contains(e.target as Node)) return
  open.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}
.multi-select-root {
  position: relative;
}
/* Plantilla: Multiple Select Options con tags/chips (TailAdmin form-elements) */
.multi-select-wrap {
  display: flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  border: 1px solid var(--primary-color);
  border-radius: 0.5rem;
  background-color: #ffffff;
  cursor: pointer;
  gap: 0.375rem;
  transition: all 0.2s ease;
}
.multi-select-wrap--disabled {
  background-color: #ffffff;
  cursor: not-allowed;
  opacity: 1;
  border-color: var(--primary-color);
}
.multi-select-wrap--disabled .multi-select__chip {
  background: var(--primary-bg-light, rgba(70, 95, 255, 0.1));
  color: var(--primary-color) !important;
}
.multi-select-wrap--disabled .multi-select__placeholder {
  color: var(--primary-color) !important;
  opacity: 0.8;
}
.multi-select-wrap:focus-within:not(.multi-select-wrap--disabled),
.multi-select-wrap:hover:not(.multi-select-wrap--disabled) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px var(--primary-bg-light, var(--primary-bg-light, rgba(70, 95, 255, 0.12)));
}
.multi-select-wrap--invalid {
  border-color: var(--error-color, #dc3545);
  box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.12);
}
.multi-select__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  flex: 1;
  min-width: 0;
}
.multi-select__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  background: var(--primary-bg-light, #f2f4f7);
  color: var(--primary-color);
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s;
}
.multi-select__chip-remove {
  display: inline-flex;
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  color: var(--primary-color);
  cursor: pointer;
}
.multi-select__chip-remove:hover:not(:disabled) {
  color: var(--error-color, #dc3545);
}
.multi-select__chevron {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--primary-color);
  pointer-events: none;
}
.multi-select__dropdown {
  position: absolute;
  z-index: 100;
  margin-top: 0.5rem;
  min-width: 100%;
  max-height: 15rem;
  overflow-y: auto;
  background: #ffffff;
  border: 1px solid var(--primary-color);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.multi-select__option {
  display: block;
  width: 100%;
  padding: 0.625rem 1rem;
  text-align: left;
  border: none;
  background: none;
  font: inherit;
  font-size: 0.875rem;
  color: var(--primary-color);
  cursor: pointer;
  transition: background 0.2s;
}
.multi-select__option:hover {
  background: var(--gray-100, #f2f4f7);
}
.multi-select__option--selected {
  background: var(--primary-bg-light, #ecf3ff);
  color: var(--primary-color, var(--primary-color));
  font-weight: 600;
}
.multi-select__placeholder {
  color: var(--gray-400, #98a2b3);
  font-size: 0.875rem;
}
.multi-select__empty {
  padding: 0.75rem 1rem;
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-500, #667085);
}
</style>
