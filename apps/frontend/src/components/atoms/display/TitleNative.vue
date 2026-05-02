<template>
  <div :class="['title-container', { 'has-separator': separator }]" :style="{ textAlign: align }">
    <h4 class="title-text">{{ label }}</h4>
    <p v-if="description" class="description-text">{{ description }}</p>
    <div v-if="separator" class="separator-line"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  description?: string
  separator?: boolean
  align?: 'left' | 'center' | 'right'
}>()
</script>

<style scoped>
.title-container {
  padding: 8px 0;
  width: 100%;
}

.title-container.has-separator {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
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

.separator-line {
  height: 1px;
  background-color: #E4E7EC;
  width: 100%;
  margin-top: 0.5rem;
}
</style>
