<template>
  <div class="product-table">
    <!-- Header: Search and Action Buttons -->
    <div class="product-table__header">
      <div class="product-table__search-wrapper">
        <div class="product-table__search-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <input 
          v-model="searchTerm" 
          type="text" 
          placeholder="Search..." 
          class="product-table__search-input"
        />
      </div>
      
      <div class="product-table__actions">
        <!-- Filter Button -->
        <button class="product-table__btn product-table__btn--filter">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"></path></svg>
          Filter
        </button>

        <!-- Export Button -->
        <button class="product-table__btn product-table__btn--export" @click="$emit('export')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export
        </button>
        
        <!-- Add Button -->
        <button class="product-table__btn product-table__btn--primary" @click="$emit('add')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-1"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Product
        </button>
      </div>
    </div>

    <!-- Table Content -->
    <div class="product-table__wrapper">
      <table class="product-table__table">
        <thead>
          <tr>
            <th class="product-table__th sm-hidden"><input type="checkbox" /></th>
            <th 
              v-for="(col, index) in columns" 
              :key="col.key || index" 
              class="product-table__th"
              :class="{ 'sm-hidden': col.key === 'id' }"
            >
              {{ col.label }}
              <span v-if="col.sortable" class="product-table__sort-icon">
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor"><path d="M4 1L1 4H7L4 1ZM4 11L7 8H1L4 11Z" fill="currentColor"/></svg>
              </span>
            </th>
            <th class="product-table__th"></th> <!-- Actions -->
          </tr>
        </thead>
        
        <tbody>
          <tr 
            v-for="(row, idx) in filteredRows" 
            :key="idx" 
            class="product-table__tr"
          >
            <td class="product-table__td sm-hidden"><input type="checkbox" /></td>
            
            <td 
              v-for="(col, index) in columns" 
              :key="col.key || index" 
              class="product-table__td"
              :class="{ 'sm-hidden': col.key === 'id' }"
            >
              <!-- Specialized Column: Product (Image + Label) -->
              <div v-if="col.type === 'product' || col.key === 'product' || col.key === 'name'" class="product-table__product-cell">
                <div class="product-table__thumbnail">
                  <img 
                    v-if="row[col.imageKey || 'image']" 
                    :src="row[col.imageKey || 'image']" 
                    :alt="row[col.key]" 
                    class="product-table__img"
                  />
                  <div v-else class="product-table__img-placeholder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"></polyline></svg>
                  </div>
                </div>
                <span class="product-table__label">{{ row[col.key] }}</span>
              </div>

              <!-- Badge Column: Stock / Status -->
              <div v-else-if="col.type === 'stock' || col.key === 'stock' || col.key === 'status'" class="product-table__badge-cell">
                <span :class="['product-table__badge', getStockBadgeClass(row[col.key])]">
                  {{ row[col.key] }}
                </span>
              </div>

              <!-- Price Column -->
              <div v-else-if="col.type === 'price' || col.key === 'price'" class="product-table__price-cell">
                {{ formatCurrency(row[col.key]) }}
              </div>

              <!-- Standard Text -->
              <div v-else class="product-table__text">
                {{ row[col.key] }}
              </div>
            </td>

            <td class="product-table__td product-table__td--actions">
              <div class="product-table__dropdown-container">
                <button 
                  class="product-table__dots" 
                  title="Más opciones"
                  @click.stop="toggleMenu(idx)"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
                
                <!-- Dropdown Menu -->
                <div v-if="activeMenuRow === idx" class="product-table__dropdown">
                  <button class="product-table__dropdown-item" @click="handleAction('view', row)">
                    View More
                  </button>
                  <button class="product-table__dropdown-item product-table__dropdown-item--danger" @click="handleAction('delete', row)">
                    Delete
                  </button>
                </div>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="filteredRows.length === 0">
            <td :colspan="columns.length + 2" class="product-table__empty">
              No products found
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface ProductColumn {
  label: string
  key: string
  type?: 'text' | 'product' | 'price' | 'stock' | 'date'
  imageKey?: string
  sortable?: boolean
}

const props = withDefaults(
  defineProps<{
    label?: string
    modelValue?: any[]
    columns?: ProductColumn[]
  }>(),
  { modelValue: () => [], columns: () => [] }
)

const emit = defineEmits(['update:modelValue', 'add', 'export', 'view', 'delete'])

