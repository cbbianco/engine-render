<template>
  <nav class="breadcrumbs">
    <ol class="breadcrumbs__list">
      <li 
        v-for="(item, index) in items" 
        :key="index" 
        class="breadcrumbs__item"
      >
        <router-link 
          v-if="item.path && index < items.length - 1" 
          :to="item.path"
          class="breadcrumbs__link"
          @click="$emit('click', item)"
        >
          <div class="breadcrumbs__content">
            <svg 
              v-if="index === 0" 
              class="breadcrumbs__home-icon" 
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span class="breadcrumbs__label">{{ item.label }}</span>
          </div>
        </router-link>
        
        <div v-else class="breadcrumbs__content breadcrumbs__content--current">
           <svg 
            v-if="index === 0" 
            class="breadcrumbs__home-icon" 
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="breadcrumbs__label">{{ item.label }}</span>
        </div>

        <!-- Separator -->
        <svg 
          v-if="index < items.length - 1"
          class="breadcrumbs__separator" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
export interface BreadcrumbItem {
  label: string
  path?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()

defineEmits(['click'])
</script>

<style scoped>
.breadcrumbs {
  margin: 0;
  width: auto;
}

.breadcrumbs__list {
  display: flex;
  justify-content: flex-end; /* Volvemos a flex-end para alineación a la derecha */
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.breadcrumbs__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumbs__link {
  text-decoration: none;
  color: #64748b;
  transition: color 0.2s;
}

.breadcrumbs__link:hover {
  color: var(--primary-color);
}

.breadcrumbs__content {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.breadcrumbs__content--current {
  color: #1c2434;
  font-weight: 600;
}

.breadcrumbs__home-icon {
  margin-bottom: 2px;
}

.breadcrumbs__label {
  line-height: 1;
}

.breadcrumbs__separator {
  width: 14px;
  height: 14px;
  color: #94a3b8;
  flex-shrink: 0;
}
</style>
