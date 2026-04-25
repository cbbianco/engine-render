<template>
  <div v-if="options && options.length > 0" class="form-group form-group--plantilla" ref="containerRef">
    <AppLabel v-if="label" :for="selectId">{{ label }}</AppLabel>
    
    <!-- CASO 1: Premium Color Select (si detectamos hex en las opciones) -->
    <div v-if="isColorSelect" class="premium-select">
      <button 
        type="button" 
        class="premium-select__trigger" 
        :class="{ 'premium-select__trigger--active': isOpen, 'premium-select__trigger--invalid': invalid }"
        :disabled="isActuallyDisabled"
        @click="isOpen = !isOpen"
      >
        <div class="flex items-center gap-2">
          <div 
            v-if="selectedColor" 
            class="color-swatch" 
            :style="{ backgroundColor: selectedColor }"
          ></div>
          <span class="truncate">{{ selectedLabel || props.placeholder || 'Seleccione...' }}</span>
        </div>
        <ChevronDownIcon class="chevron-icon" :class="{ 'chevron-icon--rotated': isOpen }" />
      </button>

      <transition name="fade">
        <ul v-if="isOpen" class="premium-select__dropdown no-scrollbar">
          <li 
            v-for="opt in normalizedOptions" 
            :key="opt.id"
            class="premium-select__option"
            :class="{ 'premium-select__option--selected': modelValue === opt.id }"
            @click="selectOption(opt)"
          >
            <div class="color-swatch" :style="{ backgroundColor: opt.label }"></div>
            <span>{{ opt.label }}</span>
          </li>
        </ul>
      </transition>
    </div>

    <!-- CASO 2: Select Nativo (Fallback) -->
    <select
      v-else
      :id="selectId"
      :value="modelValue"
      :name="name"
      class="app-select"
      :class="{ 'app-select--invalid': invalid }"
      :disabled="isActuallyDisabled"
      @change="(e: any) => $emit('update:modelValue', (e.target as HTMLSelectElement).value)"
    >
      <option value="">{{ props.placeholder || 'Seleccione...' }}</option>
      <option 
        v-for="opt in normalizedOptions" 
        :key="opt.id" 
        :value="opt.id"
      >
        {{ opt.label }}
      </option>
    </select>

    <AppFieldError v-if="invalid && errorMessage" :error-color="errorColor">
      {{ errorMessage }}
    </AppFieldError>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { AppLabel, AppFieldError } from '@/components/atoms'
import { ChevronDownIcon } from '@/icons'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    name?: string
    options?: any[]
    selectId?: string
    invalid?: boolean
    errorMessage?: string
    errorColor?: string
    disabled?: boolean
    placeholder?: string
  }>(),
  { options: () => [], disabled: false, placeholder: '' }
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const hasMismatch = ref(false)

const normalizedOptions = computed(() => {
  return props.options.map(opt => {
    if (typeof opt === 'object') {
      return {
        ...opt,
        id: opt.id ?? opt.value ?? opt.label,
        label: opt.label ?? opt.value ?? opt.id
      }
    }
    return { id: opt, label: opt }
  })
})

const isHex = (str: string) => /^#[0-9A-Fa-f]{3,8}$/.test(str)

const isColorSelect = computed(() => {
  if (normalizedOptions.value.length === 0) return false
  // Solo si el componente se llama 'color' o si todas las opciones son hex
  const isColorField = props.name?.toLowerCase().includes('color') || props.label?.toLowerCase().includes('color')
  return isColorField && normalizedOptions.value.every(opt => isHex(String(opt.label)))
})

const selectedOption = computed(() => {
  if (props.modelValue == null || props.modelValue === '') return null
  const val = String(props.modelValue).toLowerCase()
  
  // 1. Buscar por ID (comparación robusta)
  let found = normalizedOptions.value.find(opt => String(opt.id).toLowerCase() === val)
  
  // 2. Fallback: buscar por Label (si la tabla trajo el nombre en lugar del ID)
  if (!found) {
    found = normalizedOptions.value.find(opt => String(opt.label).toLowerCase() === val)
  }
  
  return found
})

const selectedColor = computed(() => {
  if (selectedOption.value && isHex(selectedOption.value.label)) {
    return selectedOption.value.label
  }
  return null
})

const selectedLabel = computed(() => {
  return selectedOption.value?.label ?? ''
})

const isActuallyDisabled = computed(() => {
  // Bloqueo si viene por prop o si hubo un error de coincidencia (mismatch)
  return props.disabled || hasMismatch.value
})

function selectOption(opt: any) {
  if (isActuallyDisabled.value) return
  emit('update:modelValue', String(opt.id))
  isOpen.value = false
}

// Cierre al hacer click fuera
const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

// Sincronización automática: Si el valor recibido no es el ID pero coincide con una opción (por label o tipo),
// lo normalizamos al ID oficial de la opción.
watch(() => props.modelValue, (newVal: any) => {
  if (newVal) {
    if (selectedOption.value) {
      hasMismatch.value = false
      // Si hay coincidencia (ID o Label), normalizamos al ID oficial
      if (String(selectedOption.value.id) !== String(newVal)) {
        emit('update:modelValue', selectedOption.value.id)
      }
    } else if (normalizedOptions.value.length > 0) {
      // Si NO hay coincidencia, tomamos la primera opción real del catálogo y bloqueamos
      hasMismatch.value = true
      emit('update:modelValue', normalizedOptions.value[0].id)
    }
  }
}, { immediate: true })
</script>

<style scoped>
.form-group { margin-bottom: 1.5rem; position: relative; }

/* Styles for both Selects */
.app-select, .premium-select__trigger {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--primary-color);
  border-radius: 0.5rem;
  color: var(--primary-color);
  background-color: #ffffff;
  outline: none;
  font: inherit;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
}

.premium-select__trigger--active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px var(--primary-bg-light, rgba(70, 95, 255, 0.12));
}

.app-select:disabled, .premium-select__trigger:disabled {
  background-color: #F3F4F6 !important;
  border-color: var(--primary-color) !important;
  cursor: not-allowed;
  opacity: 1;
}

.color-swatch {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid #e4e7ec;
  flex-shrink: 0;
}

.premium-select__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e4e7ec;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
}

.premium-select__option {
  padding: 0.6rem 0.75rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #344054;
  transition: background 0.2s;
}

.premium-select__option:hover { background: #f9fafb; }
.premium-select__option--selected { background: var(--primary-bg-light); color: var(--primary-color); }

.chevron-icon { width: 1.25rem; height: 1.25rem; transition: transform 0.2s; color: #98a2b3; }
.chevron-icon--rotated { transform: rotate(180deg); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }

/* Standard styles */
.app-select--invalid, .premium-select__trigger--invalid {
  border-color: var(--error-color, #dc3545);
  box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.12);
}
</style>
