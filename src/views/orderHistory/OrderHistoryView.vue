<template>
  <div class="order-history-view">
    <div class="card">
      <div class="filter-section">
        <div class="filter-group">
          <label class="filter-label">기간 조회</label>
          <div class="date-inputs">
            <input type="date" class="date-input" v-model="startDate" :max="endDate || undefined" />
            <span>~</span>
            <input type="date" class="date-input" v-model="endDate" :min="startDate || undefined" />
          </div>
        </div>
        <BaseButton @click="applyFilter">조회하기</BaseButton>
      </div>
    </div>

    <div class="card">
      <div v-if="loading" class="list-summary">데이터를 불러오는 중...</div>
      <div v-else-if="error" class="list-summary" style="color: red;">오류: {{ error }}</div>
      <div v-else class="list-summary">
        총 {{ totalOrders }}건의 주문 내역이 있습니다.
      </div>

      <div class="table-responsive">
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
            <tr v-for="order in paginatedOrders" :key="order.id">
              <td>{{ order.date }}</td>
              <td>{{ order.productName }}</td>
              <td>{{ order.quantity }}</td>
              <td>{{ order.amount.toLocaleString() }}원</td>
              <td>
                <OrderStatusBadge :status="order.status" />
              </td>
              <td>
                <router-link :to="{ name: 'OrderDetail', params: { id: order.id } }" class="detail-link">
                  <BaseButton size="sm" variant="outline">상세보기</BaseButton>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
import {ref, computed, onMounted, watch} from 'vue'
import BaseButton from '@/components/button/BaseButton.vue'
import OrderStatusBadge from '@/components/status/OrderStatusBadge.vue'
import Pagination from '@/components/pagination/Pagination.vue'
import {fetchMyOrders} from '@/api/OrderApi'

const orders = ref([]);
const currentPage = ref(1);
const itemsPerPage = 10;
const totalOrders = ref(0);
const loading = ref(true);
const error = ref(null);

const startDate = ref('');
const endDate = ref('');

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return orders.value.slice(start, end);
});

const paginationPages = computed(() => {
  const totalPages = Math.ceil(totalOrders.value / itemsPerPage);
  if (totalPages === 0) return [1];
  return Array.from({ length: totalPages }, (_, i) => i + 1);
});

const loadOrders = async (filters = {}) => { // loadOrders now accepts filters
  loading.value = true;
  error.value = null;
  try {
    const response = await fetchMyOrders(filters); // Pass filters to fetchMyOrders

    if (response.success && response.data) {
      const mapOrderStatusToKey = (status) => {
        switch (status) {
          case '주문 완료': return 'PENDING';
          case '상품 준비중': return 'PAID';
          case '배송 준비중': return 'PREPARING';
          case '배송 중': return 'SHIPPING';
          case '배송 완료': return 'DELIVERED';
          case '주문 취소': return 'CANCELLED';
          default: return 'UNKNOWN';
        }
      };

      orders.value = response.data.content.map(order => {
        let productName = '상품명 없음';
        let totalQuantity = 0;

        if (order.orderItems && order.orderItems.length > 0) {
          const firstItem = order.orderItems[0];
          productName = firstItem.itemName || firstItem.gradeName || firstItem.varietyName || '상품명 없음';
          if (order.orderItems.length > 1) {
            productName += ` 외 ${order.orderItems.length - 1}건`;
          }
          totalQuantity = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
        }

        return {
          id: order.salesOrderId,
          date: order.createdAt,
          productName: productName,
          quantity: totalQuantity,
          amount: order.totalAmount,
          status: mapOrderStatusToKey(order.orderStatus),
        };
      });
      totalOrders.value = response.data.totalElements;
    } else {
      error.value = response.message || '주문 내역을 불러오는데 실패했습니다.';
    }
  } catch (err) {
    error.value = 'API 호출 중 오류가 발생했습니다: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const applyFilter = () => {
  currentPage.value = 1; // Reset to first page on filter change
  
  if (startDate.value && endDate.value && startDate.value > endDate.value) {
    alert('시작일은 종료일보다 늦을 수 없습니다.');
    return; // Prevent API call
  }

  const filters = {
    startDate: startDate.value,
    endDate: endDate.value,
  };
  loadOrders(filters);
};

onMounted(() => {
  applyFilter(); // Initial load with filters
});

watch(currentPage, () => {
  // If we were fetching data per page, we would call loadOrders here with page parameter.
  // Since we fetch all and paginate client-side, no need to re-fetch.
});

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

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px; /* Adjust gap for stacked items */
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
    gap: 8px; /* Adjust gap for stacked items */
  }

  .date-inputs {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    width: 100%; /* Ensure date inputs take full width when stacked */
  }

  .date-input {
    width: 100%;
  }

  .filter-section > .BaseButton { /* Target the BaseButton directly inside filter-section */
    width: 100%;
  }
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}
</style>
