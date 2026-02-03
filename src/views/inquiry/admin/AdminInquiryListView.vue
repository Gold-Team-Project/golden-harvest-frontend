<template>
  <div class="admin-container">
    <div class="breadcrumb">홈 / 고객관리 / <strong>문의 관리</strong></div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item flex-2">
          <label>제목</label>
          <div class="search-input-wrapper">
            <img src="@/assets/search.svg" class="search-icon-svg" alt="search" />
            <input type="text" placeholder="제목 검색" v-model="filters.title" />
          </div>
        </div>
        <div class="filter-item">
          <label>회사명</label>
          <input type="text" placeholder="회사명 입력" v-model="filters.company" class="basic-input" />
        </div>
        <div class="filter-item">
          <label>문의 유형</label>
          <select class="basic-select" disabled>
            <option>상품 문의</option>
          </select>
        </div>
        <div class="filter-item">
          <label>답변 상태</label>
          <select v-model="filters.status" class="basic-select">
            <option value="">전체</option>
            <option value="PENDING">대기중</option>
            <option value="APPROVED">승인</option>
            <option value="REJECTED">거절</option>
          </select>
        </div>
        <button class="search-btn" @click="currentPage = 1">검색</button>
      </div>
    </div>

    <div class="list-card">
      <div class="card-header">
        <img src="@/assets/user-icon.svg" class="title-icon-svg" alt="inquiry" />
        <h3>문의 내역 목록</h3>
      </div>

      <div class="table-container">
        <table class="admin-table">
          <thead>
          <tr>
            <th style="width: 8%">No</th>
            <th style="width: 15%">문의일</th>
            <th style="width: 15%">회사명</th>
            <th style="width: 15%">문의 유형</th>
            <th style="width: 22%">제목</th>
            <th style="width: 12%">상태</th>
            <th style="width: 13%">관리</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in displayList" :key="item.InquiryNo">
            <td>{{ item.no }}</td>
            <td>{{ item.createdAt }}</td>
            <td>{{ item.company }}</td>
            <td>
              <span class="status-badge TYPE">상품 문의</span>
            </td>
            <td class="text-left">{{ item.title }}</td>
            <td>
              <span :class="['status-badge', item.status]">
                {{
                  item.status === 'APPROVED' ? '승인' :
                      item.status === 'REJECTED' ? '거절' : '대기중'
                }}
              </span>
            </td>
            <td>
              <button class="detail-btn" @click="openModal(item.InquiryNo, item.no)">답변하기</button>
            </td>
          </tr>
          <tr v-if="displayList.length === 0">
            <td colspan="7" style="padding: 50px; color: #999;">문의 내역이 없습니다.</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-wrapper">
        <div class="pagination">
          <button class="arrow" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">&lt;</button>
          <button
              v-for="p in totalPages"
              :key="p"
              :class="['page', { active: currentPage === p }]"
              @click="changePage(p)"
          >
            {{ p }}
          </button>
          <button class="arrow" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">&gt;</button>
        </div>
      </div>
    </div>

    <AdminInquiryAnswerModal
        v-if="showModal"
        :inquiryNo="selectedInquiryNo"
        :no="selectedNo"
        @close="closeModal"
        @answered="onAnswered"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import http from '@/api/axios'
import AdminInquiryAnswerModal from '@/views/inquiry/modal/AdminInquiryAnswerModal.vue'

interface AdminInquiry {
  no: number
  InquiryNo: string
  createdAt: string
  company: string
  title: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

/* 1. 상태 관리 */
const rawInquiries = ref<any[]>([])
const currentPage = ref(1)
const itemsPerPage = 8

const showModal = ref(false)
const selectedInquiryNo = ref('')
const selectedNo = ref(0)

const filters = reactive({
  title: '',
  company: '',
  status: ''
})

/* 2. 필터링 로직 (PENDING / APPROVED / REJECTED 대응) */
const filteredList = computed(() => {
  if (!rawInquiries.value || rawInquiries.value.length === 0) return [];

  return rawInquiries.value
      .map((item, index) => {
        // 서버에서 오는 필드명이 processingStatus가 맞는지 확인이 필요합니다.
        // 만약 값이 'pending' (소문자)로 온다면 아래처럼 대문자로 통일해주는게 안전합니다.
        const statusValue = item.processingStatus ? item.processingStatus.toUpperCase() : 'PENDING';

        return {
          ...item,
          no: index + 1,
          InquiryNo: item.InquiryNo,
          createdAt: item.createdAt?.substring(0, 10) || '-',
          company: item.company || '-',
          title: item.title || '-',
          status: statusValue // PENDING, APPROVED, REJECTED 중 하나로 고정
        }
      })
      .filter(item => {
        // 1. 제목 검색 (비어있으면 통과, 있으면 포함 여부 확인)
        const matchTitle = !filters.title ||
            item.title.toLowerCase().includes(filters.title.toLowerCase().trim());

        // 2. 회사명 검색
        const matchCompany = !filters.company ||
            item.company.toLowerCase().includes(filters.company.toLowerCase().trim());

        // 3. 상태 검색 (핵심 부분)
        // filters.status가 'PENDING'이고 item.status가 'PENDING'인지 정확히 비교
        const matchStatus = !filters.status || item.status === filters.status;

        return matchTitle && matchCompany && matchStatus;
      });
});

/* 3. 최종 출력 및 페이징 */
const displayList = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredList.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredList.value.length / itemsPerPage) || 1;
});

