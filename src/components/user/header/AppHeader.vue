<template>
  <header class="header">
    <!-- 🔹 왼쪽: 현재 페이지 제목 -->
    <div class="page-title">
      {{ pageTitle }}
    </div>

    <!-- 🔹 오른쪽 영역 -->
    <div class="right">
      <!-- 검색 -->
      <div class="search-box">
        <svg
            class="search-icon"
            viewBox="0 0 24 24"
            width="16"
            height="16"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" fill="none" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" stroke-width="2" />
        </svg>
        <input placeholder="찾으시는 상품을 입력해주세요." />
      </div>

      <!-- 알림 -->
      <button class="icon-btn">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path
              d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z"
              fill="currentColor"
          />
        </svg>
      </button>

      <!-- 문의 / 메시지 -->
      <button class="icon-btn">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path
              d="M4 4h16v12H8l-4 4V4Z"
              fill="currentColor"
          />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitle = computed(() => {
  return route.meta.title ?? ''
})
</script>

<style scoped>
.header {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

/* 왼쪽 타이틀 */
.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

/* 오른쪽 영역 */
.right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 검색 */
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f7f5;
  border-radius: 8px;
  padding: 6px 10px;
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  width: 220px;
}

.search-icon {
  color: #6b7280;
}

/* 아이콘 버튼 */
.icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #374151;
}

.icon-btn:hover {
  color: #22c55e;
}
</style>
