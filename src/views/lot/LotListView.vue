<template>
  <div class="admin-container">
    <div class="breadcrumb">홈 / LOT 관리 / <strong>LOT 리스트</strong></div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item flex-2">
          <label>LOT 번호</label>
          <div class="search-input-wrapper">
            <img src="@/assets/search.svg" class="search-icon-svg" alt="search" />
            <input
                type="text"
                placeholder="LOT 번호 검색"
                v-model="search.lotNo"
                @keyup.enter="fetchLots"
            />
          </div>
        </div>
        <div class="filter-item">
          <label>품목명</label>
          <input type="text" placeholder="품목명 입력" v-model="search.itemName" class="basic-input" @keyup.enter="fetchLots" />
        </div>
        <div class="filter-item">
          <label>상태</label>
          <select v-model="search.status" class="basic-select">
            <option value="">전체</option>
            <option value="AVAILABLE">입고</option>
            <option value="ALLOCATED">출고</option>
            <option value="DEPLETED">소진</option>
            <option value="DISCARDED">폐기</option>
          </select>
        </div>
        <div class="filter-item">
          <label>등록일</label>
          <div class="date-range-picker">
            <input type="date" v-model="search.startDate" class="basic-input" />
            <span>~</span>
            <input type="date" v-model="search.endDate" class="basic-input" />
          </div>
        </div>
        <button class="search-btn" @click="fetchLots">검색</button>
      </div>
    </div>

    <div class="list-card">
      <div class="card-header">
        <img src="@/assets/lot.svg" class="title-icon-svg" alt="list" />
        <h3>LOT 재고 목록</h3>
      </div>

      <div class="table-container">
        <table class="admin-table">
          <thead>
          <tr>
            <th style="width: 8%">No</th>
            <th style="width: 25%">LOT ID</th>
            <th style="width: 25%">품목명</th>
            <th style="width: 12%">수량</th>
            <th style="width: 15%">상태</th>
            <th style="width: 15%">등록일</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in items" :key="item.lotId">
            <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
            <td class="bold-text">{{ item.lotId }}</td>
            <td class="title-cell">{{ item.itemName }}</td>
            <td>{{ item.quantity.toLocaleString() }}</td>
            <td>
              <span :class="['status-badge', item.status]">
                {{ getStatusText(item.status) }}
              </span>
            </td>
            <td>{{ item.createdAt }}</td>
          </tr>
          <tr v-if="items.length === 0">
            <td colspan="6" class="no-data">LOT 데이터가 없습니다.</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-wrapper">
        <div class="pagination">
          <button class="arrow" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">&lt;</button>
          <span class="page-info">Page {{ currentPage }}</span>
          <button class="arrow" :disabled="!hasNextPage" @click="changePage(currentPage + 1)">&gt;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue'
import {useRouter} from 'vue-router'
import {getLots} from '@/api/ItemApi.js'

const router = useRouter()

const items = ref([])
const currentPage = ref(1)
const pageSize = 10
const hasNextPage = ref(true)

const search = ref({
  lotNo: '',
  itemName: '',
  status: '',
  startDate: '',
  endDate: '',
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

const fetchLots = async () => {
  try {
    const response = await getLots({
      page: currentPage.value,
      size: pageSize,
      lotNo: search.value.lotNo || null,
      status: search.value.status || null,
      itemName: search.value.itemName || null,
      startDate: search.value.startDate || null,
      endDate: search.value.endDate || null,
    });

    if (response.success && response.data) {
      items.value = response.data.map(item => ({
        lotId: item.lotNo,
        itemName: item.itemName,
        quantity: item.quantity,
        status: item.status,
        createdAt: item.inboundDate ? item.inboundDate.split('T')[0] : '-',
      }));
      // 다음 페이지가 있는지 확인: 반환된 아이템 수가 페이지 크기와 같으면 다음 페이지가 있을 가능성이 있음
      hasNextPage.value = response.data.length === pageSize;
    } else {
      items.value = [];
      hasNextPage.value = false;
    }
  } catch (err) {
    console.error(err);
    items.value = [];
    hasNextPage.value = false;
  }
};

const changePage = (page) => {
  if (page < 1) return;
  currentPage.value = page
}

watch(currentPage, fetchLots)
onMounted(fetchLots)
</script>

<style scoped>
/* 컨테이너 및 기본 구조 */
.admin-container { padding: 20px 50px; background-color: #f8f9fb; min-height: 100vh; box-sizing: border-box; }
.breadcrumb { font-size: 14px; color: #888; margin-bottom: 20px; text-align: left; }

/* 필터 카드 스타일 (회원관리와 동일) */
.filter-card {
  background: #fff; padding: 30px; border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 30px; border: 1px solid #e0e0e0;
}
.filter-grid { display: flex; gap: 15px; align-items: flex-end; }
.filter-item { display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 0; text-align: left; }
.filter-item.flex-2 { flex: 1.8; }
.filter-item label { font-size: 14px; font-weight: 700; color: #444; }

/* 검색 인풋 스타일 */
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

/* 리스트 카드 및 테이블 */
.list-card { background: #fff; border-radius: 20px; padding: 30px; border: 1px solid #e0e0e0; min-height: 550px; display: flex; flex-direction: column; }
.card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 25px; }
.title-icon-svg { width: 22px; }

.table-container { flex: 1; overflow-x: auto; width: 100%; }
.admin-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.admin-table th { padding: 15px; text-align: center; color: #888; border-bottom: 2px solid #f4f4f4; font-size: 14px; }
.admin-table td { padding: 18px 10px; font-size: 14px; border-bottom: 1px solid #f9f9f9; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.title-cell { text-align: left !important; font-weight: 500; }
.bold-text { font-weight: 700; color: #333; }

/* 상태 배지 스타일 */
.status-badge { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; }
.status-badge.AVAILABLE { background: #eefdee; color: #11D411; border: 1px solid #11D411; } /* 입고 */
.status-badge.ALLOCATED { background: #eef6ff; color: #2563eb; border: 1px solid #2563eb; } /* 출고 */
.status-badge.DEPLETED { background: #f3f4f6; color: #6b7280; border: 1px solid #d1d5db; }  /* 소진 */
.status-badge.DISCARDED { background: #fef2f2; color: #ef4444; border: 1px solid #ef4444; } /* 폐기 */

.no-data { padding: 50px 0 !important; color: #999; }

/* 페이지네이션 */
.pagination-wrapper { margin-top: auto; padding-top: 30px; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 15px; }
.page, .arrow { min-width: 32px; height: 32px; border-radius: 6px; border: 1px solid #eee; background: transparent; cursor: pointer; font-size: 13px; }
.page.active { background: #11D411; color: #fff; border-color: #11D411; font-weight: 700; }
.arrow:disabled { cursor: not-allowed; opacity: 0.5; }
.page-info { font-size: 14px; color: #555; }
</style>