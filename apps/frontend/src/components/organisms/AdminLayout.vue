<template>
  <div class="layout-page">
    <AppSidebar />
    <Backdrop />
    <div
      class="layout-main"
      :class="[isExpanded || isHovered ? 'layout-main--wide' : 'layout-main--narrow']"
    >
      <AppHeader />
      <div class="layout-main__inner">
        <slot />
      </div>
      <footer class="layout-footer">
        v1.16.0 - Copyright © César Bianco
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import Backdrop from './Backdrop.vue'
import { useSidebar } from '@/composables/useSidebar'

const { isExpanded, isHovered } = useSidebar()
</script>

<style scoped>
.layout-footer {
  text-align: center;
  padding: 1rem;
  font-size: 0.85rem;
  color: #64748b;
  border-top: 1px solid #e2e8f0;
  background-color: white;
  margin-top: auto;
}
</style>
