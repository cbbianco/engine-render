<template>
  <div class="table-premium">
    <!-- Toolbar Section (Top Right) -->
    <div v-if="label || toolbar?.length" class="table-premium__toolbar-wrapper">
      <div class="table-premium__title-group">
        <h3 v-if="label" class="table-premium__title">{{ label }}</h3>
      </div>
      <ToolbarNative 
        v-if="toolbar?.length" 
        :items="toolbar" 
        @action="(btn) => handleAction(btn.action, {})" 
      />
    </div>

    <!-- Main Card -->
    <div class="table-premium__card">
      <!-- Search & Page Size Controls -->
      <div class="table-premium__controls">
        <div class="controls-search">
          <div class="search-wrapper">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="#667085" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input 
              v-model="searchTerm" 
              type="text" 
              placeholder="Buscar..." 
              class="search-input"
            />
          </div>
        </div>
        
        <div class="controls-entries">
          <span class="text-secondary">Show</span>
          <select v-model="pageSize" class="select-input">
            <option v-for="n in [10, 25, 50, 100]" :key="n" :value="n">{{ n }}</option>
          </select>
          <span class="text-secondary">entries</span>
        </div>
      </div>

      <!-- Table Content -->
      <div class="table-premium__wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th 
                v-for="(col, index) in columns" 
                :key="col.key || index" 
                class="data-table__th"
                :class="{ 'sortable': col.sortable !== false }"
                @click="toggleSort(col.key)"
              >
                <div class="header-content" :class="{ 'header-content--center': col.align === 'center', 'header-content--right': col.align === 'right' }">
                  {{ col.label }}
                  <span v-if="col.sortable !== false" class="sort-icons">
                    <svg 
                      width="8" height="8" viewBox="0 0 10 10" 
                      :class="['sort-up', { active: sortKey === col.key && sortOrder === 'asc' }]"
                    >
                      <path d="M5 2L1 7H9L5 2Z" fill="currentColor"/>
                    </svg>
                    <svg 
                      width="8" height="8" viewBox="0 0 10 10" 
                      :class="['sort-down', { active: sortKey === col.key && sortOrder === 'desc' }]"
                    >
                      <path d="M5 8L9 3H1L5 8Z" fill="currentColor"/>
                    </svg>
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          
          <tbody>
            <tr 
              v-for="(row, rowIndex) in paginatedRows" 
              :key="rowIndex" 
              class="data-table__tr"
            >
              <td 
                v-for="(col, index) in columns" 
                :key="col.key || index" 
                class="data-table__td"
              >
                <!-- Avatar Type -->
                <div v-if="col.type === 'avatar'" class="cell-avatar">
                  <div class="avatar-img-wrapper">
                    <img v-if="row[col.avatarKey || 'avatar']" :src="row[col.avatarKey || 'avatar']" class="avatar-img" />
                    <div v-else class="avatar-placeholder">{{ getInitials(row[col.key]) }}</div>
                  </div>
                  <span class="cell-text font-medium">{{ row[col.key] }}</span>
                </div>

                <!-- Badge Type -->
                <div v-else-if="col.type === 'badge'" class="cell-badge">
                  <span :class="['badge', getBadgeClass(row[col.key])]">
                    {{ row[col.key] }}
                  </span>
                </div>

                <!-- Action Type -->
                <div v-else-if="col.type === 'actions'" class="cell-actions">
                  <button class="action-btn action-btn--delete" @click.stop="handleAction('delete', row)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6m4-6v6"/></svg>
                  </button>
                  <button class="action-btn action-btn--edit" @click.stop="handleAction('edit', row)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                </div>

                <!-- Currency/Price Type -->
                <div v-else-if="col.type === 'price' || col.key === 'salary'" class="cell-text">
                  {{ formatCurrency(row[col.key]) }}
                </div>

                <!-- Default Text / Array Handling -->
                <div v-else class="cell-text">
                  <template v-if="Array.isArray(row[col.key])">
                    {{ row[col.key].join(', ') }}
                  </template>
                  <template v-else>
                    {{ row[col.key] }}
                  </template>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="paginatedRows.length === 0">
              <td :colspan="columns.length" class="data-table__empty">
                <div class="empty-state-content">
                  <div class="empty-icon-bg">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#344054" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="8" y1="15" x2="16" y2="15"></line>
                      <line x1="9" y1="9" x2="9.01" y2="9"></line>
                      <line x1="15" y1="9" x2="15.01" y2="9"></line>
                    </svg>
                  </div>
                  <div class="empty-texts">
                  <p class="empty-text" style="color: #1D2939 !important; opacity: 1 !important;">No se encontraron datos registrados</p>
                  <p class="empty-subtext" style="color: #475467 !important; opacity: 1 !important;">No hay información disponible para mostrar en esta tabla en este momento.</p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer: Pagination -->
      <div class="table-premium__footer">
        <div class="footer-info">
          Showing {{ paginationStart }} to {{ paginationEnd }} of {{ totalItems }} entries
        </div>
        <div class="pagination-controls">
          <button 
            :disabled="currentPage === 1" 
            class="page-btn page-btn--arrow" 
            @click="currentPage--"
          >
            Previous
          </button>
          
          <button 
            v-for="page in totalPages" 
            :key="page"
            :class="['page-btn', { active: currentPage === page }]"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          
          <button 
            :disabled="currentPage === totalPages || totalPages === 0" 
            class="page-btn page-btn--arrow" 
            @click="currentPage++"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ToolbarNative from '@/components/molecules/navigation/ToolbarNative.vue'

