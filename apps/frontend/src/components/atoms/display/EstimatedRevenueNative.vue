<template>
  <div class="card-estimated-revenue">
    <div class="card-header">
      <div class="header-content">
        <h3 class="card-title">{{ title }}</h3>
        <p class="card-subtitle">{{ subtitle }}</p>
      </div>
      <button class="options-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="12" cy="5" r="1"></circle>
          <circle cx="12" cy="19" r="1"></circle>
        </svg>
      </button>
    </div>

    <div class="gauge-container">
      <div class="gauge-chart">
        <svg viewBox="0 0 200 120" class="gauge-svg">
          <!-- Background arc -->
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#F1F5F9"
            stroke-width="12"
            stroke-linecap="round"
          />
          <!-- Active arc -->
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="var(--primary-color)"
            stroke-width="12"
            stroke-linecap="round"
            :style="{ strokeDasharray: circumference, strokeDashoffset: dashOffset }"
          />
        </svg>
        <div class="gauge-text">
          <span class="gauge-label">{{ goalLabel }}</span>
          <span class="gauge-value">{{ goalValue }}</span>
        </div>
      </div>
    </div>

    <div class="revenue-list">
      <div v-for="(item, idx) in breakdown" :key="idx" class="revenue-item">
        <div class="item-info">
          <span class="item-label">{{ item.label }}</span>
          <span class="item-amount">{{ item.amount }}</span>
        </div>
        <div class="item-progress-wrap">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: item.percentage + '%', backgroundColor: item.color || 'var(--primary-color)' }"></div>
          </div>
          <span class="item-percentage">{{ item.percentage }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue?: any
  config?: any
}>()

// Default values if not provided in modelValue or config
const title = computed(() => props.config?.title || 'Estimated Revenue')
const subtitle = computed(() => props.config?.subtitle || "Target you've set for each month")
const goalLabel = computed(() => props.modelValue?.goalLabel || 'June Goals')
const goalValue = computed(() => props.modelValue?.goalValue || '$90')
const fillPercentage = computed(() => props.modelValue?.fillPercentage || 75) // For the gauge

const breakdown = computed(() => props.modelValue?.breakdown || [
  { label: 'Marketing', amount: '$30,569.00', percentage: 85, color: 'var(--primary-color)' },
  { label: 'Sales', amount: '$20,486.00', percentage: 55, color: '#3B82F6' }
])

// SVG Gauge logic: Arc length = PI * R = 3.14159 * 80 = 251.32
const circumference = 251.32
const dashOffset = computed(() => {
  const p = Math.min(Math.max(fillPercentage.value, 0), 100)
  return circumference * (1 - p / 100)
})
</script>

<style scoped>
.card-estimated-revenue {
  background: white;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  font-family: 'Inter', sans-serif;
  color: #1E293B;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
}

.card-subtitle {
  font-size: 0.8125rem;
  color: #64748B;
  margin: 0.25rem 0 0 0;
}

.options-btn {
  background: transparent;
  border: none;
  color: #64748B;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.options-btn:hover {
  background: #F1F5F9;
}

.gauge-container {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.gauge-chart {
  position: relative;
  width: 100%;
  max-width: 280px;
}

.gauge-svg {
  width: 100%;
  height: auto;
  transform: rotate(0deg);
}

.gauge-text {
  position: absolute;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gauge-label {
  font-size: 0.75rem;
  color: #64748B;
  margin-bottom: 0.25rem;
}

.gauge-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1E293B;
}

.revenue-list {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #F1F5F9;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.revenue-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.item-label {
  font-size: 0.8125rem;
  color: #64748B;
}

.item-amount {
  font-size: 1rem;
  font-weight: 700;
  color: #1E293B;
}

.item-progress-wrap {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar-bg {
  flex: 1;
  height: 6px;
  background: #F1F5F9;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.item-percentage {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1E293B;
  min-width: 35px;
  text-align: right;
}
</style>
