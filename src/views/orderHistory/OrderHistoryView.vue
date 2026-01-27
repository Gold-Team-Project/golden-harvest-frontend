<template>
  <div class="order-history-view">
    <div class="card">
      <div class="filter-section">
        <div class="filter-group">
          <label class="filter-label">기간 조회</label>
          <div class="date-inputs">
            <input type="date" class="date-input" />
            <span>~</span>
            <input type="date" class="date-input" />
          </div>
        </div>
        <BaseButton>조회하기</BaseButton>
      </div>
    </div>

    <div class="card">
      <div class="list-summary">
        총 {{ orders.length }}건의 주문 내역이 있습니다.
      </div>

      <table class="order-table">
        <thead>
          <tr>
            <th>주문일자</th>
            <th>상품명</th>
            <th>수량</th>
            <th>결제금액</th>
            <th>주문상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ order.date }}</td>
            <td>{{ order.productName }}</td>
            <td>{{ order.quantity }}</td>
            <td>{{ order.amount.toLocaleString() }}원</td>
            <td>
              <StatusBadge :status="order.status" />
            </td>
            <td>
              <router-link :to="{ name: 'OrderDetail', params: { id: order.id } }" class="detail-link">
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
import {ref, computed} from 'vue'
import BaseButton from '@/components/button/BaseButton.vue'
import StatusBadge from '@/components/status/StatusBadge.vue'
import Pagination from '@/components/pagination/Pagination.vue'

const orders = ref([
  { id: 1, date: '2023.10.25', productName: '제주 감귤 10kg 외 5건', quantity: 5, amount: 100000, status: '주문완료' },
  { id: 2, date: '2023.10.25', productName: '제주 감귤 10kg 외 5건', quantity: 5, amount: 100000, status: '상품준비중' },
  { id: 3, date: '2023.10.25', productName: '제주 감귤 10kg 외 5건', quantity: 5, amount: 100000, status: '상품준비중' },
  { id: 4, date: '2023.10.25', productName: '제주 감귤 10kg 외 5건', quantity: 5, amount: 100000, status: '배송중' },
  { id: 5, date: '2023.10.25', productName: '제주 감귤 10kg 외 5건', quantity: 5, amount: 100000, status: '배송중' },
  { id: 6, date: '2023.10.25', productName: '제주 감귤 10kg 외 5건', quantity: 5, amount: 100000, status: '배송완료' },
  { id: 7, date: '2023.10.25', productName: '제주 감귤 10kg 외 5건', quantity: 5, amount: 100000, status: '주문취소' },
  { id: 8, date: '2023.10.25', productName: '제주 감귤 10kg 외 5건', quantity: 5, amount: 100000, status: '배송완료' },
  { id: 9, date: '2023.10.25', productName: '제주 감귤 10kg 외 5건', quantity: 5, amount: 100000, status: '주문취소' },
]);

const currentPage = ref(1);
const paginationPages = computed(() => [1, 2, 3, 4, 5, 6, 7, 8, 9]);

</script>

<style scoped>
.order-history-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-link {
  text-decoration: none;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  width: 150px;
}

.list-summary {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 16px;
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
}

.order-table th {
  background-color: #f9fafb;
  color: #6b7280;
  font-weight: 600;
}

.order-table td {
  color: #374151;
}

.pagination {
  margin-top: 24px;
}
</style>
