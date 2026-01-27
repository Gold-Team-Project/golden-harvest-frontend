<template>
  <section class="admin-page">
    <header class="page-header">
        <p class="desc">홈 / 재고 관리 / 폐기 내역</p>
    </header>
    
    <section class="summary-cards">
      <div class="summary-card">
        <div class="card-header">
          <span>이번 달 총 폐기량</span>
        </div>
        <div class="card-value">
          {{ discardVolume.currentMonthVolume.toLocaleString() }} kg 
          <span :class="volumeTrend.trendClass">
            {{ volumeTrend.icon }} {{ volumeTrend.percentage }}%
          </span>
        </div>
        <div class="progress-bar">
          <div class="fill-danger" :style="{ width: volumeTrend.percentage + '%' }"></div>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-header">
          <span>이번 달 폐기 손실액</span>
        </div>
        <div class="card-value">
          - 원 <span class="trend-down">↘ -0%</span>
        </div>
        <div class="progress-bar">
          <div class="fill-warning" style="width: 0%"></div>
        </div>
      </div>

      <div class="summary-card ratio-card">
        <div class="card-header">
          <span>품목별 폐기 비율 (30일)</span>
        </div>
        <!-- This also needs to be fed by API data -->
        <div class="ratio-item" v-for="item in wasteRatios" :key="item.name">
          <span class="label">{{ item.name }}</span>
          <div class="mini-bar-bg">
            <div class="mini-bar-fill" :style="{ width: item.percent + '%', backgroundColor: item.color }"></div>
          </div>
          <span class="percent">{{ item.percent }}%</span>
        </div>
      </div>
    </section>

    <div class="search-card">
      <div class="search-row">
        <div class="field">
          <input type="date" v-model="filters.startDate">
        </div>
        <div class="field">
          <input type="date" v-model="filters.endDate">
        </div>
        <div class="field">
          <input type="text" placeholder="LOT 번호" v-model="filters.lotNo">
        </div>
        <div class="field">
          <select v-model="filters.discardStatus">
            <option value="">전체 사유</option>
            <option v-for="r in reasonOptions" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
        <BaseButton class="btn-search" @click="fetchData">검색</BaseButton>
      </div>
    </div>

    <div class="card">
        <table class="table">
            <thead>
            <tr>
                <th>NO</th>
                <th>폐기 일자</th>
                <th>품목 정보 (LOT)</th>
                <th>폐기량</th>
                <th>손실율</th>
                <th>폐기 사유</th>
                <th>처리자</th>
                <th>관리</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in items" :key="item.discardId">
                <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                <td>{{ item.discardedAt ? item.discardedAt.substring(0, 10) : '' }}</td>
                <td class="product-info">
                  <div>
                      <div class="p-name">LOT: {{ item.lotNo }}</div>
                  </div>
                </td>
                <td><strong>{{ item.quantity }}</strong></td>
                <td>{{ item.discardRate }}%</td>
                <td>
                    <StatusBadge :class="getReasonClass(item.discardStatus)">{{ item.discardStatus }}</StatusBadge>
                </td>
                <td><span class="handler-badge">{{ item.approvedEmailId }}</span></td>
                <td>
                    <BaseButton class="btn-soft" @click="openModal(item)">확인</BaseButton>
                </td>
            </tr>
            <tr v-if="items.length === 0">
                <td colspan="8">폐기 내역 데이터가 없습니다.</td>
            </tr>
            </tbody>
        </table>

        <Pagination
            :pages="pages"
            :current="currentPage"
            @update:current="changePage"
        />
    </div>
    <DiscardItemView :is-open="isModalOpen" :modal-data="selectedItem" @close="closeModal" />
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { getDiscardList, getDiscardVolume } from '@/api/DiscardApi.js';
import BaseButton from '@/components/button/BaseButton.vue';
import Pagination from '@/components/pagination/Pagination.vue';
import StatusBadge from '@/components/status/StatusBadge.vue';
import DiscardItemView from './DiscardItemView.vue';

const isModalOpen = ref(false);
const selectedItem = ref(null);

const items = ref([]);
const wasteRatios = ref([]);
const discardVolume = ref({ currentMonthVolume: 0, lastMonthVolume: 0 });

const filters = reactive({
    startDate: '',
    endDate: '',
    lotNo: '',
    discardStatus: '',
});

