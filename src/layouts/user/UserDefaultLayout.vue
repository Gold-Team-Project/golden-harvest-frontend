<template>
  <div class="layout">
    <AppSidebar />

    <div class="content">
      <AppHeader />

      <main class="main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
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

.main {
  flex: 1;
  overflow: hidden;
  padding: 24px;
  background: #f5f5f5;
}
</style>