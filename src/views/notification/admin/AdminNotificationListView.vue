<template>
  <section class="admin-page">
    <!-- 헤더 -->
    <div class="page-header">
      <p class="desc">홈 / 마스터 관리 / 품목 리스트</p>

      <div class="title-wrap">
        <div class="title-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
                d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5L4 18v1h16v-1l-2-2Z"
                fill="currentColor"
            />
          </svg>
        </div>
        <h2 class="page-title">알림함</h2>
      </div>
    </div>

    <div class="card">
      <table class="table">
        <thead>
        <tr>
          <th class="col-no">NO</th>
          <th class="col-type">알림유형</th>
          <th class="col-summary">내용 요약</th>
          <th class="col-time">발생 시각</th>
          <th class="col-read">확인 여부</th>
          <th class="col-manage">관리</th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="n in items" :key="n.userNotificationId">
          <td class="td-no">{{ n.no }}</td>

          <td>
              <span class="pill" :class="typeClass(n.type)">
                {{ typeLabel(n.type) }}
              </span>
          </td>

          <td class="td-summary">{{ n.summary }}</td>

          <td class="td-time">{{ n.receivedAt }}</td>

          <td>
              <span class="pill pill-read" :class="n.isRead ? 'read' : 'unread'">
                {{ n.isRead ? '읽음' : '안읽음' }}
              </span>
          </td>

          <td>
            <BaseButton class="btn-confirm" @click="confirmNotification(n)">
              확인
            </BaseButton>
          </td>
        </tr>

        <tr v-if="items.length === 0">
          <td colspan="6" class="empty">알림이 없습니다.</td>
        </tr>
        </tbody>
      </table>

      <div class="pagination-wrap">
        <Pagination
            :pages="pages"
            :current="currentPage"
            @update:current="changePage"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import http from '@/api/axios'
import Pagination from '@/components/pagination/Pagination.vue'
import BaseButton from '@/components/button/BaseButton.vue'


const items = ref([])
const currentPage = ref(1)
const pages = ref([])
const pageSize = 10

const typeLabel = (t) => {
  switch (t) {
    case 'INQUIRY': return '문의'
    case 'SIGNUP': return '가입 승인'
    case 'LOW_STOCK': return '재고 부족'
    default: return '알림'
  }
}

const typeClass = (t) => {
  switch (t) {
    case 'INQUIRY': return 'type-blue'
    case 'SIGNUP': return 'type-green'
    case 'LOW_STOCK': return 'type-orange'
    default: return 'type-gray'
  }
}

// 예시: 조회 API (백엔드에 맞게 URL/params 조정)
const fetchNotifications = async () => {
  try {
    const res = await http.get('/notifications', {
      params: { page: currentPage.value, size: pageSize },
    })

    const payload = res.data?.data?.content ?? res.data?.data ?? []

    items.value = payload.map((row, index) => {
      const rawReceived =
          row.receivedAt ?? row.received_at ?? row.receivedAtText ?? ''

      return {
        userNotificationId: row.userNotificationId ?? row.id ?? `${currentPage.value}-${index}`,
        no: (currentPage.value - 1) * pageSize + index + 1,
        type: row.type ?? 'DEFAULT',
        summary: row.summary ?? row.title ?? row.body ?? '알림이 도착했습니다.',
        receivedAt: String(rawReceived).replace('T', ' ').slice(0, 16),
        isRead: !!(row.isRead ?? row.is_read),
      }
    })

    makePages(payload.length)
  } catch (e) {
    console.error(e)
  }
}

const confirmNotification = async (n) => {
  // 예시: 읽음 처리 API가 있으면 연결
  // await http.patch(`/notifications/${n.userNotificationId}/read`)
  n.isRead = true
}

const makePages = (size) => {
  const temp = []
  if (currentPage.value > 1) temp.push(currentPage.value - 1)
  temp.push(currentPage.value)
  if (size === pageSize) temp.push(currentPage.value + 1)
  pages.value = temp
}

const changePage = (page) => {
  if (page === currentPage.value) return
  currentPage.value = page
}

watch(currentPage, fetchNotifications)
onMounted(fetchNotifications)
</script>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 헤더 */
.page-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: #eaf7ef;
  color: #2e7d32;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #111827;
}

/* 카드 + 테이블 */
.card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

thead th {
  background: #eef7ef;
  color: #2f6b35;
  font-weight: 700;
  padding: 14px 12px;
  border-bottom: 1px solid #cfe7d2;
  text-align: left;
}

tbody td {
  padding: 18px 12px;
  border-bottom: 1px solid #2f6b35;
  vertical-align: middle;
}

.col-no, .td-no { width: 90px; }
.col-type { width: 140px; }
.col-time { width: 180px; }
.col-read { width: 120px; }
.col-manage { width: 120px; }

.td-no {
  font-weight: 700;
  color: #111827;
}

.td-summary {
  font-weight: 700;
  color: #111827;
}

.td-time {
  font-weight: 700;
  color: #111827;
}

/* pill 배지 */
.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 13px;
  border: 2px solid transparent;
  background: #fff;
}

/* 유형별 */
.type-blue {
  color: #2563eb;
  border-color: #2563eb;
  background: #eff6ff;
}

.type-green {
  color: #16a34a;
  border-color: #16a34a;
  background: #ecfdf5;
}

.type-orange {
  color: #f97316;
  border-color: #f97316;
  background: #fff7ed;
}

.type-gray {
  color: #6b7280;
  border-color: #9ca3af;
  background: #f9fafb;
}

/* 읽음/안읽음 */
.pill-read.read {
  color: #16a34a;
  border-color: #16a34a;
  background: #ecfdf5;
}

.pill-read.unread {
  color: #ef4444;
  border-color: #ef4444;
  background: #fef2f2;
}

/* 확인 버튼 */
.btn-confirm {
  padding: 8px 16px;
  border-radius: 999px;
  background: #22c55e;
  color: #fff;
  font-weight: 800;
}

/* 빈 상태 */
.empty {
  text-align: center;
  color: #6b7280;
  padding: 20px;
  border-bottom: none;
}

/* 페이지네이션 중앙 */
.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 18px 0;
}
</style>
