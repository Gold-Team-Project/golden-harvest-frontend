<template>
  <div class="admin-container">
    <div class="breadcrumb">홈 / 거래 관리 / <strong>고객 주문 목록</strong></div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item">
          <label>기간 조회</label>
          <div class="date-range">
            <input type="date" class="basic-input" v-model="startDate" :max="endDate || undefined" />
            <span class="range-sep">~</span>
            <input type="date" class="basic-input" v-model="endDate" :min="startDate || undefined" />
          </div>
        </div>
        <div class="filter-item">
          <label>주문 상태</label>
          <select v-model="selectedStatus" class="basic-select">
            <option>전체</option>
            <option>주문 접수</option>
            <option>결제 완료</option>
            <option>배송 준비중</option>
            <option>배송 중</option>
            <option>배송 완료</option>
            <option>주문 취소</option>
          </select>
        </div>
        <div class="filter-item flex-2">
          <label>거래처 검색</label>
          <div class="search-input-wrapper">
            <img src="@/assets/search.svg" class="search-icon-svg" alt="search" />
            <input type="text" placeholder="찾으시는 거래처를 입력해주세요." v-model="searchCompany" @keyup.enter="loadOrders" />
          </div>
        </div>
        <button class="search-btn" @click="loadOrders">검색</button>
      </div>
    </div>

    <div class="list-card">
      <div class="card-header">
        <img src="@/assets/user-icon.svg" class="title-icon-svg" alt="list" />
        <h3>주문 내역</h3>
      </div>

      <div v-if="loading" class="loading-indicator">데이터를 불러오는 중...</div>
      <div v-else-if="error" class="error-message">오류: {{ error }}</div>

      <div v-else class="table-container">
        <table class="admin-table">
          <thead>
          <tr>
            <th style="width: 12%">주문번호</th>
            <th style="width: 15%">주문일시</th>
            <th style="width: 18%">거래처명</th>
            <th>주문 품목</th>
            <th style="width: 15%">총 주문금액</th>
            <th style="width: 12%">상태</th>
            <th style="width: 10%">관리</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="order in paginatedOrders" :key="order.id">
            <td class="bold-text">{{ order.number }}</td>
            <td>
              <div class="date-text">{{ order.date }}</div>
              <div class="time-text">{{ order.time }}</div>
            </td>
            <td class="text-left">{{ order.client }}</td>
            <td class="text-left">{{ order.items }}</td>
            <td class="bold-text price-text">{{ (order.amount || 0).toLocaleString() }}원</td>
            <td>
              <OrderStatusBadge :status="order.status" />
            </td>
            <td>
              <router-link :to="{ name: 'adminOrderDetail', params: { id: order.id } }">
                <button class="detail-btn">상세보기</button>
              </router-link>
            </td>
          </tr>
          <tr v-if="!paginatedOrders || paginatedOrders.length === 0">
            <td colspan="7" class="no-data">조회된 주문 내역이 없습니다.</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div v-if="paginatedOrders && paginatedOrders.length > 0" class="pagination-wrapper">
        <div class="pagination">
          <button class="arrow" :disabled="currentPage === 1" @click="currentPage--">&lt;</button>
          <button v-for="page in paginationPages" :key="page"
                  :class="['page', { active: currentPage === page }]"
                  @click="currentPage = page">
            {{ page }}
          </button>
          <button class="arrow" :disabled="currentPage === paginationPages.length" @click="currentPage++">&gt;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import OrderStatusBadge from '@/components/status/OrderStatusBadge.vue';
import { fetchAllOrders } from '@/api/OrderApi';

// 필터 상태
const startDate = ref('');
const endDate = ref('');
const selectedStatus = ref('전체');
const searchCompany = ref('');

// 데이터 상태
const orders = ref([]);
const loading = ref(true);
const error = ref(null);

// 페이지네이션 상태
const currentPage = ref(1);
const itemsPerPage = 5;
const totalOrders = ref(0);

// [수정] 안전한 페이징 데이터 계산
const paginatedOrders = computed(() => {
  if (!orders.value || !Array.isArray(orders.value)) return [];
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return orders.value.slice(start, end);
});

const paginationPages = computed(() => {
  const totalPages = Math.ceil(totalOrders.value / itemsPerPage);
  if (totalPages <= 0) return [1];
  return Array.from({ length: totalPages }, (_, i) => i + 1);
});

