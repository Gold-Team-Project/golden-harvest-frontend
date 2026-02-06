<template>
  <div class="admin-container">
    <div class="breadcrumb">홈 / 거래 관리 / <strong>주문 내역 조회</strong></div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item flex-2">
          <label>기간 조회</label>
          <div class="date-inputs">
            <input type="date" class="basic-input" v-model="startDate" :max="endDate || undefined" />
            <span class="date-separator">~</span>
            <input type="date" class="basic-input" v-model="endDate" :min="startDate || undefined" />
          </div>
        </div>
        <div class="filter-item"></div>
        <div class="filter-item"></div>

        <button class="search-btn" @click="applyFilter">조회하기</button>
      </div>
    </div>

    <div class="list-card">
      <div class="card-header-between">
        <div class="header-left">
          <img src="@/assets/search.svg" class="title-icon-svg" alt="list" />
          <h3 v-if="loading">데이터를 불러오는 중...</h3>
          <h3 v-else-if="error" style="color: #ef4444;">오류 발생</h3>
          <h3 v-else>총 <strong>{{ totalOrders }}</strong>건의 주문 내역</h3>
        </div>
      </div>

      <div class="table-container">
        <table class="admin-table">
          <thead>
          <tr>
            <th style="width: 15%">주문일자</th>
            <th style="width: 35%">상품명</th>
            <th style="width: 10%">수량</th>
            <th style="width: 15%">결제금액</th>
            <th style="width: 15%">주문상태</th>
            <th style="width: 10%">관리</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="order in paginatedOrders" :key="order.id">
            <td>{{ order.date }}</td>
            <td class="bold">{{ order.productName }}</td>
            <td>{{ order.quantity }}</td>
            <td class="price-text">{{ order.amount.toLocaleString() }}원</td>
            <td>
              <OrderStatusBadge :status="order.status" />
            </td>
            <td>
              <router-link :to="{ name: 'OrderDetail', params: { id: order.id } }" class="detail-link">
                <button class="detail-btn">상세보기</button>
              </router-link>
            </td>
          </tr>
          <tr v-if="!loading && paginatedOrders.length === 0">
            <td colspan="6" class="empty-row">주문 내역이 존재하지 않습니다.</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-wrapper">
        <div class="pagination">
          <button class="arrow" :disabled="currentPage === 1" @click="currentPage--">&lt;</button>
          <button
              v-for="page in paginationPages"
              :key="page"
              :class="['page', { active: currentPage === page }]"
              @click="currentPage = page"
          >
            {{ page }}
          </button>
          <button class="arrow" :disabled="currentPage === paginationPages.length" @click="currentPage++">&gt;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue'
import OrderStatusBadge from '@/components/status/OrderStatusBadge.vue'
import {fetchMyOrders} from '@/api/OrderApi'

// --- 로직은 기존과 동일 ---
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

const loadOrders = async (filters = {}) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetchMyOrders(filters);
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
          if (order.orderItems.length > 1) productName += ` 외 ${order.orderItems.length - 1}건`;
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
  } finally {
    loading.value = false;
  }
};

const applyFilter = () => {
  currentPage.value = 1;
  if (startDate.value && endDate.value && startDate.value > endDate.value) {
    alert('시작일은 종료일보다 늦을 수 없습니다.');
    return;
  }
  loadOrders({ startDate: startDate.value, endDate: endDate.value });
};

onMounted(() => { applyFilter(); });
watch(currentPage, () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
</script>

<style scoped>
/* 관리자 공통 레이아웃 스타일 적용 */
.admin-container { padding: 20px 50px; background-color: #f8f9fb; min-height: 100vh; text-align: left; box-sizing: border-box; }
.breadcrumb { font-size: 14px; color: #888; margin-bottom: 20px; }

/* 필터 카드 디자인 */
.filter-card {
  background: #fff; padding: 30px; border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 30px; border: 1px solid #e0e0e0;
}
.filter-grid { display: flex; gap: 15px; align-items: flex-end; }
.filter-item { display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 0; }
.filter-item.flex-2 { flex: 1.5; }
.filter-item label { font-size: 14px; font-weight: 700; color: #444; }

.date-inputs { display: flex; align-items: center; gap: 10px; }
.date-separator { color: #888; font-weight: bold; }

/* 인풋 및 버튼 공통 스타일 */
.basic-input {
  width: 100%; height: 45px; padding: 0 15px; border: 1px solid #C8E4C8;
  border-radius: 10px; background: white; font-size: 14px; outline: none; transition: all 0.2s; box-sizing: border-box;
}
.basic-input:focus { border-color: #11D411 !important; box-shadow: 0 0 0 3px rgba(17, 212, 17, 0.05); }

.search-btn {
  background: #11D411; color: #fff; border: none; padding: 0 35px; height: 45px;
  border-radius: 10px; font-weight: 700; cursor: pointer; flex-shrink: 0; transition: all 0.2s;
}
.search-btn:hover { background-color: #0fb80f; }

/* 리스트 카드 스타일 */
.list-card {
  background: #fff; border-radius: 20px; padding: 30px; border: 1px solid #e0e0e0;
  min-height: 550px; display: flex; flex-direction: column;
}
.card-header-between { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.header-left { display: flex; align-items: center; gap: 10px; }
.header-left h3 { font-size: 18px; font-weight: 700; color: #333; margin: 0; }
.header-left h3 strong { color: #11D411; }
.title-icon-svg { width: 22px; }

/* 테이블 스타일 */
.table-container { flex: 1; overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.admin-table th { padding: 15px; text-align: left; color: #888; border-bottom: 2px solid #f4f4f4; font-size: 14px; background: #fff; }
.admin-table td { padding: 18px 15px; font-size: 14px; border-bottom: 1px solid #f9f9f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.bold { font-weight: 700; color: #333; }
.price-text { color: #11D411; font-weight: 700; }
.empty-row { padding: 100px 0 !important; text-align: center !important; color: #999; font-size: 16px; }

/* 버튼 및 상세 링크 */
.detail-link { text-decoration: none; }
.detail-btn {
  background: #f1f3f5; border: 1px solid #dee2e6; padding: 8px 16px;
  border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;
}
.detail-btn:hover { background: #e9ecef; border-color: #ced4da; }

/* 페이지네이션 */
.pagination-wrapper { margin-top: auto; padding-top: 30px; }
.pagination { display: flex; justify-content: center; gap: 5px; }
.page, .arrow {
  min-width: 32px; height: 32px; border-radius: 6px; border: 1px solid #eee;
  background: transparent; cursor: pointer; color: #666; font-weight: 600; transition: all 0.2s;
}
.page.active { background: #11D411; color: #fff; border-color: #11D411; }
.page:hover:not(.active), .arrow:hover:not(:disabled) { border-color: #11D411; color: #11D411; }
.arrow:disabled { opacity: 0.3; cursor: not-allowed; }
</style>