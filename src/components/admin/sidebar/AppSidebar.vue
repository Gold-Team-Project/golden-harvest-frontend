<template>
  <aside class="sidebar">
    <div class="sidebar-top">
      <div class="logo" @click="go('adminDashboard')">
        <div class="logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
                d="M5 21c8 0 14-6 14-14V3S7 3 3 7c-4 4 2 14 2 14Z"
                fill="currentColor"
            />
          </svg>
        </div>

        <div class="logo-text">
          <strong class="brand">GoldenHarvest</strong>
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
            :class="{ 'expanded': displayedOpenKey === group.key }"
            @mouseenter="clearMouseleaveTimeout(); hoveredMenuKey = group.key"
            @mouseleave="startMouseleaveTimeout()"
        >
          <div
              class="menu-item parent"
              :class="{ 'expanded': displayedOpenKey === group.key }"
          >
            <span class="icon" v-html="groupIcon(group)" />
            <span class="label">{{ group.label }}</span>
          </div>

          <div v-if="displayedOpenKey === group.key" class="submenu">
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
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authApi from '@/api/AuthApI'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()

const go = (name) => {
  router.push({ name })
}

const handleLogout = async () => {
  // 1. 로그아웃 확인창 띄우기
  const result = await Swal.fire({
    title: '로그아웃 하시겠습니까?',
    text: "안전하게 로그아웃하고 로그인 페이지로 이동합니다.",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#22c55e', // 로고 아이콘 색상과 맞춘 초록색
    cancelButtonColor: '#ef4444',
    confirmButtonText: '로그아웃',
    cancelButtonText: '취소',
    reverseButtons: true, // 취소 버튼을 왼쪽으로
    background: '#ffffff',
    borderRadius: '12px'
  });

  // 사용자가 취소를 눌렀다면 함수 종료
  if (!result.isConfirmed) return;

  try {
    // 2. 백엔드 로그아웃 요청
    await authApi.logout();
  } catch (error) {
    console.error("로그아웃 요청 중 오류:", error);
  } finally {
    // 3. 로컬 저장소 정리 및 알림
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    await Swal.fire({
      title: '로그아웃 완료',
      text: '성공적으로 로그아웃 되었습니다.',
      icon: 'success',
      confirmButtonColor: '#22c55e',
      timer: 1500, // 1.5초 후 자동 닫힘
      showConfirmButton: false
    });

    router.push('/login');
  }
};

/* ===== 아이콘 정의 ===== */
const logoutIcon = `<svg viewBox="0 0 24 24" width="18" height="18">
  <path d="M16 17l5-5-5-5v3H9v4h7v3Z" fill="currentColor"/>
  <path d="M4 4h8v4H6v8h6v4H4V4Z" fill="currentColor"/>
</svg>`

const tradeDefaultIcon = `<svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 4h18l-2 14H5L3 4Z" fill="currentColor"/></svg>`
const tradeExpandedIcon = `<svg viewBox="0 0 24 24" width="18" height="18"><rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor"/></svg>` // Filled square icon

/* ===== 단일 메뉴 ===== */
const singleMenus = [
  {
    key: 'dashboard',
    label: '대시보드',
    route: 'adminDashboard',
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
    icons: { // Changed from 'icon' to 'icons' object
        default: tradeDefaultIcon,
        expanded: tradeExpandedIcon,
    },
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

const hoveredMenuKey = ref(null);
const mouseleaveTimeout = ref(null);
const HOVER_DELAY_MS = 200; // 200ms 지연 시간 설정

const startMouseleaveTimeout = () => {
  mouseleaveTimeout.value = setTimeout(() => {
    hoveredMenuKey.value = null;
  }, HOVER_DELAY_MS);
};

const clearMouseleaveTimeout = () => {
  if (mouseleaveTimeout.value) {
    clearTimeout(mouseleaveTimeout.value);
    mouseleaveTimeout.value = null;
  }
};



const displayedOpenKey = computed(() => {



    // 1. If currently hovering over a group, that group should be open.



    if (hoveredMenuKey.value) {



        return hoveredMenuKey.value;



    }







    // 2. If not hovering, check if any child route is active.



    const activeChildGroup = accordionMenus.find(group =>



        group.children.some(child => child.route === route.name)



    );



    if (activeChildGroup) {



        return activeChildGroup.key;



    }







    // 3. Otherwise, nothing is open.



    return null;



});



const groupIcon = (group) => {

  if (group.icons) { // Check if 'icons' object exists (for 'trade' group)

    return displayedOpenKey.value === group.key ? group.icons.expanded : group.icons.default;

  }

  return group.icon; // Fallback for other groups that still use single 'icon' string

};
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
  cursor: pointer; /* Add cursor pointer */
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
  gap: 40px; /* Increased to 40px */
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

.menu-item.parent.expanded .icon {
    color: #15803d; /* Green color for the icon when parent is expanded */
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