interface TableColumn {
  label: string
  key: string
  type?: 'text' | 'avatar' | 'badge' | 'actions' | 'price' | 'date'
  sortable?: boolean
  avatarKey?: string
  align?: 'left' | 'center' | 'right'
}

interface ActionBtn {
  label: string
  action: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'danger'
}

const props = withDefaults(
  defineProps<{
    label?: string
    modelValue?: any[] | { data: any[]; meta: any }
    columns?: TableColumn[]
    toolbar?: ActionBtn[]
  }>(),
  { modelValue: () => [], columns: () => [], toolbar: () => [] }
)

const emit = defineEmits(['update:modelValue', 'action'])

// State
const searchTerm = ref('')
const pageSize = ref(10)
const currentPage = ref(1)
const sortKey = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Reset page on search or page size change
watch([searchTerm, pageSize], () => {
  currentPage.value = 1
})

// Emit pagination change to orchestrator
watch([currentPage, pageSize], ([page, limit]) => {
  emit('action', { 
    type: 'pagination-change', 
    payload: { page, limit } 
  })
})

// Debugging
watch(() => props.modelValue, (newVal) => {
  console.log(`[TablePremium] Received modelValue for "${props.label}":`, newVal)
}, { immediate: true, deep: true })

// Normalized Data Access
const normalizedRows = computed(() => {
  // 1. Si no hay nada, array vacío
  if (props.modelValue == null) return []
  
  // 2. Si es un array directo, lo usamos
  if (Array.isArray(props.modelValue)) {
    return props.modelValue
  }

  // 3. Si es un objeto complejo (Estructura de Paginación o Modelo de Módulo)
  if (typeof props.modelValue === 'object') {
     const val = props.modelValue as any
     
     // a) Estructura estándar de paginación (.data)
     if (Array.isArray(val.data)) return val.data
     
     // b) Heurística para Módulos Premium (buscar por llaves comunes)
     // Si el componente se llama 'invoices_table', buscamos la llave 'invoices'
     if (Array.isArray(val.invoices)) return val.invoices
     if (Array.isArray(val.rows)) return val.rows
     if (Array.isArray(val.items)) return val.items
     
     // c) Fallback: buscar cualquier propiedad que sea un array y tenga datos
     for (const key in val) {
       if (Array.isArray(val[key]) && val[key].length > 0) {
         return val[key]
       }
     }
  }
  
  return []
})

const metaInfo = computed(() => {
  if (Array.isArray(props.modelValue)) return null
  return props.modelValue?.meta || null
})

// Logic
const filteredRows = computed(() => {
  let rows = [...normalizedRows.value]
  
  // Search
  if (searchTerm.value) {
    const query = searchTerm.value.toLowerCase()
    rows = rows.filter(row => 
      Object.values(row).some(val => 
        Array.isArray(val) 
          ? val.some(v => String(v).toLowerCase().includes(query))
          : String(val).toLowerCase().includes(query)
      )
    )
  }
  
  // Sort
  if (sortKey.value) {
    rows.sort((a, b) => {
      const valA = a[sortKey.value]
      const valB = b[sortKey.value]
      if (valA === valB) return 0
      const modifier = sortOrder.value === 'asc' ? 1 : -1
      return valA < valB ? -1 * modifier : 1 * modifier
    })
  }
  
  return rows
})

const totalItems = computed(() => {
  if (searchTerm.value) return filteredRows.value.length
  if (metaInfo.value?.total != null) return metaInfo.value.total
  return filteredRows.value.length
})

const totalPages = computed(() => {
  if (metaInfo.value?.lastPage != null) return metaInfo.value.lastPage
  return Math.ceil(totalItems.value / pageSize.value)
})