/* 4. 데이터 호출 */
const fetchAdminInquiries = async () => {
  try {
    const res = await http.get('/admin/inquiries', {
      params: { size: 1000 }
    })
    rawInquiries.value = res.data?.data ?? []
  } catch (error) {
    console.error("데이터 로드 실패:", error)
  }
}

/* 5. 이벤트 핸들러 */
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
}

const openModal = (InquiryNo: string, no: number) => {
  selectedInquiryNo.value = InquiryNo
  selectedNo.value = no
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedInquiryNo.value = ''
}

const onAnswered = () => {
  fetchAdminInquiries()
}

watch([() => filters.title, () => filters.company, () => filters.status], () => {
  currentPage.value = 1;
});

onMounted(fetchAdminInquiries)
</script>

<style scoped>
.admin-container {
  padding: 20px 50px;
  background-color: #f8f9fb;
  height: 95vh;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.breadcrumb { font-size: 14px; color: #888; margin-bottom: 20px; flex-shrink: 0; }

.filter-card {
  background: #fff; padding: 25px 30px; border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 25px; border: 1px solid #e0e0e0;
  flex-shrink: 0;
}
.filter-grid { display: flex; gap: 15px; align-items: flex-end; }
.filter-item { display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 0; }
.filter-item.flex-2 { flex: 2; }
.filter-item label { font-size: 14px; font-weight: 700; color: #444; }

.search-input-wrapper { position: relative; width: 100%; }
.search-icon-svg { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); width: 18px; }
.search-input-wrapper input, .basic-input, .basic-select {
  width: 100%; height: 45px; padding: 0 15px; border: 1px solid #C8E4C8;
  border-radius: 10px; background: white; font-size: 14px; outline: none; transition: all 0.2s; box-sizing: border-box;
}
.search-input-wrapper input { padding-left: 45px; }
.search-input-wrapper input:focus, .basic-input:focus, .basic-select:focus {
  border-color: #11D411 !important; box-shadow: 0 0 0 3px rgba(17, 212, 17, 0.05);
}

.search-btn { background: #11D411; color: #fff; border: none; padding: 0 35px; height: 45px; border-radius: 10px; font-weight: 700; cursor: pointer; flex-shrink: 0; }
.search-btn:hover { background-color: #0fb80f; }

.list-card {
  background: #fff; border-radius: 20px; padding: 25px 30px; border: 1px solid #e0e0e0;
  flex: 1; min-height: 0; display: flex; flex-direction: column;
}
.card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.title-icon-svg { width: 22px; }

.table-container { flex: 1; overflow-y: auto; width: 100%; }
.admin-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.admin-table th { padding: 15px; text-align: center; color: #888; border-bottom: 2px solid #f4f4f4; font-size: 14px; background: #fff; position: sticky; top: 0; }
.admin-table td { padding: 12px 10px; font-size: 14px; border-bottom: 1px solid #f9f9f9; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.admin-table td.text-left { text-align: left; }

/* 상태 배지 스타일 (PENDING, APPROVED, REJECTED 매핑) */
.status-badge { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; }
.status-badge.APPROVED { background: #eefdee; color: #11D411; border: 1px solid #11D411; }
.status-badge.PENDING { background: #fff8ee; color: #f39c12; border: 1px solid #f39c12; }
.status-badge.REJECTED { background: #fef2f2; color: #ef4444; border: 1px solid #ef4444; }
.status-badge.TYPE { background: #f1f3f5; color: #666; border: 1px solid #dee2e6; }

.detail-btn { background: #f1f3f5; border: 1px solid #dee2e6; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; }
.detail-btn:hover { background: #e9ecef; }

.pagination-wrapper { margin-top: auto; padding-top: 20px; flex-shrink: 0; }
.pagination { display: flex; justify-content: center; gap: 5px; }
.page, .arrow { min-width: 32px; height: 32px; border-radius: 6px; border: 1px solid #eee; background: transparent; cursor: pointer; font-size: 13px; }
.page.active { background: #11D411; color: #fff; border-color: #11D411; font-weight: 700; }
</style>