<template>
  <div class="separator-container">
    <h3 class="separator-title">{{ label }}</h3>
    <div class="separator-line"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<style scoped>
.separator-container {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  width: 100%;
}

.separator-title {
  font-size: 20px;
  font-weight: 500;
  color: #1D2939;
  margin-bottom: 0.5rem;
  font-family: 'Inter', sans-serif;
}

.separator-line {
  height: 1px;
  background-color: #e4e7ec;
  width: 100%;
}
</style>
