<template>
  <div class="invoice-list-premium">
    <!-- Overview Section (Cards) -->
    <div class="overview-container">
      <div class="overview-header">
        <h3 class="overview-title">Overview</h3>
        <button class="btn-create" @click="handleAction('create-invoice')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Create an Invoice
        </button>
      </div>
      <div class="overview-grid">
        <div class="overview-card border-r">
          <span class="card-label">Overdue</span>
          <h2 class="card-value">${{ displayData?.overview?.overdue || '0.00' }}</h2>
        </div>
        <div class="overview-card border-r">
          <span class="card-label">Due within next 30 days</span>
          <h2 class="card-value">${{ displayData?.overview?.dueNext30 || '0.00' }}</h2>
        </div>
        <div class="overview-card border-r">
          <span class="card-label">Average time to get paid</span>
          <h2 class="card-value">{{ displayData?.overview?.avgPaidTime || '0 days' }}</h2>
        </div>
        <div class="overview-card">
          <span class="card-label">Upcoming Payout</span>
          <h2 class="card-value">${{ displayData?.overview?.upcomingPayout || '0.00' }}</h2>
        </div>
      </div>
    </div>

    <!-- Main List Card -->
    <div class="list-card">
      <div class="list-header">
        <div class="header-left">
          <h3 class="list-title">Invoices</h3>
          <p class="list-subtitle">Your most recent invoices list</p>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="table-controls">
        <div class="tab-filters">
          <button 
            v-for="tab in ['All Invoices', 'Unpaid', 'Draft']" 
            :key="tab"
            :class="['tab-btn', { active: statusFilter === tab }]"
            @click="statusFilter = tab"
          >
            {{ tab }}
          </button>
        </div>
        <div class="action-group">
          <div class="search-wrapper">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search..." 
              class="search-input"
            >
          </div>
          <button class="control-btn" @click="handleAction('filter')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            Filter
          </button>
          <button class="control-btn" @click="handleAction('export')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Export
          </button>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-wrapper">
        <table class="invoice-table">
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" class="accent-brand" @change="toggleAll"></th>
              <th class="col-id">Invoice Number</th>
              <th class="col-customer">
                <div class="header-sort">Customer <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></svg></div>
              </th>
              <th class="col-date">
                <div class="header-sort">Creation Date <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></svg></div>
              </th>
              <th class="col-date">
                <div class="header-sort">Due Date <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></svg></div>
              </th>
              <th class="col-total">Total</th>
              <th class="col-status">Status</th>
              <th class="col-actions"></th>
            </tr>
          </thead>
          <tbody v-if="filteredInvoices.length > 0">
            <tr v-for="invoice in filteredInvoices" :key="invoice.id" 
                @click="handleRowClick(invoice)"
                class="clickable-row">
              <td @click.stop><input type="checkbox" class="accent-brand" :checked="selectedRows.has(invoice.id)" @change="toggleRow(invoice.id)"></td>
              <td class="font-normal text-dark">{{ invoice.id }}</td>
              <td class="font-medium text-dark">{{ invoice.customer }}</td>
              <td>{{ invoice.creationDate }}</td>
              <td>{{ invoice.dueDate }}</td>
              <td class="font-medium text-dark">${{ invoice.total }}</td>
              <td>
                <span class="status-badge" :class="invoice.status.toLowerCase()">
                  {{ invoice.status }}
                </span>
              </td>
              <td class="text-right" @click.stop style="position: relative;">
                <button class="dots-btn" @click="toggleMenu(invoice.id)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                </button>
                <!-- Row Action Menu -->
                <div v-if="activeMenuId === invoice.id" class="row-action-menu">
                  <button @click="handleAction('view-more', invoice)">View More</button>
                  <button class="delete-action" @click="handleAction('delete', invoice)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="filteredInvoices.length === 0" class="empty-state">
          <div class="empty-icon-wrapper">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E2E8F0" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
              <circle cx="12" cy="12" r="10" opacity="0.1" fill="currentColor"></circle>
            </svg>
          </div>
          <h4 class="empty-title">No hay facturas disponibles</h4>
          <p class="empty-text">Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.</p>
          <button class="btn-create btn-create--outline" @click="statusFilter = 'All Invoices'; searchQuery = ''">
            Limpiar filtros
          </button>
        </div>
      </div>

      <!-- Pagination Premium -->
      <div v-if="filteredInvoices.length > 0" class="pagination-footer">
        <div class="pagination-info">
          Showing 1 to {{ filteredInvoices.length }} of {{ displayData?.invoices?.length || 0 }}
        </div>
        <div class="pagination-controls">
          <button class="page-arrow prev"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>
          <button class="page-num active">1</button>
          <button class="page-num hoverable">2</button>
          <button class="page-num hoverable">3</button>
          <button class="page-arrow next"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue?: any
  actions?: any
}>()