// 주문 데이터 로드
const loadOrders = async () => {
  loading.value = true;
  error.value = null;

  if (startDate.value && endDate.value && startDate.value > endDate.value) {
    alert('시작일은 종료일보다 늦을 수 없습니다.');
    loading.value = false;
    return;
  }

  try {
    const filters = {
      startDate: startDate.value,
      endDate: endDate.value,
      orderStatus: selectedStatus.value === '전체' ? null : selectedStatus.value,
    };
    const response = await fetchAllOrders(filters);

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
        let orderDate = '', orderTime = '';
        if (order.createdAt) {
          const dateTime = order.createdAt.split('T');
          orderDate = dateTime[0];
          orderTime = dateTime[1] ? dateTime[1].substring(0, 5) : '';
        }

        let itemsSummary = '주문 품목 없음';
        if (order.orderItems && order.orderItems.length > 0) {
          const firstItem = order.orderItems[0];
          const itemName = firstItem.itemName || firstItem.gradeName || '상품명 없음';
          itemsSummary = order.orderItems.length > 1 ? `${itemName} 외 ${order.orderItems.length - 1}건` : itemName;
        }

        const clientName = order.company || '거래처 정보 없음';
        if (searchCompany.value && !clientName.includes(searchCompany.value)) return null;

        return {
          id: order.salesOrderId,
          number: order.salesOrderId,
          date: orderDate,
          time: orderTime,
          client: clientName,
          items: itemsSummary,
          amount: order.totalAmount,
          status: mapOrderStatusToKey(order.orderStatus),
        };
      }).filter(Boolean);

      totalOrders.value = orders.value.length; // 전체 데이터 길이로 업데이트
      currentPage.value = 1;
    } else {
      error.value = response.message || '데이터를 불러오는데 실패했습니다.';
    }
  } catch (err) {
    error.value = 'API 호출 중 오류가 발생했습니다.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

watch([startDate, endDate, selectedStatus], () => {
  loadOrders();
});

onMounted(loadOrders);
</script>

<style scoped>
/* 1. 컨테이너: 스크롤바의 근본 원인을 계산식으로 해결 */
.admin-container {
  padding: 20px 50px;
  background-color: #f8f9fb;
  /* 패딩(40px)을 제외한 정확한 화면 높이 설정 */
  height: calc(100vh - 40px);
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.breadcrumb { font-size: 14px; color: #888; margin-bottom: 20px; flex-shrink: 0; }

/* 2. 필터 카드: 회원 관리 디자인 적용 */
.filter-card {
  background: #fff;
  padding: 30px;
  border-radius: 20px; /* 탭이 없으므로 대칭형 라운드 적용 */
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  margin-bottom: 30px;
  border: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.filter-grid { display: flex; gap: 15px; align-items: flex-end; }
.filter-item { display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 0; }
.filter-item.flex-2 { flex: 1.8; }
.filter-item label { font-size: 14px; font-weight: 700; color: #444; text-align: left; }

/* 3. 인풋 & 버튼: 시스템 공통 디자인 */
.date-range { display: flex; align-items: center; gap: 8px; }
.range-sep { color: #ccc; }
.search-input-wrapper { position: relative; width: 100%; }
.search-icon-svg { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); width: 18px; opacity: 0.5; }

.search-input-wrapper input, .basic-input, .basic-select {
  width: 100%; height: 45px; padding: 0 15px; border: 1px solid #C8E4C8;
  border-radius: 10px; background: white; font-size: 14px; outline: none; transition: all 0.2s; box-sizing: border-box;
}
.search-input-wrapper input { padding-left: 45px; }
.search-input-wrapper input:focus, .basic-input:focus, .basic-select:focus {
  border-color: #11D411 !important; box-shadow: 0 0 0 3px rgba(17, 212, 17, 0.05);
}

.search-btn {
  background: #11D411; color: #fff; border: none; padding: 0 35px; height: 45px;
  border-radius: 10px; font-weight: 700; cursor: pointer; flex-shrink: 0; transition: all 0.2s;
}
.search-btn:hover { background-color: #0fb80f; }

/* 4. 리스트 카드 및 테이블 */
.list-card {
  background: #fff;
  border-radius: 20px;
  padding: 30px;
  border: 1px solid #e0e0e0;
  flex: 1; /* 남은 공간 모두 차지 */
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 25px; flex-shrink: 0; }
.card-header h3 { margin: 0; font-size: 18px; font-weight: 700; }
.title-icon-svg { width: 22px; }

.table-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  width: 100%;
}
/* 테이블 스크롤바 디자인 (커스텀하거나 숨김) */
.table-container::-webkit-scrollbar { width: 6px; height: 6px; }
.table-container::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }

.admin-table { width: 100%; border-collapse: collapse; min-width: 900px; table-layout: fixed; }
.admin-table th { padding: 15px; text-align: center; color: #888; border-bottom: 2px solid #f4f4f4; font-size: 14px; background: #fff; position: sticky; top: 0; z-index: 1; }
.admin-table td { padding: 15px 10px; font-size: 14px; border-bottom: 1px solid #f9f9f9; text-align: center; vertical-align: middle; }

/* 텍스트 디테일 */
.text-left { text-align: left !important; padding-left: 20px !important; }
.bold-text { font-weight: 700; color: #333; }
.price-text { color: #11D411; font-weight: 700; }
.date-text { font-weight: 600; }
.time-text { font-size: 12px; color: #999; }

.detail-btn { background: #f1f3f5; border: 1px solid #dee2e6; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; transition: all 0.2s; }
.detail-btn:hover { background: #e9ecef; }

/* 페이지네이션 */
.pagination-wrapper { margin-top: auto; padding-top: 20px; flex-shrink: 0; }
.pagination { display: flex; justify-content: center; gap: 5px; }
.page, .arrow {
  min-width: 32px; height: 32px; border-radius: 6px; border: 1px solid #eee;
  background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.page.active { background: #11D411; color: #fff; border-color: #11D411; font-weight: 700; }

.loading-indicator, .no-data { padding: 50px 0; text-align: center; color: #999; }
</style>