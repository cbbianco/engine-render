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
