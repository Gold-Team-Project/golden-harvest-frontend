<template>
  <div class="pagination">
    <button
        class="arrow"
        :disabled="current === pages[0]"
        @click="change(current - 1)"
    >
      &lt;
    </button>

    <button
        v-for="page in pages"
        :key="page"
        :class="['page', { active: page === current }]"
        @click="change(page)"
    >
      {{ page }}
    </button>

    <button
        class="arrow"
        :disabled="current === pages[pages.length - 1]"
        @click="change(current + 1)"
    >
      &gt;
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  pages: {
    type: Array,
    required: true
  },
  current: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:current'])

const change = (page) => {
  if (page === props.current) return
  if (!props.pages.includes(page)) return
  emit('update:current', page)
}
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
  border: none;
  background: transparent;
}

.page.active {
  background: #22c55e;
  color: #fff;
  font-weight: 600;
}

.arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>