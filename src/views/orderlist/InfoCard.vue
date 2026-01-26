<template>
  <div class="info-card">
    <div class="card-header">
      <span class="icon">{{ icon }}</span>
      <h3 class="title">{{ title }}</h3>
    </div>
    <div class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.info-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.icon {
  font-size: 18px;
  color: #6b7280;
}
.title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}
.card-content p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #374151;
  display: flex;
  justify-content: space-between;
}
.card-content p strong {
  font-weight: normal;
  color: #6b7280;
  flex-basis: 90px;
  flex-shrink: 0;
}
.card-content .total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 16px;
  font-weight: 600;
  color: #ef4444;
}
.card-content .total strong {
  color: #ef4444;
}
</style>
