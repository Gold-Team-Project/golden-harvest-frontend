<template>
  <section class="inquiry-page admin-page">
    <div class="page-header">
      <div>
        <p class="desc">홈 / 고객관리 / 문의</p>
      </div>
    </div>

    <div class="search-card">
      <div class="search-row">
        <div class="field title">
          <input v-model="search.title" placeholder="제목 검색" />
        </div>

        <div class="field">
          <input v-model="search.company" placeholder="회사명" />
        </div>

        <div class="field">
          <select disabled>
            <option>상품 문의</option>
          </select>
        </div>

        <div class="field">
          <select v-model="search.status">
            <option value="">답변 상태</option>
            <option value="WAIT">대기</option>
            <option value="DONE">완료</option>
          </select>
        </div>

        <BaseButton class="btn-search" @click="fetchAdminInquiries">
          검색
        </BaseButton>
      </div>
    </div>

    <div class="card">
      <table class="table">
        <thead>
        <tr>
          <th>No</th>
          <th>문의일</th>
          <th>회사명</th>
          <th>문의 유형</th>
          <th>제목</th>
          <th>상태</th>
          <th>관리</th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="item in inquiries" :key="item.InquiryNo">
          <td>{{ item.no }}</td>
          <td>{{ item.createdAt }}</td>
          <td>{{ item.company }}</td>

          <td>
            <StatusBadge class="type-product">
              상품 문의
            </StatusBadge>
          </td>

          <td class="title">{{ item.title }}</td>

          <td>
            <StatusBadge
                :class="item.status === 'DONE' ? 'status-done' : 'status-wait'"
            >
              {{ item.status === 'DONE' ? '답변완료' : '대기중' }}
            </StatusBadge>
          </td>

          <td>
            <BaseButton
                class="btn-soft"
                @click="openModal(item.InquiryNo, item.no)"
            >
              답변하기
            </BaseButton>
          </td>
        </tr>

        <tr v-if="inquiries.length === 0">
          <td colspan="7">문의 내역이 없습니다.</td>
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

    <AdminInquiryAnswerModal
        v-if="showModal"
        :inquiryNo="selectedInquiryNo"
        :no="selectedNo"
        @close="closeModal"
        @answered="onAnswered"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import http from '@/api/axios'

import Pagination from '@/components/pagination/Pagination.vue'
import StatusBadge from '@/components/status/StatusBadge.vue'
import BaseButton from '@/components/button/BaseButton.vue'
import AdminInquiryAnswerModal from '@/views/inquiry/modal/AdminInquiryAnswerModal.vue'

interface AdminInquiry {
  no: number
  InquiryNo: string
  createdAt: string
  company: string
  title: string
  status: 'WAIT' | 'DONE'
}

/* 상태 */
const inquiries = ref<AdminInquiry[]>([])
const currentPage = ref(1)
const pages = ref<number[]>([])
const pageSize = 10

const showModal = ref(false)
const selectedInquiryNo = ref('')
const selectedNo = ref(0)

const search = ref({
  title: '',
  company: '',
  status: '',
})

/* 조회 */
const fetchAdminInquiries = async () => {
  const res = await http.get('/admin/inquiries', {
    params: {
      page: currentPage.value,
      size: pageSize,
      ...search.value,
    },
  })

  const payload = res.data?.data ?? []

  inquiries.value = payload.map((item: any, index: number) => ({
    no: (currentPage.value - 1) * pageSize + index + 1,
    InquiryNo: item.InquiryNo,
    createdAt: item.createdAt?.substring(0, 10),
    company: item.company,
    title: item.title,
    status: item.processingStatus === 'Y' ? 'DONE' : 'WAIT',
  }))

  makePages(payload.length)
}

/* 페이징 */
const makePages = (currentSize: number) => {
  const temp: number[] = []
  if (currentPage.value > 1) temp.push(currentPage.value - 1)
  temp.push(currentPage.value)
  if (currentSize === pageSize) temp.push(currentPage.value + 1)
  pages.value = temp
}

const changePage = (page: number) => {
  if (page === currentPage.value) return
  currentPage.value = page
}

/* 모달 */
const openModal = (InquiryNo: string, no: number) => {
  if (!InquiryNo) return
  selectedInquiryNo.value = InquiryNo
  selectedNo.value = no
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedInquiryNo.value = ''
  selectedNo.value = 0
}

const onAnswered = () => {
  fetchAdminInquiries()
}

watch(currentPage, fetchAdminInquiries)
onMounted(fetchAdminInquiries)
</script>

<style scoped>
.inquiry-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.desc {
  font-size: 13px;
  color: #6b7280;
}

.page-header {
  margin-bottom: 8px;
}

.search-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
}

.search-row {
  display: flex;
  gap: 12px;
  align-items: center; /* ⭐ 핵심 */
}

.field {
  flex: 1;
}

.field.title {
  flex: 2.5;
}

.search-row input,
.search-row select {
  width: 100%; /* ❗ 93% 제거 */
  height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0 12px;
  box-sizing: border-box;
}

.btn-search {
  height: 40px;
  padding: 0 20px;
  background: #22c55e;
  color: #fff;
  white-space: nowrap;
}

.card {
  background: #fff;
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

.title {
  text-align: left;
}

.type-product {
  background: #ecfccb;
  color: #3f6212;
  border: 1px solid #bef264;
}

.status-done {
  background: #dcfce7;
  color: #15803d;
}

.status-wait {
  background: #fef3c7;
  color: #b45309;
}

.btn-soft {
  background: #22c55e;
  color: #ffffff;
}
</style>