const paginatedRows = computed(() => {
  // Si hay búsqueda activa, priorizamos el filtrado local (UX consistente)
  if (searchTerm.value) {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredRows.value.slice(start, start + pageSize.value)
  }

  // Si la data ya viene paginada del servidor y NO estamos buscando, la respetamos tal cual
  if (metaInfo.value) return normalizedRows.value
  
  // Si no, hacemos paginación client-side estándar
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

const paginationStart = computed(() => {
  if (totalItems.value === 0) return 0
  if (metaInfo.value) {
    const page = metaInfo.value.page || 1
    return (page - 1) * pageSize.value + 1
  }
  return (currentPage.value - 1) * pageSize.value + 1
})

const paginationEnd = computed(() => {
  if (metaInfo.value) {
    return paginationStart.value + normalizedRows.value.length - 1
  }
  return Math.min(currentPage.value * pageSize.value, totalItems.value)
})

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

function handleAction(type: string, payload: any) {
  emit('action', { type, payload })
}

function getInitials(name: any): string {
  if (!name || typeof name !== 'string') return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

function getBadgeClass(status: any): string {
  const s = String(status).toLowerCase()
  if (s.includes('active') || s.includes('directo') || s.includes('paid')) return 'badge--success'
  if (s.includes('inactive') || s.includes('error') || s.includes('unpaid')) return 'badge--danger'
  if (s.includes('warning') || s.includes('proceso') || s.includes('assistant')) return 'badge--warning'
  return 'badge--default'
}

function formatCurrency(val: any): string {
  const num = Number(String(val).replace(/[^0-9.-]+/g, ''))
  if (isNaN(num)) return String(val)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
}
</script>

<style scoped>
.table-premium {
  width: 100%;
  font-family: 'Inter', sans-serif;
}

/* Toolbar */
.table-premium__toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-premium__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1D2939;
  margin: 0;
}

/* Card */
.table-premium__card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* Controls */
.table-premium__controls {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #E4E7EC;
  background: #ffffff;
}

.controls-search {
  flex: 1;
}

.search-wrapper {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

.search-input {
  width: 100%;
  height: 44px;
  padding: 0.5rem 1rem 0.5rem 3rem;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1D2939;
  outline: none;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0px 0px 0px 4px var(--primary-bg-light, rgba(70, 95, 255, 0.1));
}

.controls-entries {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #667085;
}

.select-input {
  height: 36px;
  padding: 0 0.5rem;
  border: 1px solid #D0D5DD;
  border-radius: 6px;
  background: #ffffff;
  color: #1D2939;
  outline: none;
  cursor: pointer;
}

/* Table */
.table-premium__wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table__th {
  padding: 20px 16px;
  background: #F9FAFB;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 400;
  color: #667085;
  border-bottom: 1px solid #E4E7EC;
  white-space: nowrap;
}

.data-table__th.sortable {
  cursor: pointer;
}

.data-table__empty {
  padding: 5rem 1.5rem;
  text-align: center;
  border-bottom: 1px solid #E4E7EC;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.empty-icon-bg {
  width: 56px;
  height: 56px;
  background: #F2F4F7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1D2939; /* Color oscuro para legibilidad */
  margin: 0;
}

.empty-subtext {
  font-size: 0.875rem;
  color: #667085; /* Gris medio */
  margin: 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.sort-icons {
  display: flex;
  flex-direction: column;
  gap: 0px;
}

.sort-up, .sort-down {
  color: #D0D5DD;
}

.sort-up.active, .sort-down.active {
  color: var(--primary-color);
}

.data-table__tr {
  transition: background 0.1s;
}

.data-table__tr:hover {
  background: #F9FAFB;
}

.data-table__td {
  padding: 16px;
  border-bottom: 1px solid #E4E7EC;
  vertical-align: middle;
}

.cell-text {
  font-size: 0.875rem;
  color: #1D2939;
}

.font-medium { font-weight: 500; }

/* Avatar */
.cell-avatar {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.avatar-img-wrapper {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  background: #F2F4F7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
}

/* Badge */
.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge--success { background: #ECFDF3; color: #027A48; }
.badge--danger { background: #FEF3F2; color: #B42318; }
.badge--warning { background: #FFFAEB; color: #B54708; }
.badge--default { background: #F2F4F7; color: #344054; }

/* Actions */
.cell-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  background: #ffffff;
  color: #667085;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
}

.action-btn:hover {
  background: #F9FAFB;
  color: #1D2939;
  border-color: #D0D5DD;
}

.action-btn--delete:hover {
  background: #FEF3F2;
  color: #F04438;
  border-color: #FDA29B;
}

/* Footer */
.table-premium__footer {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-info {
  font-size: 0.875rem;
  color: #667085;
}

.pagination-controls {
  display: flex;
  gap: 0.5rem;
}

.page-btn {
  height: 40px;
  min-width: 40px;
  padding: 0 0.875rem;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  background: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
  color: #344054;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background: #F9FAFB;
  border-color: #D0D5DD;
}

.page-btn.active {
  background: rgba(70, 95, 255, 0.08);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.text-secondary { color: #667085; }
</style>