const emit = defineEmits(['action', 'update:modelValue'])

const searchQuery = ref('')
const statusFilter = ref('All Invoices')
const activeMenuId = ref<string | null>(null)
const selectedRows = ref(new Set<string>())

const DUMMY_DATA = {
  overview: {
    overdue: '120.80',
    dueNext30: '0.00',
    avgPaidTime: '24 days',
    upcomingPayout: '3,450.50'
  },
  invoices: [
    { id: '#INV-00124', customer: 'Adela Gamez', creationDate: 'Oct 2, 2023', dueDate: 'Oct 15, 2023', total: '1,450.00', status: 'Paid' },
    { id: '#INV-00125', customer: 'Juan Perez', creationDate: 'Oct 5, 2023', dueDate: 'Oct 20, 2023', total: '2,300.50', status: 'Unpaid' },
    { id: '#INV-00126', customer: 'Maria Lopez', creationDate: 'Oct 10, 2023', dueDate: 'Oct 25, 2023', total: '780.00', status: 'Draft' },
    { id: '#INV-00127', customer: 'TechFlow Solutions', creationDate: 'Oct 12, 2023', dueDate: 'Nov 1, 2023', total: '5,000.00', status: 'Paid' }
  ]
}

const displayData = computed(() => {
  const isDataEmpty = !props.modelValue || !props.modelValue.invoices || props.modelValue.invoices.length === 0
  return isDataEmpty ? DUMMY_DATA : props.modelValue
})

const filteredInvoices = computed(() => {
  const base = displayData.value.invoices || []
  return base.filter((inv: any) => {
    const matchesSearch = !searchQuery.value || 
      inv.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      inv.customer.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = statusFilter.value === 'All Invoices' || 
      inv.status.toLowerCase() === statusFilter.value.toLowerCase()
      
    return matchesSearch && matchesStatus
  })
})

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function handleAction(type: string, payload: any = {}) {
  activeMenuId.value = null
  emit('action', { type, payload })
}

function handleRowClick(invoice: any) {
  handleAction('row-click', invoice)
}

function toggleRow(id: string) {
  if (selectedRows.value.has(id)) {
    selectedRows.value.delete(id)
  } else {
    selectedRows.value.add(id)
  }
}

function toggleAll(event: any) {
  if (event.target.checked) {
    filteredInvoices.value.forEach((inv: any) => selectedRows.value.add(inv.id))
  } else {
    selectedRows.value.clear()
  }
}
</script>

<style scoped>
.invoice-list-premium {
  font-family: 'Inter', sans-serif;
  color: #1D2939;
  padding: 0;
  background: transparent;
  min-height: 100%;
}

/* Overview Section */
.overview-container {
  position: relative;
  margin-bottom: 32px;
  background-color: #ffffff;
  border: 1px solid #E4E7EC;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08);
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.overview-title {
  font-size: 18px;
  font-weight: 700;
  color: #1D2939;
  margin: 0;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background-color: #ffffff;
  border: 1px solid #E4E7EC;
  border-radius: 12px;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .overview-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 640px) {
  .overview-grid { grid-template-columns: 1fr; }
}

.overview-card {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.border-r { border-right: 1px solid #E4E7EC; }

.card-label {
  font-size: 13px;
  color: #98A2B3;
  font-weight: 500;
  margin-bottom: 4px;
  text-transform: capitalize;
}

.card-value {
  font-size: 34px;
  font-weight: 700;
  color: #1D2939;
  margin: 0;
  letter-spacing: -0.5px;
}

.create-btn-wrapper {
  display: none; /* Already integrated in header */
}

.btn-create {
  background-color: var(--primary-color);
  color: #ffffff;
  border: 1px solid var(--primary-color);
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05);
}

.btn-create:hover {
  background-color: #3549D3;
  border-color: #3549D3;
}

.btn-create--outline {
  background: transparent;
  color: var(--primary-color);
  box-shadow: none;
  margin: 0 auto;
}

.btn-create--outline:hover {
  background: #EFF6FF;
}

/* List Card */
.list-card {
  background-color: #ffffff;
  border: 1px solid #E4E7EC;
  border-radius: 16px;
  box-shadow: 0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08);
}

.list-header {
  padding: 24px 32px;
  border-bottom: 1px solid #E4E7EC;
}

.list-title {
  font-size: 18px;
  font-weight: 600;
  color: #1D2939;
  margin: 0;
}

.list-subtitle {
  font-size: 14px;
  color: #667085;
  margin: 4px 0 0 0;
}

/* Controls */
.table-controls {
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

@media (max-width: 900px) {
  .table-controls { flex-direction: column; align-items: stretch; }
}

.tab-filters {
  background-color: #F9FAFB;
  padding: 4px;
  border-radius: 8px;
  display: flex;
  gap: 2px;
  border: 1px solid #F2F4F7;
}

.tab-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #667085;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background-color: #ffffff;
  color: #1D2939;
  box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.06), 0px 1px 3px rgba(16, 24, 40, 0.1);
}