const searchTerm = ref('')
const activeMenuRow = ref<number | null>(null)

function toggleMenu(idx: number) {
  activeMenuRow.value = activeMenuRow.value === idx ? null : idx
}

function handleAction(type: 'view' | 'delete', row: any) {
  // Emit the action for the parent to handle
  // @ts-ignore
  emit(type, row)
  activeMenuRow.value = null
}

// Close menu when clicking outside
const closeMenu = () => { activeMenuRow.value = null }
onMounted(() => { window.addEventListener('click', closeMenu) })
onUnmounted(() => { window.removeEventListener('click', closeMenu) })

const rows = computed(() => Array.isArray(props.modelValue) ? props.modelValue : [])

const filteredRows = computed(() => {
  if (!searchTerm.value) return rows.value
  const query = searchTerm.value.toLowerCase()
  return rows.value.filter(row => {
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(query)
    )
  })
})

function getStockBadgeClass(status: any): string {
  const s = String(status).toLowerCase().replace(/\s+/g, '')
  if (s === 'instock' || s === 'active' || s === 'available') return 'badge--success'
  if (s === 'outofstock' || s === 'inactive' || s === 'error') return 'badge--danger'
  return 'badge--default'
}

function formatCurrency(val: any): string {
  const num = Number(val)
  if (isNaN(num)) return String(val)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
}
</script>

<style scoped>
.product-table {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
  width: 100%;
}

.product-table__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .product-table__header {
    flex-direction: column;
    align-items: stretch;
  }
}

.product-table__search-wrapper {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.product-table__search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.product-table__search-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.875rem;
  color: #1c2434;
  outline: none;
  transition: all 0.2s;
}

.product-table__search-input:focus {
  background: #ffffff;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(60, 80, 224, 0.05);
}

.product-table__actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.product-table__btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e2e8f0;
}

.product-table__btn--filter, .product-table__btn--export {
  background: #ffffff;
  color: #64748b;
}

.product-table__btn--filter:hover, .product-table__btn--export:hover {
  background: #f1f5f9;
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.product-table__btn--primary {
  background: var(--primary-color);
  color: #ffffff;
  border-color: var(--primary-color);
}

.product-table__btn--primary:hover {
  background: var(--primary-hover);
  box-shadow: 0 4px 10px rgba(60, 80, 224, 0.25);
}

.product-table__wrapper {
  width: 100%;
  overflow-x: auto;
}

.product-table__table {
  width: 100%;
  border-collapse: collapse;
}

.product-table__th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #fcfcfd;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
}

.product-table__tr {
  background: #ffffff;
  transition: all 0.2s;
}

.product-table__tr:hover {
  background: #f8fafc;
}

.product-table__td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9375rem;
  color: #1c2434;
  vertical-align: middle;
}

.product-table__product-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.product-table__thumbnail {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 8px;
  overflow: hidden;
  background: #eff4fb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.product-table__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-table__img-placeholder {
  color: #cbd5e1;
}

.product-table__label {
  font-weight: 600;
  color: #1c2434;
}

.product-table__badge {
  display: inline-flex;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge--success {
  background: #eafbe7;
  color: #10b981;
}

.badge--danger {
  background: #fdeaea;
  color: #f23d3d;
}

.badge--default {
  background: #f1f5f9;
  color: #64748b;
}

.product-table__price-cell {
  font-weight: 600;
  color: #1c2434;
}

.product-table__td--actions {
  text-align: right;
  width: 60px;
}

.product-table__dropdown-container {
  position: relative;
  display: inline-block;
}

.product-table__dots {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-table__dots:hover {
  background: #eff4fb;
  color: var(--primary-color);
}

.product-table__dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 50;
  min-width: 160px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 0.5rem;
  margin-top: 0.25rem;
}

.product-table__dropdown-item {
  width: 100%;
  text-align: left;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.product-table__dropdown-item:hover {
  background: #f1f5f9;
  color: var(--primary-color);
}

.product-table__dropdown-item--danger:hover {
  background: #fdeaea;
  color: #f23d3d;
}

.product-table__empty {
  text-align: center;
  padding: 4rem;
  color: #94a3b8;
  font-style: italic;
}

@media (max-width: 640px) {
  .sm-hidden {
    display: none;
  }
}
</style>
