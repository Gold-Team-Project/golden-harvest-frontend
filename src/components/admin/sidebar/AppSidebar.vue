<template>
  <aside class="sidebar">
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
          <span class="role">Admin Console</span>
        </div>
      </div>
    </div>

    <div class="sidebar-menu">
      <nav class="menu">
        <div
            v-for="menu in singleMenus"
            :key="menu.key"
            :class="['menu-item', { active: route.name === menu.route }]"
            @click="go(menu.route)"
        >
          <span class="icon" v-html="menu.icon" />
          <span class="label">{{ menu.label }}</span>
        </div>

        <div
            v-for="group in accordionMenus"
            :key="group.key"
            :class="['menu-group', { active: isGroupActive(group) }]"
        >
          <div
              class="menu-item parent"
              :class="{ active: isGroupActive(group) }"
              @click="toggle(group.key)"
          >
            <span class="icon" v-html="group.icon" />
            <span class="label">{{ group.label }}</span>
          </div>

          <div v-if="openMenuKey === group.key" class="submenu">
            <div
                v-for="child in group.children"
                :key="child.key"
                :class="['menu-item sub', { active: route.name === child.route }]"
                @click="go(child.route)"
            >
              <span class="label">{{ child.label }}</span>
            </div>
          </div>
        </div>
      </nav>
    </div>

    <div class="sidebar-bottom">
      <div class="menu-item logout" @click="handleLogout">
        <span class="icon" v-html="logoutIcon" />
        <span class="label">로그아웃</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authApi from '@/api/AuthApI'

const route = useRoute()
const router = useRouter()

const go = (name) => {
  router.push({ name })
}

const handleLogout = async () => {
  if (!confirm("로그아웃 하시겠습니까?")) return;
  try {
    await authApi.logout(); // 백엔드 Redis 토큰 삭제 및 블랙리스트 등록
  } catch (error) {
    console.error("로그아웃 요청 중 오류:", error);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    alert("로그아웃 되었습니다.");
    router.push('/login');
  }
};

/* ===== 아이콘 정의 ===== */
const logoutIcon = `<svg viewBox="0 0 24 24" width="18" height="18">
  <path d="M16 17l5-5-5-5v3H9v4h7v3Z" fill="currentColor"/>
  <path d="M4 4h8v4H6v8h6v4H4V4Z" fill="currentColor"/>
</svg>`

/* ===== 단일 메뉴 ===== */
const singleMenus = [
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
]

/* ===== 아코디언 메뉴 ===== */
const accordionMenus = [
  {
    key: 'trade',
    label: '거래 관리',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18">
      <path d="M3 4h18l-2 14H5L3 4Z" fill="currentColor"/>
    </svg>`,
    children: [
      { key: 'order', label: '고객 주문 목록', route: 'adminOrderList' },
      { key: 'sales', label: '판매 매출 목록', route: 'adminSalesList' },
    ],
  },
  {
    key: 'inventory',
    label: '재고 관리',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18">
      <path d="M4 4h16v16H4z" fill="currentColor"/>
    </svg>`,
    children: [
      { key: 'lot', label: 'LOT 목록', route: 'adminLotList' },
      { key: 'discard', label: '폐기 등록', route: 'adminDiscardRegister' },
      { key: 'discardHistory', label: '폐기 내역', route: 'adminDiscardList' },
    ],
  },
  {
    key: 'master',
    label: '마스터 데이터',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18">
      <path d="M3 4h18l-2 14H5L3 4Z" fill="currentColor"/>
    </svg>`,
    children: [
      { key: 'masterData', label: '품목 관리', route: 'adminMasterDataList' },
      { key: 'masterDataCreate', label: '품목 등록', route: 'adminMasterDataCreate' },
    ],
  },
  {
    key: 'customer',
    label: '고객 관리',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18">
      <circle cx="12" cy="8" r="4" fill="currentColor"/>
      <path d="M4 20c0-4 16-4 16 0" fill="currentColor"/>
    </svg>`,
    children: [
      { key: 'member', label: '회원 관리', route: 'adminMemberList' },
      { key: 'inquiry', label: '문의 관리', route: 'adminInquiryList' },
    ],
  },
]

/* ===== 상태 ===== */
const openMenuKey = ref(null)

const toggle = (key) => {
  openMenuKey.value = openMenuKey.value === key ? null : key
}

const isGroupActive = (group) =>
    openMenuKey.value === group.key ||
    group.children.some((c) => c.route === route.name)

/* route 변경 시 자동 오픈 */
watch(
    () => route.name,
    () => {
      accordionMenus.forEach(group => {
        if (group.children.some(c => c.route === route.name)) {
          openMenuKey.value = group.key
        }
      })
    },
    { immediate: true }
)
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
  flex-shrink: 0;
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

.menu-group.active {
  border-radius: 8px;
}

/* 메뉴 아이템 공통 스타일 */
.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #374151;
  font-size: 16px;
}

/* 하위 메뉴 스타일 조정 */
.menu-item.sub {
  padding-left: 42px;
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.menu-item:hover {
  background: #f3f4f6;
}

/* 활성화 상태 (Green 색상) */
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