<template>
  <div class="layout">
    <AdminSidebar />

    <div class="content">
      <main class="main">
        <router-view />
      </main>
    </div>

    <ChatWidget />
  </div>
</template>

<script setup>
import AdminSidebar from '@/components/admin/sidebar/AppSidebar.vue'
import ChatWidget from '@/views/chat/ChatWidget.vue'
</script>

<style scoped>
/* 전체 레이아웃 */
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  position: relative; /* 위젯 고정을 위해 추가 */
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