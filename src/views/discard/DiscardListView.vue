<template>
  <div class="admin-container">
    <div class="breadcrumb">홈 / 재고 관리 / <strong>폐기 내역</strong></div>

    <section class="summary-cards">
      <div class="summary-card">
        <div class="card-header-summary"><span>이번 달 총 폐기량</span></div>
        <div class="card-value">
          {{ discardVolume?.currentMonthVolume?.toLocaleString() || 0 }} kg
          <span :class="volumeTrend.trendClass">{{ volumeTrend.icon }} {{ volumeTrend.percentage }}%</span>
        </div>
        <div class="progress-bar">
          <div class="fill-danger" :style="{ width: volumeTrend.percentage + '%' }"></div>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-header-summary"><span>이번 달 폐기 손실액</span></div>
        <div class="card-value">
          {{ discardLoss?.currentTotalValue?.toLocaleString() || 0 }} 원
          <span :class="lossTrend.trendClass">{{ lossTrend.icon }} {{ lossTrend.percentage }}%</span>
        </div>
        <div class="progress-bar">
          <div class="fill-warning" :style="{ width: lossTrend.percentage + '%' }"></div>
        </div>
      </div>

      <div class="summary-card ratio-card">
        <div class="card-header-summary"><span>품목별 폐기 비율 (30일)</span></div>
        <div v-for="item in topDiscardedItemsWithPercentage" :key="item.itemName" class="ratio-item">
          <span class="label">{{ item.itemName }}</span>
          <div class="mini-bar-bg">
            <div class="mini-bar-fill" :style="{ width: item.percent + '%', backgroundColor: item.color }"></div>
          </div>
          <span class="percent">{{ item.percent }}%</span>
        </div>
        <div v-if="topDiscardedItemsWithPercentage.length === 0" class="no-data-small">데이터 없음</div>
      </div>
    </section>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item">
          <label>기간 설정</label>
          <div class="date-range">
            <input type="date" v-model="filters.startDate" class="basic-input">
            <span class="range-sep">~</span>
            <input type="date" v-model="filters.endDate" class="basic-input">
          </div>
        </div>
        <div class="filter-item">
          <label>LOT 번호</label>
          <input type="text" placeholder="번호 입력" v-model="filters.lotNo" class="basic-input" @keyup.enter="handleSearch" />
        </div>
        <div class="filter-item">
          <label>품목명</label>
          <input type="text" placeholder="품목명 입력" v-model="filters.itemName" class="basic-input" @keyup.enter="handleSearch" />
        </div>
        <div class="filter-item">
          <label>사유</label>
          <select v-model="filters.discardStatus" class="basic-select" @change="handleSearch">
            <option value="">전체 사유</option>
            <option v-for="(label, value) in reasonMap" :key="value" :value="value">{{ label }}</option>
          </select>
        </div>
        <button class="search-btn" @click="handleSearch">검색</button>
      </div>
    </div>

    <div class="list-card">
      <div class="card-header">
        <img src="@/assets/master-list.svg" class="title-icon-svg" alt="list" />
        <h3>폐기 상세 내역</h3>
      </div>
      <div class="table-container">
        <table class="admin-table">
          <thead>
          <tr>
            <th style="width: 60px">NO</th>
            <th>폐기 일자</th>
            <th>LOT 번호</th>
            <th>품목명</th>
            <th>폐기량</th>
            <th>사유</th>
            <th>처리자</th>
            <th>관리</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in items" :key="item.discardId">
            <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
            <td>{{ item.discardedAt?.substring(0, 10) }}</td>
            <td class="bold-text">{{ item.lotNo }}</td>
            <td class="text-left">{{ item.itemName }}</td>
            <td class="bold-text">{{ item.quantity }}</td>
            <td>
                <span :class="['status-badge', getReasonClass(item.discardStatus)]">
                  {{ reasonMap[item.discardStatus] || item.discardStatus }}
                </span>
            </td>
            <td><span class="handler-tag">{{ item.approvedEmailId }}</span></td>
            <td><button class="detail-btn" @click="openModal(item)">확인</button></td>
          </tr>
          <tr v-if="items.length === 0">
            <td colspan="8" class="no-data">폐기 내역 데이터가 없습니다.</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-wrapper">
        <div class="pagination">
          <button class="arrow" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">&lt;</button>
          <button v-for="page in pages" :key="page"
                  :class="['page', { active: currentPage === page }]" @click="changePage(page)">
            {{ page }}
          </button>
          <button class="arrow" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">&gt;</button>
        </div>
      </div>
    </div>

    <DiscardItemView :is-open="isModalOpen" :modal-data="selectedItem" @close="closeModal" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { getDiscardList, getDiscardVolume, getDiscardLoss, getDiscardRatioByItem } from '@/api/DiscardApi.js';

