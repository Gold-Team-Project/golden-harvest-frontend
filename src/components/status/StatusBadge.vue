<template>
  <span class="status-badge">
    <slot />
  </span>
</template>

<script setup lang="ts">
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;

  border: none;          /* 테두리 제거 */
}
</style>
