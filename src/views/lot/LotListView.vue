<template>
  <section class="admin-page">
    <div class="page-header">
      <p class="desc">홈 / LOT 관리 / LOT 리스트</p>
    </div>

    <div class="search-card">
      <div class="search-row">
        <div class="field">
          <input v-model="search.lotId" placeholder="LOT ID"/>
        </div>
        <div class="field">
          <input v-model="search.itemName" placeholder="품목명"/>
        </div>
        <div class="field">
          <select v-model="search.status">
            <option value="">상태 전체</option>
            <option value="ACTIVE">활성화</option>
            <option value="INACTIVE">비활성화</option>
          </select>
        </div>
        <BaseButton class="btn-search" @click="fetchItems">
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
          <th>관리</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in items" :key="item.lotId">
          <td>{{ item.no }}</td>
          <td>{{ item.lotId }}</td>
          <td class="title">{{ item.itemName }}</td>
          <td>{{ item.quantity }}</td>
          <td>
            <StatusBadge :class="item.status === 'ACTIVE' ? 'status-done' : 'status-wait'">
              {{ item.status === 'ACTIVE' ? '활성화' : '비활성화' }}
            </StatusBadge>
          </td>
          <td>{{ item.createdAt }}</td>
          <td>
            <BaseButton class="btn-soft" @click="goDetail(item.lotId)">
              상세보기
            </BaseButton>
          </td>
        </tr>
        <tr v-if="items.length === 0">
          <td colspan="7">LOT 데이터가 없습니다.</td>
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
import http from '@/api/axios'

import Pagination from '@/components/pagination/Pagination.vue'
import StatusBadge from '@/components/status/StatusBadge.vue'
import BaseButton from '@/components/button/BaseButton.vue'

const router = useRouter()

const items = ref([])
const currentPage = ref(1)
const pages = ref([])
const pageSize = 10

const search = ref({
  lotId: '',
  itemName: '',
  status: '',
})

const goDetail = (lotId) => {
  // Assuming a detail page route exists
  // router.push({ name: 'adminLotDetail', params: { lotId } })
  alert(`Navigating to detail for LOT ID: ${lotId}`);
}

// Mock data for lots
const mockLots = Array.from({ length: 50 }, (_, i) => ({
  lotId: `LOT-${202401 + i}`,
  itemName: `품목 ${i % 5 + 1}`,
  quantity: Math.floor(Math.random() * 100) + 1,
  status: Math.random() > 0.3 ? 'ACTIVE' : 'INACTIVE',
  createdAt: new Date(new Date().getTime() - (50 - i) * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
}));


const fetchItems = async () => {
  // In a real scenario, you would make an API call like this:
  /*
  try {
    const res = await http.get('/lots', {
      params: {
        page: currentPage.value,
        size: pageSize,
        lotId: search.value.lotId || undefined,
        itemName: search.value.itemName || undefined,
        status: search.value.status || undefined,
      },
    })
    const payload = res.data?.data?.content ?? [];
    items.value = payload.map((item, index) => ({
      ...item,
      no: (currentPage.value - 1) * pageSize + index + 1,
      createdAt: item.createdAt?.substring(0, 10),
    }));
    // Make pages based on total pages from response
  } catch (err) {
    console.error(err)
  }
  */

  // Using mock data for now
  const filtered = mockLots.filter(lot => {
    const searchLotId = search.value.lotId.toLowerCase();
    const searchItemName = search.value.itemName.toLowerCase();
    const searchStatus = search.value.status;

    return (!searchLotId || lot.lotId.toLowerCase().includes(searchLotId)) &&
           (!searchItemName || lot.itemName.toLowerCase().includes(searchItemName)) &&
           (!searchStatus || lot.status === searchStatus);
  });

  const startIndex = (currentPage.value - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  items.value = filtered.slice(startIndex, endIndex).map((item, index) => ({
    ...item,
    no: startIndex + index + 1,
  }));

  makePages(Math.ceil(filtered.length / pageSize));
}


const makePages = (totalPages) => {
  let temp = [];
  for (let i = 1; i <= totalPages; i++) {
    temp.push(i);
  }
  pages.value = temp;
}

const changePage = (page) => {
  if (page < 1 || page > pages.value.length) return;
  currentPage.value = page
}

watch(currentPage, fetchItems)
onMounted(fetchItems)
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

.status-done {
  background: #dcfce7;
  color: #15803d;
}

.status-wait {
  background: #fef3c7;
  color: #b45309;
}

.btn-soft {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  font-weight: 600;
}
</style>
