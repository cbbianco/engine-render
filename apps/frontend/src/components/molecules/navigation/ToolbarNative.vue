<template>
  <div class="toolbar-native">
    <button 
      v-for="(btn, idx) in items" 
      :key="idx"
      :class="['toolbar-btn', btn.variant ? `toolbar-btn--${btn.variant}` : 'toolbar-btn--primary']"
      type="button"
      @click="emit('action', btn)"
    >
      <component :is="getIcon(btn.icon)" v-if="btn.icon" class="btn-icon" />
      {{ btn.label }}
    </button>
  </div>
</template>

<script setup lang="ts">

export interface ActionBtn {
  label: string
  action: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'danger'
}

const props = defineProps<{
  items: ActionBtn[]
}>()

const emit = defineEmits<{
  (e: 'action', btn: ActionBtn): void
}>()

function getIcon(name: string) {
  // Simple Icon Resolver pattern
  if (name === 'plus') {
    return {
      template: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 4.16666V15.8333M4.16666 10H15.8333" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    }
  }
  if (name === 'settings') {
    return {
      template: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>'
    }
  }
  return 'span'
}
</script>

<style scoped>
.toolbar-native {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  align-items: center;
}

.toolbar-btn {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Inter', sans-serif;
}

.toolbar-btn--primary {
  background: var(--primary-color, #465FFF);
  color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
}

.toolbar-btn--primary:hover {
  background: var(--primary-color, #465FFF);
  filter: brightness(0.9);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15);
}

.toolbar-btn--secondary {
  background: #ffffff;
  color: var(--primary-color, #465FFF);
  border: 1px solid var(--primary-color, #465FFF);
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);
}

.toolbar-btn--secondary:hover {
  background: var(--primary-bg-light, rgba(70, 95, 255, 0.08));
  color: var(--primary-hover, #3549CC);
  border-color: var(--primary-hover, #3549CC);
}

.toolbar-btn--danger {
  background: #D92D20;
  color: #ffffff;
}

.toolbar-btn--danger:hover {
  background: #B42318;
}

.btn-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
</style>
