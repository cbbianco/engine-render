<template>
  <div class="title-container">
    <h4 class="title-text">{{ label }}</h4>
    <p v-if="description" class="description-text">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  description?: string
}>()
</script>

<style scoped>
.title-container {
  padding: 16px 0;
  margin-bottom: 24px;
  border-bottom: 1px solid #E4E7EC;
}

.title-text {
  font-size: 20px;
  font-weight: 500;
  color: #1D2939;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.description-text {
  font-size: 14px;
  color: #667085;
  margin: 8px 0 0 0;
  font-weight: 400;
}
</style>
