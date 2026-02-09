<template>
  <header class="header">
    <div class="page-title">
      {{ pageTitle }}
    </div>

    <div class="right">
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

      <div class="icon-btn-wrapper">
        <button class="icon-btn" @click="toggleNotifications">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path
                d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z"
                fill="currentColor"
            />
          </svg>
          <span class="badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
        </button>

        <NotificationDropdown
          :is-open="isNotificationOpen"
          :notifications="notifications"
          @read="handleRead"
          @clear-all="handleClearAll"
          @view-all="handleViewAll"
          @close="isNotificationOpen = false"
        />
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import NotificationDropdown from './NotificationDropdown.vue'
import { fetchAllNotificationByUserEmail, markNotificationAsRead, deleteAllNotifications } from '@/api/NotificationApi'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isNotificationOpen = ref(false)
const notifications = ref([])

const pageTitle = computed(() => {
  return route.meta.title ?? ''
})

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.isRead).length
})

const fetchNotifications = async () => {
  const email = userStore.user?.userEmail || userStore.user?.email || localStorage.getItem('userEmail')
  if (!email) return
  
  const data = await fetchAllNotificationByUserEmail(email)
  if (data && data.notifications) {
    notifications.value = data.notifications.map(row => {
      const template = row.notificationTemplate ?? {}
      return {
        userNotificationId: row.userNotificationId,
        summary: template.title || template.body || '알림',
        receivedAt: String(row.receivedAt ?? '').replace('T', ' ').slice(0, 16),
        isRead: row.isRead || !!row.read,
        type: template.type || 'DEFAULT'
      }
    })
  }
}

const toggleNotifications = () => {
  isNotificationOpen.value = !isNotificationOpen.value
  if (isNotificationOpen.value) {
    fetchNotifications()
  }
}

const handleRead = async (n) => {
  if (!n.isRead) {
    await markNotificationAsRead(n.userNotificationId)
    n.isRead = true
  }
}

const handleClearAll = async () => {
  const email = userStore.user?.userEmail || userStore.user?.email || localStorage.getItem('userEmail')
  if (!email) return
  await deleteAllNotifications(email)
  notifications.value = []
}

const handleViewAll = () => {
  isNotificationOpen.value = false
  // 알림 페이지가 따로 있다면 그쪽으로 이동 (있을 경우만)
  if (userStore.isAdmin) {
    router.push({ name: 'adminNotification' })
  }
}

let pollInterval = null

onMounted(() => {
  fetchNotifications()
  // 30초마다 새로운 알림 체크
  pollInterval = setInterval(fetchNotifications, 30000)
})

onBeforeUnmount(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
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

/* 알림 버튼 관련 */
.icon-btn-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}
</style>