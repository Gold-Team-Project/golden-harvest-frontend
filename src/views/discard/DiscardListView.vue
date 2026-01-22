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
          1,240 kg <span class="trend-up">↗ +12%</span>
        </div>
        <div class="progress-bar">
          <div class="fill-danger" style="width: 70%"></div>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-header">
          <span>이번 달 폐기 손실액</span>
        </div>
        <div class="card-value">
          4,500,000 <span class="trend-down">↘ -12%</span>
        </div>
        <div class="progress-bar">
          <div class="fill-warning" style="width: 40%"></div>
        </div>
      </div>

      <div class="summary-card ratio-card">
        <div class="card-header">
          <span>품목별 폐기 비율 (30일)</span>
        </div>
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
          <input type="text" placeholder="품목명 또는 코드" v-model="filters.searchKeyword">
        </div>
        <div class="field">
          <select v-model="filters.reason">
            <option value="all">전체 사유</option>
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
                <th>품목 정보</th>
                <th>폐기량</th>
                <th>손실</th>
                <th>폐기 사유</th>
                <th>처리자</th>
                <th>관리</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in tableData" :key="item.no">
                <td>{{ item.no }}</td>
                <td>{{ item.date }}</td>
                <td class="product-info">
                <img :src="item.imageUrl" alt="product" class="product-image"/>
                <div>
                    <div class="p-name">{{ item.productName }}</div>
                    <div class="p-code">CODE : {{ item.productCode }}</div>
                </div>
                </td>
                <td><strong>{{ item.amount }}</strong></td>
                <td>약 {{ item.loss.toLocaleString() }}원</td>
                <td>
                    <StatusBadge :class="getReasonClass(item.reason)">{{ item.reason }}</StatusBadge>
                </td>
                <td><span class="handler-badge">{{ item.handler }}</span></td>
                <td>
                    <BaseButton class="btn-soft" @click="openModal(item)">확인</BaseButton>
                </td>
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
import { ref, reactive } from 'vue';
import BaseButton from '@/components/button/BaseButton.vue';
import Pagination from '@/components/pagination/Pagination.vue';
import StatusBadge from '@/components/status/StatusBadge.vue';
import DiscardItemView from './DiscardItemView.vue';

const isModalOpen = ref(false);
const selectedItem = ref(null);

const openModal = (item) => {
  selectedItem.value = item;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedItem.value = null;
};

const wasteRatios = ref([
    { name: '사과', percent: 46, color: '#4ade80' },
    { name: '수박', percent: 30, color: '#facc15' },
    { name: '포도', percent: 15, color: '#60a5fa' }
]);

const filters = reactive({
    startDate: '',
    endDate: '',
    searchKeyword: '',
    reason: 'all'
});

const reasonOptions = ['파손/손실', '유통기한', '부패/변질'];

const tableData = ref(Array(5).fill({
    no: 102,
    date: '2023-10-24 14:30',
    productName: '프리미엄 부산 사과',
    productCode: 'A-1023',
    amount: '20kg',
    loss: 90000,
    reason: '파손/손실',
    handler: '관리자',
    imageUrl: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=100&q=60',
}).map((item, i, arr) => {
    let reason = item.reason;
    if (i === 1) reason = '유통기한';
    if (i === 2) reason = '부패/변질';
    return { ...item, no: arr.length - i, reason: reason };
}));

const fetchData = () => {
    console.log('검색 조건으로 API 호출:', filters);
};

const getReasonClass = (reason) => {
    if (reason === '파손/손실') return 'status-info';
    if (reason === '유통기한') return 'status-warning';
    if (reason === '부패/변질') return 'status-danger';
    return '';
};

// Mock Pagination
const currentPage = ref(1);
const pages = ref([1, 2, 3, 4, 5]);
const changePage = (page) => {
    currentPage.value = page;
};

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

.product-info { display: flex; align-items: center; gap: 12px; text-align: left !important; }
.product-image { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; border: 1px solid #e5e7eb; }
.p-name { font-weight: 600; font-size: 14px; }
.p-code { font-size: 12px; color: #9ca3af; }

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
