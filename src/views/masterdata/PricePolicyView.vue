<template>
  <section class="admin-page">
    <div class="page-header">
      <p class="desc">홈 / 마스터 데이터 / 가격 정책 관리</p>
    </div>

    <div class="search-card">
      <div class="search-row">
        <div class="field">
          <input v-model="search.itemName" placeholder="품목명"/>
        </div>
        <div class="field">
          <input v-model="search.varietyName" placeholder="품종명"/>
        </div>
        <div class="field">
          <input v-model="search.grade" placeholder="등급"/>
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
          <th>품목명</th>
          <th>품종명</th>
          <th>등급</th>
          <!-- 상태, 등록일, 관리 칼럼 제거 -->
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in items" :key="item.skuNo">
          <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
          <td class="title">{{ item.itemName }}</td>
          <td>{{ item.varietyName }}</td>
          <td>{{ item.grade }}</td>
          <!-- 상태, 등록일, 관리 칼럼 제거 -->
        </tr>
        <tr v-if="items.length === 0">
          <td :colspan="columnCount">품목 데이터가 없습니다.</td>
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
import {ref, onMounted, watch, computed} from 'vue'
import {useRouter} from 'vue-router'
import http from '@/api/axios'

import Pagination from '@/components/pagination/Pagination.vue'
// StatusBadge는 사용하지 않으므로 제거
import BaseButton from '@/components/button/BaseButton.vue'

/* 타입 정의 */
// interface MasterItem { // TypeScript는 사용하지 않으므로 제거
//   no: number
//   skuNo: string
//   itemCode: string
//   itemName: string
//   varietyName: string
//   grade: string
//   isActive: boolean
//   createdAt: string
// }

const router = useRouter()

const items = ref([])
const currentPage = ref(1)
const pages = ref([])
const pageSize = 10

const search = ref({
  itemName: '',
  varietyName: '',
  grade: '',
  // status 제거
})

const columnCount = computed(() => {
  // No, 품목명, 품종명, 등급 (4 columns)
  return 4;
});

const fetchItems = async () => {
  try {
    const res = await http.get('/master-data/items', {
      params: {
        page: currentPage.value,
        size: pageSize,
        itemName: search.value.itemName || undefined,
        varietyName: search.value.varietyName || undefined,
        // itemCode는 search에 없으므로 제거
        grade: search.value.grade || undefined,
        // status 제거
      },
    })

    const payload = res.data?.data?.content ?? res.data?.data ?? []
    console.log(payload)
    items.value = payload.map((item, index) => ({
      no: (currentPage.value - 1) * pageSize + index + 1,
      skuNo: item.skuNo,
      varietyName: item.varietyName,
      itemName: item.itemName,
      grade: item.gradeName,
      // isActive 제거
      // createdAt 제거
    }))

    // makePages(payload.length) // makePages 로직은 totalElements를 기준으로 재조정 필요
    // 현재 API 응답에서 totalElements를 찾을 수 없으므로 임시로 payload.length 사용
    makePages(Math.ceil((res.data?.data?.totalElements || payload.length) / pageSize));


  } catch (err) {
    console.error(err)
    items.value = [];
    makePages(1); // 에러 발생 시 페이지 초기화
  }
}


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
  fetchItems(); // 페이지 변경 시 아이템 다시 가져오기
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
}

/* Status Styles (더 이상 사용되지 않음) */
/* .status-done { background: #dcfce7; color: #15803d; } */
/* .status-wait { background: #fef3c7; color: #b45309; } */

.btn-soft {
  background: #22c55e;
  color: #fff;
}
</style>