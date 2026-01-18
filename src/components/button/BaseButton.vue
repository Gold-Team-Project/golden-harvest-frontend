<template>
  <button class="btn">
    <slot />
  </button>
</template>

<script setup>
</script>

<style scoped>
.btn {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;

  border: none;          /* 테두리 제거 */
  background: transparent;
}
</style>