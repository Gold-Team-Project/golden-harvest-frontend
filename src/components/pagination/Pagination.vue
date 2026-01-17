<template>
  <div class="pagination">
    <button class="arrow">&lt;</button>

    <button
        v-for="page in pages"
        :key="page"
        :class="['page', { active: page === current }]"
    >
      {{ page }}
    </button>

    <button class="arrow">&gt;</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  pages: number[]
  current: number
}>()
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 20px;
}

.page,
.arrow {
  min-width: 32px;
  height: 32px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;

  border: none;          /* 테두리 제거 */
  background: transparent;
}
</style>
