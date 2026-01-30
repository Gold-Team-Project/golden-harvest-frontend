<template>
  <section class="admin-page">
    <div class="page-header">
      <p class="desc">홈 / LOT 관리 / LOT 리스트</p>
    </div>

    <div class="search-card">
      <div class="search-row">
        <div class="field">
          <input v-model="search.lotNo" placeholder="LOT 번호"/>
        </div>
        <div class="field">
          <input v-model="search.itemName" placeholder="품목명"/>
        </div>
        <div class="field">
          <select v-model="search.status">
            <option value="">상태 전체</option>
            <option value="AVAILABLE">입고</option>
            <option value="ALLOCATED">출고</option>
            <option value="DEPLETED">소진</option>
            <option value="DISCARDED">폐기</option>
          </select>
        </div>
        <BaseButton class="btn-search" @click="fetchLots">
          검색
        </BaseButton>
      </div>
    </div>

    <div class="card">
      <table class="table">
        <thead>
        <tr>
          <th>No</th>
          <th>LOT ID</th>
          <th>품목명</th>
          <th>수량</th>
          <th>상태</th>
          <th>등록일</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in items" :key="item.lotId">
          <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
          <td>{{ item.lotId }}</td>
          <td class="title">{{ item.itemName }}</td>
          <td>{{ item.quantity }}</td>
          <td>
            <StatusBadge :class="getStatusClass(item.status)">
              {{ getStatusText(item.status) }}
            </StatusBadge>
          </td>
          <td>{{ item.createdAt }}</td>
        </tr>
        <tr v-if="items.length === 0">
          <td colspan="6">LOT 데이터가 없습니다.</td>
        </tr>
        </tbody>
      </table>

      <Pagination
          :pages="pages"
          :current="currentPage"
          @update:current="changePage"
      />
    </div>
  </section>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue'
import {useRouter} from 'vue-router'
import {getLots} from '@/api/ItemApi.js'

import Pagination from '@/components/pagination/Pagination.vue'
import StatusBadge from '@/components/status/StatusBadge.vue'
import BaseButton from '@/components/button/BaseButton.vue'

const router = useRouter()

const items = ref([])
const currentPage = ref(1)
const pages = ref([])
const pageSize = 10
const totalItems = ref(0)

const search = ref({
  lotNo: '', // Changed from lotId to lotNo
  itemName: '',
  status: '', // Added status
})

const getStatusText = (status) => {
  const statusMap = {
    AVAILABLE: '입고',
    ALLOCATED: '출고',
    DEPLETED: '소진',
    DISCARDED: '폐기',
  };
  return statusMap[status] || '알 수 없음';
};

const getStatusClass = (status) => {
  const classMap = {
    AVAILABLE: 'status-done', // 입고
    ALLOCATED: 'status-shipping', // 출고
    DEPLETED: 'status-wait', // 소진
    DISCARDED: 'status-hold', // 폐기
  };
  return classMap[status] || '';
};

const fetchLots = async () => {
  try {
    const response = await getLots({
      page: currentPage.value,
      size: pageSize,

      // 검색 조건
      lotNo: search.value.lotNo || null, // Changed from skuNo: search.value.lotId to lotNo: search.value.lotNo
      status: search.value.status || null, // Added status filter
      itemName: search.value.itemName || null, // Ensure itemName is passed

      // startDate: '2025-01-01', // Example of how to add date filters if needed
      // endDate: '2026-12-31',
    });

    if (response.success && response.data) {
      items.value = response.data.map(item => ({
        lotId: item.lotNo,
        itemName: item.itemName,
        quantity: item.quantity,
        status: item.status, // API가 'AVAILABLE', 'ALLOCATED' 등을 반환한다고 가정
        createdAt: item.inboundDate ?? '-', // Or correct field from API
      }));

      totalItems.value = response.data.length; // Corrected total items calculation
      makePages(Math.ceil(totalItems.value / pageSize));
    } else {
      items.value = [];
      totalItems.value = 0;
      makePages(0);
    }
  } catch (err) {
    console.error(err);
    items.value = [];
  }
};

const makePages = (totalPages) => {
  let temp = [];
  for (let i = 1; i <= totalPages; i++) {
    temp.push(i);
  }
  pages.value = temp;
}

const changePage = (page) => {
  if (page < 1 || (pages.value.length > 0 && page > pages.value.length)) return;
  currentPage.value = page
}

watch(currentPage, fetchLots)
// watch(search, fetchLots, { deep: true }) // 검색 필터 변경 시 자동으로 API 호출하는 watch 제거
onMounted(fetchLots)
</script>

<style scoped>
.admin-page {
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
  align-items: center;
}

.field {
  flex: 1;
}

.search-row input, .search-row select {
  width: 100%;
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

.table th, .table td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
}

th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.title {
  text-align: left;
  font-weight: 500;
}

/* Status Styles */
.status-done { background: #dcfce7; color: #15803d; } /* 입고 */
.status-shipping { background: #e0f2fe; color: #0369a1; } /* 출고 */
.status-wait { background: #f3f4f6; color: #4b5563; } /* 소진 */
.status-hold { background: #fee2e2; color: #b91c1c; } /* 폐기 */

.btn-soft {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  font-weight: 600;
}
</style>
