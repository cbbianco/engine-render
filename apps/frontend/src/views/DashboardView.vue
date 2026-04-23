<template>
  <div class="dashboard-page">
    <div class="dashboard-page__container">
      <h2 class="dashboard-page__title">Dashboard</h2>
      <div class="dashboard-page__content">
        <p class="dashboard-page__message">En construcción</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.dashboard-page {
  width: 100%;
  min-height: 100%;
}
.dashboard-page__container {
  width: 100%;
  max-width: 100%;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1);
  padding: 2rem;
  margin: 0 auto;
}
.dashboard-page__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e4e7ec;
}
.dashboard-page__content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  width: 100%;
}
.dashboard-page__message {
  font-size: 1.125rem;
  color: var(--secondary-color);
  margin: 0;
}
</style>
