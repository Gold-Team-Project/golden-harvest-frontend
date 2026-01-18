<template>
  <div class="layout">
    <!-- 사이드바 (고정, 스크롤 없음) -->
    <AdminSidebar />

    <!-- 오른쪽 영역 -->
    <div class="content">
      <!-- 메인 콘텐츠 (여기만 스크롤) -->
      <main class="main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminSidebar from '@/components/admin/sidebar/AppSidebar.vue'
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

/* 메인 콘텐츠만 스크롤 */
.main {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f9fafb;
}
</style>