.action-group {
  display: flex;
  gap: 12px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
}

.search-input {
  border: 1px solid #E4E7EC;
  border-radius: 8px;
  padding: 10px 14px 10px 40px;
  font-size: 14px;
  width: 240px;
  background: #ffffff;
  transition: all 0.2s;
  color: #1D2939;
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0px 0px 0px 4px rgba(70, 95, 255, 0.1);
  outline: none;
}

.control-btn {
  background-color: #ffffff;
  border: 1px solid #E4E7EC;
  border-radius: 8px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #344054;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background-color: #F9FAFB;
}

/* Table */
.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
}

.invoice-table th {
  padding: 12px 32px;
  text-align: left;
  font-size: 12px;
  font-weight: 500;
  color: #475467;
  text-transform: none;
  letter-spacing: normal;
  border-bottom: 1px solid #E4E7EC;
  background-color: #F9FAFB;
}

.header-sort {
  display: flex;
  align-items: center;
  gap: 4px;
}

.invoice-table td {
  padding: 16px 32px;
  font-size: 14px;
  color: #475467;
  border-bottom: 1px solid #E4E7EC;
}

.invoice-table tr.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.invoice-table tr.clickable-row:hover {
  background-color: #F9FAFB;
}

.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.text-dark { color: #1D2939; }

/* Status Badges */
.status-badge {
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.status-badge.paid { background-color: #ECFDF3; color: #027A48; }
.status-badge.unpaid { background-color: #FEF3F2; color: #D92D20; }
.status-badge.draft { background-color: #F2F4F7; color: #475467; }

.dots-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.dots-btn:hover {
  background: #F2F4F7;
}

/* Empty State */
.empty-state {
  padding: 64px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-icon-wrapper {
  background: #F9FAFB;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #1D2939;
  margin: 0;
}

.empty-text {
  font-size: 14px;
  color: #667085;
  max-width: 320px;
  margin: 0 auto 12px;
  line-height: 1.5;
}

/* Row Action Menu */
.row-action-menu {
  position: absolute;
  right: 48px;
  top: 48px;
  background: #ffffff;
  border: 1px solid #E4E7EC;
  border-radius: 12px;
  box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  padding: 4px;
}

.row-action-menu button {
  padding: 10px 12px;
  text-align: left;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: #344054;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.row-action-menu button:hover {
  background-color: #F9FAFB;
  color: var(--primary-color);
}

.row-action-menu .delete-action {
  color: #D92D20;
}

.row-action-menu .delete-action:hover {
  background-color: #FEF3F2;
  color: #D92D20;
}

/* Pagination Footer */
.pagination-footer {
  padding: 16px 32px;
  border-top: 1px solid #E4E7EC;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-info {
  font-size: 14px;
  color: #475467;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  gap: 4px;
}

.page-arrow, .page-num {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #344054;
  font-weight: 500;
  transition: all 0.2s;
}

.page-num.active {
  background-color: var(--primary-color);
  color: #fff;
}

.page-num.hoverable:hover, .page-arrow:hover {
  background-color: var(--primary-color);
  color: #fff;
}

.page-arrow {
  border: 1px solid #E4E7EC;
}

.accent-brand {
  accent-color: var(--primary-color);
  width: 18px;
  height: 18px;
  cursor: pointer;
}
</style>