const isModalOpen = ref(false);
const selectedItem = ref(null);
const items = ref([]);
const topDiscardedItems = ref([]);

const discardVolume = ref({ currentMonthVolume: 0, lastMonthVolume: 0 });
const discardLoss = ref({ currentTotalValue: 0, lastMonthTotalValue: 0 });

const filters = reactive({
  startDate: '',
  endDate: '',
  lotNo: '',
  itemName: '',
  discardStatus: ''
});

const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = ref(1);

const reasonMap = {
  'DAMAGED': '파손',
  'EXPIRED': '유통기한 만료',
  'LOST': '분실',
  'OTHER': '기타',
  'POLLUTE': '오염',
  'RECALL': '회수/리콜',
};

const openModal = (item) => { selectedItem.value = item; isModalOpen.value = true; };
const closeModal = () => { isModalOpen.value = false; selectedItem.value = null; };

// 리스트 호출 함수 (가장 중요)
const fetchListData = async () => {
  try {
    const params = {
      // 데이터가 사라졌다면 백엔드 사양에 맞게 조정 (0 또는 1)
      page: currentPage.value,
      size: pageSize.value,
      // 빈 문자열 방지 (백엔드가 빈 문자열을 검색어로 인식할 수 있음)
      startDate: filters.startDate || null,
      endDate: filters.endDate || null,
      lotNo: filters.lotNo || null,
      itemName: filters.itemName || null,
      discardStatus: filters.discardStatus || null
    };

    const response = await getDiscardList(params);

    if (response.success) {
      // 서버 응답 구조가 content 안에 배열이 있는지 확인
      items.value = response.data.content || response.data || [];
      // 전체 페이지 수 갱신
      totalPages.value = response.data.totalPages || Math.ceil((response.data.totalElements || items.value.length) / pageSize.value) || 1;
    }
  } catch (e) {
    console.error("데이터 로드 실패:", e);
    items.value = [];
  }
};

const fetchSummaryData = () => {
  getDiscardVolume().then(res => { if (res.success) discardVolume.value = res.data; });
  getDiscardLoss().then(res => { if (res.success) discardLoss.value = res.data; });
  getDiscardRatioByItem().then(res => { if (res.success) topDiscardedItems.value = res.data.slice(0, 3); });
};

const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1);
});

const changePage = (p) => {
  if (p < 1 || p > totalPages.value) return;
  currentPage.value = p;
  fetchListData();
};

const handleSearch = () => {
  currentPage.value = 1; // 검색 시 항상 첫 페이지로
  fetchListData();
};

// Trends 계산 로직 (기존 유지)
const volumeTrend = computed(() => {
  const { currentMonthVolume, lastMonthVolume } = discardVolume.value;
  const percentage = lastMonthVolume === 0 ? 0 : Math.round(((currentMonthVolume - lastMonthVolume) / lastMonthVolume) * 100);
  return { percentage: Math.abs(percentage), trendClass: percentage >= 0 ? 'trend-up' : 'trend-down', icon: percentage >= 0 ? '↗' : '↘' };
});

const lossTrend = computed(() => {
  const { currentTotalValue, lastMonthTotalValue } = discardLoss.value;
  const percentage = lastMonthTotalValue === 0 ? 0 : Math.round(((currentTotalValue - lastMonthTotalValue) / lastMonthTotalValue) * 100);
  return { percentage: Math.abs(percentage), trendClass: percentage >= 0 ? 'trend-up' : 'trend-down', icon: percentage >= 0 ? '↗' : '↘' };
});

const topDiscardedItemsWithPercentage = computed(() => {
  const total = topDiscardedItems.value.reduce((sum, i) => sum + i.totalQuantity, 0);
  if (total === 0) return [];
  const colors = ['#ef4444', '#f97316', '#eab308'];
  return topDiscardedItems.value.map((item, idx) => ({
    ...item,
    percent: Math.round((item.totalQuantity / total) * 100),
    color: colors[idx % 3]
  }));
});

