<template>
  <div class="admin-order-list-view">
    <div class="card filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label>기간 조회</label>
          <div class="date-inputs">
            <input type="date" class="date-input" />
            <span>~</span>
            <input type="date" class="date-input" />
          </div>
        </div>
        <div class="filter-group">
          <label>주문 상태</label>
          <select>
            <option>전체</option>
            <option>입금</option>
            <option>주문취소</option>
            <option>배송완료</option>
            <option>배송중</option>
            <option>주문완료</option>
            <option>상품준비중</option>
          </select>
        </div>
        <div class="filter-group search-group">
          <label>거래처 검색</label>
          <input placeholder="찾으시는 상품을 입력해주세요." />
        </div>
        <BaseButton>검색</BaseButton>
      </div>
    </div>

    <div class="card">
      <table class="order-table">
        <thead>
          <tr>
            <th>주문번호</th>
            <th>주문일시</th>
            <th>거래처명</th>
            <th>주문 품목</th>
            <th>총 주문금액</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ order.number }}</td>
            <td>{{ order.date }}<br>{{ order.time }}</td>
            <td>{{ order.client }}</td>
            <td>{{ order.items }}</td>
            <td>{{ order.amount.toLocaleString() }}원</td>
                        <td>
              <StatusBadge :status="order.status" />
            </td>
            <td>
              <router-link :to="{ name: 'adminOrderDetail', params: { id: order.id } }" class="detail-link">
                <BaseButton size="sm" variant="outline">상세보기</BaseButton>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>

      <Pagination
        class="pagination"
        :pages="paginationPages"
        :current="currentPage"
        @update:current="currentPage = $event"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseButton from '@/components/button/BaseButton.vue';
import StatusBadge from '@/components/status/StatusBadge.vue';
import Pagination from '@/components/pagination/Pagination.vue';

const orders = ref([
    { id: 1, number: '#ORD-2023-001', date: '2023-10-24', time: '10:30 AM', client: '김묵주식회사', items: '제주 감귤 외 1건', amount: 550000, status: '입금' },
    { id: 2, number: '#ORD-2023-001', date: '2023-10-24', time: '10:30 AM', client: '김묵주식회사', items: '제주 감귤 외 1건', amount: 550000, status: '주문취소' },
    { id: 3, number: '#ORD-2023-001', date: '2023-10-24', time: '10:30 AM', client: '김묵주식회사', items: '제주 감귤 외 1건', amount: 550000, status: '배송완료' },
    { id: 4, number: '#ORD-2023-001', date: '2023-10-24', time: '10:30 AM', client: '김묵주식회사', items: '제주 감귤 외 1건', amount: 550000, status: '배송중' },
    { id: 5, number: '#ORD-2023-001', date: '2023-10-24', time: '10:30 AM', client: '김묵주식회사', items: '제주 감귤 외 1건', amount: 550000, status: '주문완료' },
    { id: 6, number: '#ORD-2023-001', date: '2023-10-24', time: '10:30 AM', client: '김묵주식회사', items: '제주 감귤 외 1건', amount: 550000, status: '상품준비중' },
    { id: 7, number: '#ORD-2023-001', date: '2023-10-24', time: '10:30 AM', client: '김묵주식회사', items: '제주 감귤 외 1건', amount: 550000, status: '배송완료' },
    { id: 8, number: '#ORD-2023-001', date: '2023-10-24', time: '10:30 AM', client: '김묵주식회사', items: '제주 감귤 외 1건', amount: 550000, status: '배송완료' },
]);

const currentPage = ref(1);
const paginationPages = computed(() => [1, 2, 3, 4, 5, 6, 7, 8, 9]);
</script>

<style scoped>
.admin-order-list-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
.filter-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-group label {
  font-size: 14px;
  color: #374151;
  flex-shrink: 0;
}
.filter-group select, .filter-group input {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
}
.date-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-group {
  flex: 1;
}
.search-group input {
  width: 100%;
}
.order-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.order-table th,
.order-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}
.order-table th {
  background-color: #f9fafb;
  color: #6b7280;
  font-weight: 600;
}
.order-table td {
  color: #374151;
}
.order-table td:nth-child(2) {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.4;
}
.pagination {
  margin-top: 24px;
}
</style>
