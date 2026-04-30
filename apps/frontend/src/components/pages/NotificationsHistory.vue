<template>
  <div class="notifications-history-page">
    <div class="header">
      <h2>Historial de Notificaciones</h2>
      <p>Visualiza tus notificaciones de los últimos 7 días y personaliza sus colores.</p>
    </div>

    <div class="settings-panel">
      <h3>Personalizar Colores</h3>
      <div class="color-pickers">
        <div class="color-item" v-for="type in notificationTypes" :key="type.value">
          <label :for="type.value">{{ type.label }}</label>
          <input 
            type="color" 
            :id="type.value" 
            v-model="localColors[type.value]"
            @change="saveColors"
          />
        </div>
        <button class="reset-btn app-button--secondary" @click="resetColors">Restaurar por defecto</button>
      </div>
    </div>

    <div class="history-panel">
      <div class="history-panel-header">
        <h3>Últimos 7 Días</h3>
        <div class="user-filter">
          <label for="user-select" class="user-filter-label">Usuario</label>
          <div class="select-wrapper">
            <select id="user-select" v-model="selectedUser" class="blue-select">
              <option value="all">Todos los Usuarios</option>
              <option value="user1">Usuario 1</option>
              <option value="user2">Usuario 2</option>
            </select>
          </div>
        </div>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="data-table__th">Tipo</th>
              <th class="data-table__th">Título</th>
              <th class="data-table__th">Mensaje</th>
              <th class="data-table__th">Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="notif in paginatedNotifications" :key="notif.id" class="data-table__tr">
              <td class="data-table__td">
                <span 
                  class="type-badge" 
                  :style="{ backgroundColor: getBadgeColor(notif.type) + '20', color: getBadgeColor(notif.type), border: `1px solid ${getBadgeColor(notif.type)}` }"
                >
                  {{ notif.type }}
                </span>
              </td>
              <td class="data-table__td"><span class="cell-text font-medium">{{ notif.title }}</span></td>
              <td class="data-table__td"><span class="cell-text">{{ notif.message }}</span></td>
              <td class="data-table__td"><span class="cell-text">{{ new Date(notif.timestamp).toLocaleString() }}</span></td>
            </tr>
            <tr v-if="notificationStore.notifications.length === 0">
              <td colspan="4" class="data-table__empty">No hay notificaciones recientes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination" v-if="totalPages > 1">
        <button class="app-button--secondary" :disabled="currentPage === 1" @click="currentPage--">Anterior</button>
        <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
        <button class="app-button--secondary" :disabled="currentPage === totalPages" @click="currentPage++">Siguiente</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch, computed } from 'vue'
import { useNotificationStore } from '@/stores/notifications'

const notificationStore = useNotificationStore()

const selectedUser = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const filteredNotifications = computed(() => {
  let list = notificationStore.notifications
  // En un caso real, filtraríamos aquí si selectedUser !== 'all' y si existiera el userId
  return list
})

const totalPages = computed(() => {
  return Math.ceil(filteredNotifications.value.length / itemsPerPage.value) || 1
})

const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredNotifications.value.slice(start, end)
})

watch(selectedUser, () => {
  currentPage.value = 1
})

const notificationTypes = [
  { value: 'success', label: 'Éxito', default: '#10B981' },
  { value: 'error', label: 'Error', default: '#EF4444' },
  { value: 'warning', label: 'Advertencia', default: '#F59E0B' },
  { value: 'info', label: 'Información', default: '#3B82F6' },
  { value: 'tagueo', label: 'Mención', default: '#10B981' },
]

const localColors = reactive<Record<string, string>>({
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  tagueo: '#10B981',
})

onMounted(async () => {
  await notificationStore.loadHistory()
  const currentCustom = notificationStore.customColors
  notificationTypes.forEach(t => {
    if (currentCustom[t.value]) {
      localColors[t.value] = currentCustom[t.value]
    }
  })
})

const getBadgeColor = (type: string) => {
  return localColors[type] || notificationTypes.find(t => t.value === type)?.default || '#333'
}

const saveColors = () => {
  notificationStore.saveConfig(localColors)
}

const resetColors = () => {
  notificationTypes.forEach(t => {
    localColors[t.value] = t.default
  })
  saveColors()
}
</script>

<style scoped>
.notifications-history-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.header h2 {
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.header p {
  color: #64748b;
}

.settings-panel {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.settings-panel h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #334155;
}

.color-pickers {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
}

.color-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.color-item label {
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
  text-transform: capitalize;
}

.color-item input[type="color"] {
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  background: transparent;
}

.reset-btn {
  margin-left: auto;
}

.history-panel {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.history-panel h3 {
  margin-top: 0;
  margin-bottom: 0;
  font-size: 1.1rem;
  color: #334155;
}

.history-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.user-filter {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-filter-label {
  color: #0000ff;
  font-weight: 600;
  font-size: 0.875rem;
}

.select-wrapper {
  position: relative;
}

.blue-select {
  appearance: none;
  background-color: white;
  border: 1px solid #0000ff;
  border-radius: 6px;
  color: #0000ff;
  padding: 0.5rem 2rem 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  min-width: 200px;
}

.select-wrapper::after {
  content: '▼';
  font-size: 0.6rem;
  color: #0000ff;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.app-button--secondary {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #465FFF;
  background: white;
  color: #465FFF;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.app-button--secondary:hover:not(:disabled) {
  background: rgba(70, 95, 255, 0.05);
}

.app-button--secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.page-info {
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
}

@media (max-width: 768px) {
  .history-panel-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .blue-select {
    width: 100%;
  }
  
  .color-pickers {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .reset-btn {
    margin-left: 0;
    width: 100%;
  }
}

.table-container {
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
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
  font-weight: 500;
  color: #667085;
  border-bottom: 1px solid #E4E7EC;
  white-space: nowrap;
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

.data-table__empty {
  padding: 5rem 1.5rem;
  text-align: center;
  border-bottom: 1px solid #E4E7EC;
  color: #94a3b8;
}

.cell-text {
  font-size: 0.875rem;
  color: #1D2939;
}

.font-medium {
  font-weight: 500;
}

.type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}
</style>