const getReasonClass = (s) => {
  if (s === 'DAMAGED') return 'status-danger';
  if (s === 'EXPIRED' || s === 'POLLUTE') return 'status-warning';
  return 'status-info';
};

onMounted(() => {
  fetchSummaryData();
  fetchListData();
});

// 사유 변경 시 즉시 검색 실행을 위한 감시
watch(() => filters.discardStatus, () => {
  handleSearch();
});
</script>

<style scoped>
/* 시스템 공통 레이아웃 */
.admin-container {
  padding: 20px 50px;
  background-color: #f8f9fb;
  /* 100vh에서 상하 패딩(20px * 2 = 40px)을 빼서 딱 맞춥니다 */
  height: calc(100vh - 40px);
  text-align: left;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 전체 페이지 스크롤바 강제 제거 */
}
.breadcrumb { font-size: 14px; color: #888; margin-bottom: 20px; }

/* 요약 카드 */
.summary-cards { display: flex; gap: 20px; margin-bottom: 25px; }
.summary-card { flex: 1; background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e0e0e0; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
.card-header-summary { font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #555; }
.card-value { font-size: 22px; font-weight: 800; display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px; }
.trend-up { font-size: 14px; color: #ef4444; }
.trend-down { font-size: 14px; color: #22c55e; }
.progress-bar { height: 6px; background: #eee; border-radius: 3px; overflow: hidden; }
.fill-danger { background: #ef4444; height: 100%; }
.fill-warning { background: #f59e0b; height: 100%; }
.ratio-item { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 13px; }
.ratio-item .label { width: 60px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mini-bar-bg { flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; }
.mini-bar-fill { height: 100%; border-radius: 4px; }
.percent { width: 35px; font-weight: 700; text-align: right; color: #333; }

/* 검색 필터 */
.filter-card { background: #fff; padding: 30px; border-radius: 20px; border: 1px solid #e0e0e0; margin-bottom: 25px; }
.filter-grid { display: flex; gap: 15px; align-items: flex-end; }
.filter-item { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.filter-item label { font-size: 13px; font-weight: 700; color: #444; }
.date-range { display: flex; align-items: center; gap: 5px; }
.range-sep { color: #ccc; }

.basic-input, .basic-select {
  width: 250px; height: 42px; padding: 0 12px; border: 1px solid #C8E4C8;
  border-radius: 10px; outline: none; font-size: 14px; transition: all 0.2s;
}
.basic-input:focus, .basic-select:focus { border-color: #11D411; box-shadow: 0 0 0 3px rgba(17, 212, 17, 0.05); }
.search-btn { background: #11D411; color: #fff; border: none; padding: 0 35px; height: 42px; border-radius: 10px; font-weight: 700; cursor: pointer; }

/* 리스트 영역 */
.list-card { background: #fff; border-radius: 20px; padding: 30px; border: 1px solid #e0e0e0; }
.card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.title-icon-svg { width: 20px; }
.admin-table { width: 100%; border-collapse: collapse; }
.admin-table th { padding: 15px; background: #fdfdfd; border-bottom: 2px solid #f1f1f1; color: #888; font-size: 14px; text-align: center; }
.admin-table td { padding: 15px; border-bottom: 1px solid #f9f9f9; font-size: 14px; text-align: center; }
.text-left { text-align: left !important; }
.bold-text { font-weight: 700; color: #333; }

/* 배지 */
.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid transparent; }
.status-badge.status-danger { background: #fff5f5; color: #ef4444; border-color: #ef4444; }
.status-badge.status-warning { background: #fffcf0; color: #f39c12; border-color: #f39c12; }
.status-badge.status-info { background: #f0f7ff; color: #2563eb; border-color: #2563eb; }
.handler-tag { background: #f1f3f5; padding: 4px 8px; border-radius: 6px; font-size: 12px; color: #666; }
.detail-btn { background: #f8f9fa; border: 1px solid #eee; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; }

.no-data { padding: 80px 0 !important; color: #999; }
.no-data-small { padding: 20px 0; text-align: center; color: #ccc; font-size: 12px; }

.pagination-wrapper { margin-top: 30px; display: flex; justify-content: center; }
.pagination { display: flex; gap: 5px; }
.page, .arrow { min-width: 32px; height: 32px; border-radius: 6px; border: 1px solid #eee; background: transparent; cursor: pointer; }
.page.active { background: #11D411; color: #fff; border-color: #11D411; font-weight: 700; }
</style>