<template>
  <div class="layout">
    <!-- 사이드바 (고정, 스크롤 없음) -->
    <AppSidebar />

    <!-- 오른쪽 영역 -->
    <div class="content">
      <!-- 헤더 (고정) -->
      <AppHeader />

      <!-- 메인 콘텐츠 (여기만 스크롤) -->
      <main class="main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '@/components/user/sidebar/AppSidebar.vue'
import AppHeader from '@/components/user/header/AppHeader.vue'
</script>

<style scoped>
/* 전체 레이아웃 */
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 우측 콘텐츠 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ❌ 스크롤 제거 */
.main {
  flex: 1;
  overflow: hidden; /* ← 핵심 */
  padding: 24px;
  background: #f5f5f5;
}

</style>
