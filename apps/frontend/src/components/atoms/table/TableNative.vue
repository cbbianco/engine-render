<template>
  <div class="table-container">
    <div v-if="label" class="table-header">
      <h4 class="table-title">{{ label }}</h4>
    </div>
    
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr class="table-row table-row--header">
            <th 
              v-for="(col, index) in columns" 
              :key="col.key || index" 
              class="table-cell table-cell--header text-left"
              :style="{ minWidth: col.width || 'auto' }"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, rowIndex) in rows" 
            :key="rowIndex" 
            class="table-row table-row--body"
          >
            <td 
              v-for="(col, index) in columns" 
              :key="col.key || index" 
              class="table-cell table-cell--body"
            >
              <!-- Avatar Type -->
              <div v-if="col.type === 'avatar'" class="flex items-center gap-3">
                <div class="avatar-wrapper">
                  <img 
                    v-if="row[col.avatarKey || 'avatar']" 
                    :src="row[col.avatarKey || 'avatar']" 
                    :alt="row[col.key]" 
                    class="avatar-img"
                  />
                  <div v-else class="avatar-fallback">
                    {{ getInitials(row[col.key]) }}
                  </div>
                </div>
                <span class="text-sm font-medium text-black">{{ row[col.key] }}</span>
              </div>
              
              <!-- Status / Badge Type -->
              <div v-else-if="col.type === 'badge'" class="badge-wrapper">
                <span :class="['badge', getBadgeClass(row[col.key])]">
                  {{ row[col.key] }}
                </span>
              </div>
              
              <!-- Default Text -->
              <span v-else class="text-sm text-black">
                {{ row[col.key] }}
              </span>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td :colspan="columns.length" class="table-cell table-cell--empty">
              No hay datos disponibles
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TableColumn {
  label: string
  key: string
  type?: 'text' | 'avatar' | 'badge' | 'date'
  avatarKey?: string
  width?: string
}

const props = withDefaults(
  defineProps<{
    label?: string
    /** Los datos se pasan como modelValue (un array de objetos) */
    modelValue?: any[]
    /** La configuración de columnas viene del esquema 'config.columns' */
    columns?: TableColumn[]
  }>(),
  { modelValue: () => [], columns: () => [] }
)

const rows = computed(() => Array.isArray(props.modelValue) ? props.modelValue : [])

function getInitials(name: any): string {
  if (!name || typeof name !== 'string') return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

function getBadgeClass(status: any): string {
  const s = String(status).toLowerCase()
  if (s.includes('active') || s.includes('success') || s.includes('pagado')) return 'badge--success'
  if (s.includes('inactive') || s.includes('error') || s.includes('pendiente')) return 'badge--danger'
  if (s.includes('warning') || s.includes('proceso')) return 'badge--warning'
  return 'badge--default'
}
</script>

<style scoped>
.table-container {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.table-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.table-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1c2434;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.table-row {
  transition: background-color 0.2s;
}

.table-row--header {
  background-color: #f7f9fc;
}

.table-row--body:hover {
  background-color: #f1f5f9;
}

.table-cell {
  padding: 1rem 1.5rem;
  white-space: nowrap;
}

.table-cell--header {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.table-cell--body {
  border-bottom: 1px solid #eeeeee;
}

.table-cell--empty {
  text-align: center;
  color: #64748b;
  padding: 3rem;
  font-style: italic;
}

/* Avatar Styles */
.avatar-wrapper {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  background-color: #eff4fb;
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

.avatar-fallback {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
}

/* Badge Styles */
.badge {
  display: inline-flex;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge--success { background-color: #eafbe7; color: #10b981; }
.badge--danger { background-color: #fdeaea; color: #f23d3d; }
.badge--warning { background-color: #fff8e6; color: #ffa70b; }
.badge--default { background-color: #f1f5f9; color: #64748b; }

/* Utilities */
.flex { display: flex; }
.items-center { align-items: center; }
.gap-3 { gap: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-left { text-align: left; }
.font-medium { font-weight: 500; }
.text-black { color: #1c2434; }
</style>
