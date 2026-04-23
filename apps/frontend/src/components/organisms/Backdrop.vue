<template>
  <div
    v-if="isMobileOpen"
    class="layout-backdrop"
    @click="toggleMobileSidebar"
  />
</template>

<script setup lang="ts">
import { useSidebar } from '@/composables/useSidebar'

const { toggleMobileSidebar, isMobileOpen } = useSidebar()
</script>