const reasonOptions = ['파손/손실', '유통기한', '부패/변질'];

const openModal = (item) => {
  selectedItem.value = item;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedItem.value = null;
};

const fetchListData = async () => {
  try {
    const response = await getDiscardList({
      page: currentPage.value,
      size: pageSize.value,
      ...filters
    });
    if (response.success && Array.isArray(response.data)) {
      items.value = response.data;
      const totalPages = Math.ceil(response.data.length / pageSize.value);
      makePages(totalPages > 0 ? totalPages : 1);
    } else {
      items.value = [];
      makePages(1);
    }
  } catch (error) {
    console.error('Failed to fetch discard list:', error);
    items.value = [];
    makePages(1);
  }
};

const fetchVolumeData = async () => {
  try {
    const response = await getDiscardVolume();
    if (response.success) {
      discardVolume.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch discard volume:', error);
  }
};

const volumeTrend = computed(() => {
  const { currentMonthVolume, lastMonthVolume } = discardVolume.value;
  if (lastMonthVolume === 0) {
    return {
      percentage: currentMonthVolume > 0 ? 100 : 0,
      trendClass: 'trend-up',
      icon: '↗',
    };
  }
  const percentage = Math.round(((currentMonthVolume - lastMonthVolume) / lastMonthVolume) * 100);
  const isUp = percentage >= 0;
  return {
    percentage: Math.abs(percentage),
    trendClass: isUp ? 'trend-up' : 'trend-down',
    icon: isUp ? '↗' : '↘',
  };
});

const getReasonClass = (status) => {
    if (status === '파손/손실') return 'status-info';
    if (status === '유통기한') return 'status-warning';
    if (status === '부패/변질') return 'status-danger';
    return '';
};

const currentPage = ref(1);
const pageSize = ref(10);
const pages = ref([]);

const makePages = (totalPages) => {
  pages.value = [];
  for(let i = 1; i <= totalPages; i++) {
    pages.value.push(i);
  }
};

const changePage = (page) => {
    currentPage.value = page;
};

onMounted(() => {
  fetchListData();
  fetchVolumeData();
});

watch(currentPage, fetchListData);
watch(filters, fetchListData); // 검색 조건 변경 시 다시 로드

</script>

<style scoped>
.admin-page { display: flex; flex-direction: column; gap: 16px; }
.desc { font-size: 13px; color: #6b7280; }
.page-header { margin-bottom: 8px; }

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr;
  gap: 20px;
  margin-bottom: 10px;
}
.summary-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}
.card-value {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 10px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.trend-up { font-size: 14px; font-weight: 700; color: #ef4444; }
.trend-down { font-size: 14px; font-weight: 700; color: #22c55e; }
.progress-bar {
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
}
.fill-danger { background: #ef4444; height: 100%; }
.fill-warning { background: #f59e0b; height: 100%; }

.ratio-card .card-header { margin-bottom: 16px; }
.ratio-item { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 13px; }
.ratio-item .label { width: 40px; color: #6b7280; }
.mini-bar-bg { flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; }
.mini-bar-fill { height: 100%; border-radius: 4px; }
.percent { width: 35px; font-weight: 600; text-align: right; color: #374151;}

/* Filter Box */
.search-card { background: #fff; border-radius: 12px; padding: 16px 20px; }
.search-row { display: flex; gap: 12px; align-items: center; }
.field { flex: 1; }
.search-row input, .search-row select { width: 100%; height: 40px; border: 1px solid #d1d5db; border-radius: 8px; padding: 0 12px; box-sizing: border-box; }
.btn-search { height: 40px; padding: 0 20px; background: #22c55e; color: #fff; white-space: nowrap; }

/* List Card */
.card { background: #fff; border-radius: 8px; padding: 16px; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; vertical-align: middle; }
th { background-color: #f9fafb; font-weight: 600; color: #374151; font-size: 13px; }

.product-info { text-align: left !important; }
.p-name { font-weight: 600; font-size: 14px; }

.handler-badge {
  background-color: #f3f4f6;
  color: #374151;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.btn-soft { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; font-weight: 600; }

.status-danger { background: #fee2e2; color: #b91c1c; }
.status-warning { background: #fef3c7; color: #b45309; }
.status-info { background: #e0e7ff; color: #3730a3; }
</style>
