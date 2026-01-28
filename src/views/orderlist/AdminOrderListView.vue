<template>
  <div class="admin-order-list-view">
    <div class="page-header">
      <div>
        <p class="desc">홈 / 거래 관리 / 고객 주문 목록 </p>
      </div>
    </div>

    <div class="card filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label>기간 조회</label>
          <div class="date-inputs">
            <input type="date" class="date-input" v-model="startDate" :max="endDate || undefined" />
            <span>~</span>
            <input type="date" class="date-input" v-model="endDate" :min="startDate || undefined" />
          </div>
        </div>
        <div class="filter-group">
          <label>주문 상태</label>
          <select v-model="selectedStatus">
            <option>전체</option>
            <option>주문 접수</option>
            <option>결제 완료</option>
            <option>배송 준비중</option>
            <option>배송 중</option>
            <option>배송 완료</option>
            <option>주문 취소</option>
          </select>
        </div>
        <div class="filter-group search-group">
          <label>거래처 검색</label>
          <input placeholder="찾으시는 거래처를 입력해주세요." v-model="searchCompany" />
        </div>
        <BaseButton @click="loadOrders">검색</BaseButton>
      </div>
    </div>

    <div class="card">
      <div v-if="loading" class="loading-indicator">데이터를 불러오는 중...</div>
      <div v-else-if="error" class="error-message" style="color: red;">오류: {{ error }}</div>
      <div v-else-if="paginatedOrders.length === 0" class="no-data-message">조회된 주문 내역이 없습니다.</div>
      <div v-else class="table-responsive">
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
            <tr v-for="order in paginatedOrders" :key="order.id">
              <td>{{ order.number }}</td>
              <td>{{ order.date }}<br>{{ order.time }}</td>
              <td>{{ order.client }}</td>
              <td>{{ order.items }}</td>
              <td>{{ order.amount.toLocaleString() }}원</td>
              <td>
                <OrderStatusBadge :status="order.status" />
              </td>
              <td>
                <router-link :to="{ name: 'adminOrderDetail', params: { id: order.id } }" class="detail-link">
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
import { ref, computed, onMounted, watch } from 'vue';
import BaseButton from '@/components/button/BaseButton.vue';
import OrderStatusBadge from '@/components/status/OrderStatusBadge.vue';
import Pagination from '@/components/pagination/Pagination.vue';
import { fetchAllOrders } from '@/api/OrderApi';

// Filter States
const startDate = ref('');
const endDate = ref('');
const selectedStatus = ref('전체');
const searchCompany = ref(''); // API doesn't support company filter, but keeping for UI

// Order List States
const orders = ref([]);
const loading = ref(false);
const error = ref(null);

// Pagination States
const currentPage = ref(1);
const itemsPerPage = 10;
const totalOrders = ref(0);

// Computed properties for pagination
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

// Function to load orders from API
    const loadOrders = async () => {
      loading.value = true;
      error.value = null;
      
      if (startDate.value && endDate.value && startDate.value > endDate.value) {
        alert('시작일은 종료일보다 늦을 수 없습니다.');
        loading.value = false; // Important: reset loading state if validation fails
        return; // Prevent API call
      }

      try {
        const filters = {
          startDate: startDate.value,
          endDate: endDate.value,
          orderStatus: selectedStatus.value === '전체' ? null : selectedStatus.value, // Pass null if "전체"
          // API currently doesn't support searchCompany
        };
        const response = await fetchAllOrders(filters);
        if (response.success && response.data) {
          const mapOrderStatusToKey = (status) => {
            switch (status) {
              case '주문 접수': return 'PENDING';
              case '상품 준비중': return 'PAID'; // API sends '상품 준비중' for PAID status
              case '배송 준비중': return 'PREPARING';
              case '배송 중': return 'SHIPPING';
              case '배송 완료': return 'DELIVERED';
              case '주문 취소': return 'CANCELLED';
              default: return 'UNKNOWN';
            }
          };

          orders.value = response.data.map(order => {
            let orderDate = '';
            let orderTime = '';
            if (order.createdAt) {
              const dateTime = order.createdAt.split('T'); // Assuming "YYYY-MM-DDTHH:mm:ss"
              orderDate = dateTime[0];
              orderTime = dateTime[1] ? dateTime[1].substring(0, 5) : ''; // HH:mm
            }

            let itemsSummary = '주문 품목 없음';
            if (order.orderItems && order.orderItems.length > 0) {
              const firstItem = order.orderItems[0];
              const itemName = firstItem.itemName || firstItem.gradeName || firstItem.varietyName || '상품명 없음';
              if (order.orderItems.length > 1) {
                itemsSummary = `${itemName} 외 ${order.orderItems.length - 1}건`;
              } else {
                itemsSummary = itemName;
              }
            }
            
            // Filtering by client-side for `searchCompany` as API does not support it
            const clientName = order.company || '거래처 정보 없음';
            if (searchCompany.value && !clientName.includes(searchCompany.value)) {
                return null; // Exclude this order if it doesn't match search
            }

            return {
              id: order.salesOrderId,
              number: order.salesOrderId, // Using salesOrderId as order number
              date: orderDate,
              time: orderTime,
              client: clientName,
              items: itemsSummary,
              amount: order.totalAmount,
              status: mapOrderStatusToKey(order.orderStatus), // Use mapped status
            };
          }).filter(Boolean); // Remove null entries from filtering

          totalOrders.value = orders.value.length;
          currentPage.value = 1; // Reset to first page on new search/filter
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

// Watch for filter changes and reload orders
watch([startDate, endDate, selectedStatus], () => {
  loadOrders();
});


// Initial load on component mount
onMounted(() => {
  loadOrders();
});
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
.loading-indicator, .error-message, .no-data-message {
  padding: 20px;
  text-align: center;
  font-size: 16px;
  color: #6b7280;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    width: 100%; /* Make filter groups take full width */
  }

  .date-inputs {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    width: 100%;
  }

  .date-input,
  .filter-group select,
  .filter-group input {
    width: 100%; /* Make inputs and selects take full width */
  }

  .filter-row > .BaseButton { /* Target the BaseButton directly inside filter-row */
    width: 100%;
  }
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.page-header {
  margin-bottom: 8px;
}

.desc {
  font-size: 13px;
  color: #6b7280;
}
</style>