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
      <div class="table-actions">
        <BaseButton class="btn-delete-all" :disabled="items.length === 0" @click="deleteAll">
          전체 삭제
        </BaseButton>
      </div>
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

            <BaseButton class="btn-delete" @click="deleteOne(n)">
              삭제
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
import Swal from 'sweetalert2' // 1. Swal 추가

const items = ref([])
const currentPage = ref(1)
const pages = ref([])
const pageSize = 10

const typeLabel = (t) => {
  switch (t) {
    case 'SIGNUP_PENDING': return '가입 승인 대기'
    default: return '알림'
  }
}

const typeClass = (t) => {
  switch (t) {
    case 'SIGNUP_PENDING': return 'type-green'
    default: return 'type-gray'
  }
}

const fetchNotifications = async () => {
  try {
    const res = await http.get('/notifications', {
      params: {
        userEmail: 'admin@teamgold.com',
        page: currentPage.value,
        size: pageSize,
      },
    })

    const data = res.data?.data
    const payload = Array.isArray(data?.notifications) ? data.notifications : []
    const pg = data?.pagination

    items.value = payload.map((row, index) => {
      const template = row.notificationTemplate ?? {}
      const type = template.type ?? 'DEFAULT'
      const title = template.title ?? ''
      const body = template.body ?? ''

      return {
        userNotificationId: row.userNotificationId,
        no: (currentPage.value - 1) * pageSize + index + 1,
        userEmail: row.userEmail,
        type,
        summary: title || body || '알림이 도착했습니다.',
        receivedAt: String(row.receivedAt ?? '').replace('T', ' ').slice(0, 16),
        readAt: row.readAt ? String(row.readAt).replace('T', ' ').slice(0, 16) : null,
        isRead: !!row.read,
      }
    })

    const totalPages = pg?.totalPages ?? 1
    pages.value = Array.from({ length: totalPages }, (_, i) => i + 1)
  } catch (e) {
    console.error(e)
  }
}

// [수정] 단건 확인 처리
const confirmNotification = async (n) => {
  if (n?.isRead) return

  const prev = n.isRead
  n.isRead = true

  try {
    await http.patch(`/notifications/${n.userNotificationId}`)
    // 확인 성공 시 별도의 알림창 없이 조용히 상태만 변경 (UX 배려)
  } catch (e) {
    console.error(e)
    n.isRead = prev
    Swal.fire({
      title: '확인 실패',
      text: '알림 확인 처리에 실패했습니다.',
      icon: 'error',
      confirmButtonColor: '#ef4444',
      borderRadius: '16px'
    })
  }
}

// [수정] 단건 삭제
const deleteOne = async (n) => {
  const result = await Swal.fire({
    title: '알림 삭제',
    text: '해당 알림을 삭제하시겠습니까?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#9ca3af',
    confirmButtonText: '삭제',
    cancelButtonText: '취소',
    reverseButtons: true,
    borderRadius: '16px'
  })

  if (!result.isConfirmed) return

  try {
    await http.delete(`/notifications/${n.userNotificationId}`, {
      params: { userEmail: 'alpha@teamgold.com' },
    })
    await fetchNotifications()
  } catch (e) {
    console.error(e)
    Swal.fire({
      title: '삭제 실패',
      text: '알림 삭제 중 오류가 발생했습니다.',
      icon: 'error',
      confirmButtonColor: '#ef4444',
      borderRadius: '16px'
    })
  }
}

// [수정] 전체 삭제
const deleteAll = async () => {
  const result = await Swal.fire({
    title: '전체 삭제하시겠습니까?',
    text: '모든 알림이 삭제되며 복구할 수 없습니다.',
    icon: 'error', // 치명적인 작업이므로 error 아이콘 사용
    showCancelButton: true,
    confirmButtonColor: '#111827', // 기존 버튼색과 맞춤
    cancelButtonColor: '#9ca3af',
    confirmButtonText: '전체 삭제 실행',
    cancelButtonText: '취소',
    reverseButtons: true,
    borderRadius: '16px'
  })

  if (!result.isConfirmed) return

  try {
    await http.delete('/notifications/deleteAll', {
      params: { userEmail: 'alpha@teamgold.com' },
    })
    currentPage.value = 1
    await fetchNotifications()

    Swal.fire({
      title: '삭제 완료',
      text: '모든 알림이 삭제되었습니다.',
      icon: 'success',
      confirmButtonColor: '#11D411',
      timer: 1500,
      showConfirmButton: false,
      borderRadius: '16px'
    })
  } catch (e) {
    console.error(e)
    Swal.fire({
      title: '오류 발생',
      text: '전체 삭제 처리에 실패했습니다.',
      icon: 'error',
      confirmButtonColor: '#ef4444',
      borderRadius: '16px'
    })
  }
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
/* 테이블 위 액션 바 */
.table-actions {
  display: flex;
  justify-content: flex-end;
  padding: 14px 12px;
  border-bottom: 1px solid #e5e7eb;
}

/* 관리 버튼들 정렬 */
.manage-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 단건 삭제 버튼 */
.btn-delete {
  padding: 8px 16px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-weight: 800;
}

/* 전체 삭제 버튼 */
.btn-delete-all {
  padding: 8px 16px;
  border-radius: 999px;
  background: #111827;
  color: #fff;
  font-weight: 800;
}

/* 비활성화 느낌 */
.btn-delete-all:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

</style>
