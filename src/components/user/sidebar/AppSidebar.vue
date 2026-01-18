<template>
  <aside class="sidebar">
    <!-- TOP : 로고 -->
    <div class="sidebar-top">
      <div class="logo">
        <div class="logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
                d="M5 21c8 0 14-6 14-14V3S7 3 3 7c-4 4 2 14 2 14Z"
                fill="currentColor"
            />
          </svg>
        </div>

        <div class="logo-text">
          <strong class="brand">GreenHarvest</strong>
          <span class="role">B2B Partner</span>
        </div>
      </div>
    </div>

    <!-- MIDDLE : 메뉴 -->
    <div class="sidebar-menu">
      <nav class="menu">
        <div
            v-for="menu in mainMenus"
            :key="menu.key"
            :class="['menu-item', { active: route.name === menu.route }]"
            @click="go(menu.route)"
        >
          <span class="icon" v-html="menu.icon" />
          <span class="label">{{ menu.label }}</span>
        </div>

        <div class="section-title">계정</div>

        <div
            v-for="menu in accountMenus"
            :key="menu.key"
            :class="['menu-item', { active: route.name === menu.route }]"
            @click="go(menu.route)"
        >
          <span class="icon" v-html="menu.icon" />
          <span class="label">{{ menu.label }}</span>
        </div>
      </nav>
    </div>

    <!-- BOTTOM : 로그아웃 -->
    <div class="sidebar-bottom">
      <div class="menu-item logout">
        <span class="icon" v-html="logoutIcon" />
        <span class="label">로그아웃</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const go = (name: string) => {
  router.push({ name })
}

const mainMenus = [
  {
    key: 'dashboard',
    label: '대시보드',
    route: 'Dashboard',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18">
      <rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor"/>
      <rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor"/>
      <rect x="3" y="14" width="7" height="7" rx="2" fill="currentColor"/>
      <rect x="14" y="14" width="7" height="7" rx="2" fill="currentColor"/>
    </svg>`,
  },
  {
    key: 'order',
    label: '주문',
    route: 'Order',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18">
      <path d="M3 4h18l-2 14H5L3 4Z" fill="currentColor"/>
    </svg>`,
  },
  {
    key: 'invoice',
    label: '영수증',
    route: 'Invoice',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18">
      <path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z" fill="currentColor"/>
    </svg>`,
  },
  {
    key: 'cart',
    label: '장바구니',
    route: 'Cart',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18">
      <circle cx="9" cy="20" r="2" fill="currentColor"/>
      <circle cx="17" cy="20" r="2" fill="currentColor"/>
      <path d="M3 4h2l3 10h10l3-6H7" fill="currentColor"/>
    </svg>`,
  },
]

const accountMenus = [
  {
    key: 'mypage',
    label: '마이페이지',
    route: 'MyPage',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18">
      <circle cx="12" cy="8" r="4" fill="currentColor"/>
      <path d="M4 20c0-4 16-4 16 0" fill="currentColor"/>
    </svg>`,
  },
  {
    key: 'setting',
    label: '설정',
    route: 'inquiryList',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18">
      <circle cx="12" cy="12" r="3" fill="currentColor"/>
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.3 1a7 7 0 0 0-1.7-1l-.3-2.5H9.4l-.3 2.5a7 7 0 0 0-1.7 1l-2.3-1-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.3-1a7 7 0 0 0 1.7 1l.3 2.5h5.2l.3-2.5a7 7 0 0 0 1.7-1l2.3 1 2-3.5-2-1.5c.1-.3.1-.7.1-1Z"
        fill="currentColor"/>
    </svg>`,
  },
]

const logoutIcon = `<svg viewBox="0 0 24 24" width="18" height="18">
  <path d="M16 17l5-5-5-5v3H9v4h7v3Z" fill="currentColor"/>
  <path d="M4 4h8v4H6v8h6v4H4V4Z" fill="currentColor"/>
</svg>`
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
}

/* TOP */
.sidebar-top {
  padding: 14px 12px 6px;
}

.logo {
  display: flex;
  gap: 10px;
  align-items: center;
}

.logo-icon {
  width: 34px;
  height: 34px;
  background: #22c55e;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.logo-text .brand {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.logo-text .role {
  font-size: 11px;
  color: #6b7280;
}

/* MENU */
.sidebar-menu {
  flex: 1;
  padding: 30px 20px;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  margin: 24px 8px 6px;
  font-size: 12px;
  color: #9ca3af;
  font-weight: 600;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #374151;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-item.active {
  background: #dcfce7;
  color: #15803d;
}

/* BOTTOM */
.sidebar-bottom {
  border-top: 1px solid #e5e7eb;
  padding: 10px 12px;
}

.logout {
  color: #dc2626;
}
</style>
