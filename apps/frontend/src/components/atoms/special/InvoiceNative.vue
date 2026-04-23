<template>
  <div class="invoice-premium-card">
    <!-- Header: Title and ID -->
    <div class="invoice-header">
      <h2 class="invoice-title">Invoice</h2>
      <div class="invoice-id">
        <span class="label">ID:</span>
        <span class="value">#{{ data.invoiceId || '348' }}</span>
      </div>
    </div>

    <!-- Info Grid: From and To -->
    <div class="invoice-info-grid">
      <div class="info-column">
        <div class="info-section">
          <span class="section-label">From</span>
          <h4 class="company-name">{{ data.from?.name || 'Pimjo LLC' }}</h4>
          <p class="address-text">
            {{ data.from?.address || '1280, Clair Street, Massachusetts, New York - 02543' }}<br>
            {{ data.from?.email || 'contact@pimjo.com' }}
          </p>
        </div>
        <div class="info-section mt-16">
          <span class="section-label">Issued On:</span>
          <p class="date-text">{{ data.issuedDate || '11 March, 2027' }}</p>
        </div>
      </div>

      <!-- Vertical Divider -->
      <div class="vertical-divider"></div>

      <div class="info-column pl-24 text-right">
        <div class="info-section">
          <span class="section-label text-right">To</span>
          <h4 class="company-name text-right">{{ data.to?.name || 'Albert Ward' }}</h4>
          <p class="address-text text-right">
            {{ data.to?.address || '355, Shobe Lane, Colorado, Fort Collins - 80543' }}<br>
            {{ data.to?.email || 'albert.ward@example.com' }}
          </p>
        </div>
        <div class="info-section mt-16 text-right">
          <span class="section-label text-right">Due On:</span>
          <p class="date-text text-right">{{ data.dueDate || '16 March, 2027' }}</p>
        </div>
      </div>
    </div>

    <!-- Products Table -->
    <div class="invoice-table-wrapper">
      <table class="invoice-table">
        <thead>
          <tr>
            <th class="col-num">S.No.#</th>
            <th class="col-product">Products</th>
            <th class="col-center">Quantity</th>
            <th class="col-price">Unit Cost</th>
            <th class="col-center">Discount</th>
            <th class="col-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in data.items" :key="idx">
            <td class="col-num">{{ Number(idx) + 1 }}</td>
            <td class="col-product-name">{{ item.name }}</td>
            <td class="col-center">{{ item.quantity }}</td>
            <td class="col-price">${{ item.unitCost }}</td>
            <td class="col-center">{{ item.discount }}</td>
            <td class="col-right-bold">${{ item.total }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Order Summary -->
    <div class="invoice-summary">
      <div class="summary-container">
        <h4 class="summary-title">Order summary</h4>
        <div class="summary-row">
          <span class="summary-label">Sub Total</span>
          <span class="summary-value">${{ data.summary?.subTotal || '3,850' }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Vat ({{ data.summary?.vatRate || '10%' }}):</span>
          <span class="summary-value">${{ data.summary?.vatAmount || '385' }}</span>
        </div>
        <div class="summary-total-row">
          <span class="total-label">Total</span>
          <span class="total-value-premium">${{ data.summary?.total || '4,235' }}</span>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="invoice-footer">
      <button class="btn-proceed">Proceed to payment</button>
      <button class="btn-print">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.1437 13.9219H14.175V15.5531C14.175 16.1437 13.6969 16.6219 13.1062 16.6219H4.89375C4.30312 16.6219 3.825 16.1437 3.825 15.5531V13.9219H1.85625C0.84375 13.9219 0 13.0781 0 12.0656V6.15937C0 5.14688 0.84375 4.30312 1.85625 4.30312H3.825V2.44687C3.825 1.85625 4.30312 1.37812 4.89375 1.37812H13.1062C13.6969 1.37812 14.175 1.85625 14.175 2.44687V4.30312H16.1437C17.1562 4.30312 18 5.14688 18 6.15937V12.0656C18 13.0781 17.1562 13.9219 16.1437 13.9219ZM12.7125 2.86875H5.2875V4.30312H12.7125V2.86875ZM12.7125 15.1594V11.2781H5.2875V15.1594H12.7125ZM16.3688 5.7375H1.63125C1.40625 5.7375 1.29375 5.85 1.29375 6.075V12.0375C1.29375 12.2625 1.40625 12.375 1.63125 12.375H3.825V10.7437C3.825 10.1531 4.30312 9.675 4.89375 9.675H13.1062C13.6969 9.675 14.175 10.1531 14.175 10.7437V12.375H16.1437C16.3688 12.375 16.4812 12.2625 16.4812 12.0375V6.075C16.5094 5.85 16.3688 5.7375 16.3688 5.7375Z" fill="white"/>
        </svg>
        Print
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue?: any
}>()

const emit = defineEmits(['action'])

const dummyData = {
  invoiceId: '348',
  from: {
    name: 'Pimjo LLC',
    address: '1280, Clair Street, Massachusetts, New York - 02543',
    email: 'contact@pimjo.com'
  },
  to: {
    name: 'Albert Ward',
    address: '355, Shobe Lane, Colorado, Fort Collins - 80543',
    email: 'albert.ward@example.com'
  },
  issuedDate: '11 March, 2027',
  dueDate: '16 March, 2027',
  items: [
    { name: 'Macbook pro 13"', quantity: 1, unitCost: 1200, discount: '0%', total: 1200 },
    { name: 'Apple Watch Ultra', quantity: 1, unitCost: 300, discount: '50%', total: 150 },
    { name: 'iPhone 15 Pro Max', quantity: 3, unitCost: 800, discount: '0%', total: 2400 },
    { name: 'iPad Pro 3rd Gen', quantity: 1, unitCost: 900, discount: '0%', total: 900 }
  ],
  summary: {
    subTotal: '4,650',
    vatRate: '10%',
    vatAmount: '465',
    total: '5,115'
  }
}

const data = computed(() => {
  if (!props.modelValue || Object.keys(props.modelValue).length === 0) {
    return dummyData
  }
  return props.modelValue
})

function handleAction(type: string) {
  emit('action', { type, payload: data.value })
}
</script>

<style scoped>
/* Pixel-Perfect Vanilla CSS (Single Invoice) */
.invoice-premium-card {
  background-color: #ffffff;
  border: 1px solid #E4E7EC;
  border-radius: 16px;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #344054;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.invoice-header {
  padding: 20px 24px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.invoice-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.invoice-id {
  display: flex;
  gap: 8px;
  align-items: center;
}

.invoice-id .label {
  font-size: 14px;
  font-weight: 500;
  color: #344054;
}

.invoice-id .value {
  font-size: 16px;
  font-weight: 500;
  color: #1D2939;
}

.invoice-info-grid {
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  align-items: stretch;
}

.info-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.vertical-divider {
  background-color: #E4E7EC;
  width: 1px;
}

.section-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #344054;
  margin-bottom: 8px;
  text-transform: capitalize;
}

.company-name {
  font-size: 16px;
  font-weight: 600;
  color: #1D2939;
  margin: 0 0 6px 0;
}

.address-text {
  font-size: 14px;
  color: #667085;
  line-height: 1.5;
  margin: 0;
}

.date-text {
  font-size: 14px;
  color: #344054;
  font-weight: 400;
  margin: 0;
}

.mt-16 { margin-top: 16px; }
.pl-24 { padding-left: 24px; }
.text-right { text-align: right; }

.invoice-table-wrapper {
  padding: 0 24px;
  margin-bottom: 32px;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.invoice-table thead tr {
  background-color: #F9FAFB;
  border-bottom: 1px solid #F2F4F7;
}

.invoice-table th {
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #344054;
}

.invoice-table td {
  padding: 12px 20px;
  font-size: 14px;
  color: #667085;
  border-bottom: 0px solid transparent; /* Bordes invisibles como en el demo */
}

.col-num { width: 60px; }
.col-product-name { font-weight: 500; color: #1D2939; }
.col-center { text-align: center; }
.col-price { width: 100px; }
.col-right { text-align: right; width: 100px; }
.col-right-bold { text-align: right; font-weight: 600; color: #1D2939; width: 100px; }

.invoice-summary {
  padding: 0 24px;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 32px;
}

.summary-container {
  width: 100%;
  max-width: 200px;
}

.summary-title {
  font-size: 16px;
  font-weight: 500;
  color: #1D2939;
  margin: 0 0 12px 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.summary-label {
  font-size: 14px;
  color: #667085;
}

.summary-value {
  font-size: 14px;
  font-weight: 500;
  color: #1D2939;
}

.summary-total-row {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E4E7EC;
}

.total-label {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.total-value-premium {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
}

.invoice-footer {
  padding: 24px;
  border-top: 1px solid #E4E7EC;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-proceed {
  background-color: #ffffff;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #344054;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-proceed:hover {
  background-color: #F9FAFB;
}

.btn-print {
  background-color: var(--primary-color);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-print:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .invoice-info-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .vertical-divider { display: none; }
  .pl-24 { padding-left: 0; }
  .text-right { text-align: left; }
  .section-label.text-right, .company-name.text-right, .address-text.text-right, .date-text.text-right {
    text-align: left;
  }
}
</style>
