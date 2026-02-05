<template>
  <section class="inquiry-page">
    <!-- 헤더 영역 -->
    <div class="page-header">
      <div>
        <h2>문의 내역</h2>
        <p class="desc">
          접수하신 문의와 답변 상태를 확인하실 수 있습니다.
        </p>
      </div>

      <BaseButton class="btn-primary" @click="goCreate">
        문의 등록
      </BaseButton>
    </div>

    <!-- 테이블 카드 -->
    <div class="card">
      <table class="table">
        <thead>
        <tr>
          <th>No</th>
          <th>문의 유형</th>
          <th>제목</th>
          <th>작성일</th>
          <th>상태</th>
          <th>관리</th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="item in inquiries" :key="item.inquiryNo">
          <td>{{ item.id }}</td>
          <td>{{ item.type }}</td>
          <td class="title">{{ item.title }}</td>
          <td>{{ item.createdAt }}</td>

          <td>
            <StatusBadge
                :class="item.status === 'DONE' ? 'status-done' : 'status-wait'"
            >
              {{ item.status === 'DONE' ? '답변완료' : '답변대기' }}
            </StatusBadge>
          </td>

          <td>
            <BaseButton
                class="btn-soft"
                @click="openDetail(item.inquiryNo)"
            >
              상세보기
            </BaseButton>
          </td>
        </tr>

        <!-- 데이터 없을 때 -->
        <tr v-if="inquiries.length === 0">
          <td colspan="6">문의 내역이 없습니다.</td>
        </tr>
        </tbody>
      </table>

      <Pagination
          :pages="pages"
          :current="currentPage"
          class="pagination-view"
          @update:current="changePage"
      />
    </div>

    <!-- 상세보기 모달 -->
    <InquiryDetailModal
        v-if="showDetailModal"
        :inquiryNo="selectedInquiryNo"
        @close="closeDetail"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/api/axios'

import StatusBadge from '@/components/status/StatusBadge.vue'
import BaseButton from '@/components/button/BaseButton.vue'
import Pagination from '@/components/pagination/Pagination.vue'
import InquiryDetailModal from '@/views/inquiry/modal/InquiryDetailModal.vue'

import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

interface Inquiry {
  id: number
  inquiryNo: string
  type: string
  title: string
  createdAt: string
  status: 'WAIT' | 'DONE'
}

const inquiryTypeMap = {
  PRODUCT: '상품 문의',
  DELIVERY: '배송 문의',
  ORDER: '주문 문의',
  ETC: '기타 문의',
}

/* =====================
   상태값
===================== */
const inquiries = ref<Inquiry[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 10

const pages = computed(() => {
  const pageArray = []
  for (let i = 1; i <= totalPages.value; i++) {
    pageArray.push(i)
  }
  return pageArray
})


/* 상세 모달 */
const showDetailModal = ref(false)
const selectedInquiryNo = ref('')

/* =====================
   API 호출
===================== */
const fetchInquiries = async () => {
  const userId = userStore.user?.email
  if (!userId) {
    inquiries.value = []
    totalPages.value = 1
    return
  }

  try {
    const res = await http.get('/inquiries', {
      params: {
        page: currentPage.value, // ✅ 백엔드 1-based
        size: pageSize,
      },
    })

    const payload = res.data?.data?.content ?? res.data?.content ?? []
    totalPages.value = res.data?.data?.totalPages ?? res.data?.totalPages ?? 1

    if (!Array.isArray(payload)) {
      inquiries.value = []
      return
    }

    // 매핑 + 번호
    inquiries.value = payload.map((item: any, index: number) => ({
      id: (currentPage.value - 1) * pageSize + index + 1,
      inquiryNo: item.InquiryNo,
      type: inquiryTypeMap[item.type] || item.type,
      title: item.title,
      createdAt: item.createdAt?.substring(0, 10),
      status: item.processingStatus === 'Y' ? 'DONE' : 'WAIT',
    }))

  } catch (e) {
    console.error('문의 목록 조회 실패', e)
    inquiries.value = []
    totalPages.value = 1
  }
}

/* =====================
   페이지 이동
===================== */
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  if (page === currentPage.value) return
  currentPage.value = page
}

/* =====================
   상세보기
===================== */
const openDetail = (inquiryNo: string) => {
  selectedInquiryNo.value = inquiryNo
  showDetailModal.value = true
}

const closeDetail = () => {
  showDetailModal.value = false
  selectedInquiryNo.value = ''
}

const goCreate = () => {
  router.push('/inquiries/create')
}

/* =====================
   라이프사이클
===================== */
watch(currentPage, () => {
  fetchInquiries()
})

onMounted(() => {
  fetchInquiries()
})
</script>


<style scoped>
.inquiry-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.desc {
  font-size: 13px;
  color: #6b7280;
}

.card {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
}

.table th {
  font-size: 13px;
  color: #6b7280;
}

.title {
  text-align: left;
}

.btn-primary {
  background: #22c55e;
  color: #ffffff;
}

.btn-soft {
  background: #f3f4f6;
  color: #6b7280;
}

.status-done {
  background: #dcfce7;
  color: #15803d;
}

.status-wait {
  background: #fef3c7;
  color: #b45309;
}
</style>
