<template>
  <div class="admin-container">
    <div class="breadcrumb">홈 / 주문 관리 / <strong>주문 상세 내역</strong></div>

    <div v-if="loading" class="loading-state">
      <p>주문 상세 정보를 불러오는 중...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>오류: {{ error }}</p>
    </div>

    <div v-else-if="orderDetail" class="order-content-layout">
      <div class="main-column">
        <div class="filter-card header-card">
          <div class="order-title-group">
            <h2 class="order-id">주문 #{{ orderDetail.salesOrderId }}</h2>
            <p class="order-date">주문일시: {{ orderDetail.createdAt }}</p>
          </div>
          <div class="status-badge-wrap">
            <span :class="['status-badge', orderStatusKey]">{{ orderDetail.orderStatus }}</span>
          </div>
        </div>

        <div class="list-card">
          <div class="card-header">
            <img src="@/assets/search.svg" class="title-icon-svg" alt="list" />
            <h3>주문 품목 리스트</h3>
          </div>

          <div class="table-container">
            <table class="admin-table">
              <thead>
              <tr>
                <th style="width: 50%">상품 정보</th>
                <th style="width: 15%">단가</th>
                <th style="width: 10%">수량</th>
                <th style="width: 25%">합계</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="item in items" :key="item.id">
                <td>
                  <div class="item-info-box">
                    <img :src="item.image || '/placeholder.png'" class="item-thumb" />
                    <div class="item-txt">
                      <p class="name">{{ item.name }}</p>
                      <p class="code">코드: {{ item.code }} | 옵션: {{ item.option }}</p>
                    </div>
                  </div>
                </td>
                <td class="bold">{{ item.price.toLocaleString() }}원</td>
                <td>{{ item.quantity }}</td>
                <td class="bold price-text text-right">{{ (item.price * item.quantity).toLocaleString() }}원</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div class="final-summary">
            <div class="summary-box">
              <span class="total-qty">총 수량: <strong>{{ totalQuantity }}개</strong></span>
              <span class="total-amt">최종 합계: <strong class="green-text">{{ totalAmount.toLocaleString() }}원</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div class="side-column">
        <div class="info-card">
          <div class="info-header">
            <img src="@/assets/user-icon.svg" class="info-icon" alt="shipping" />
            <h4>배송 정보</h4>
          </div>
          <div v-if="orderDetail.customerInfo" class="info-content">
            <div class="info-row"><span class="label">수령인</span><span class="val">{{ orderDetail.customerInfo.name }}</span></div>
            <div class="info-row"><span class="label">연락처</span><span class="val">{{ orderDetail.customerInfo.phoneNumber }}</span></div>
            <div class="info-row"><span class="label">주소</span><span class="val address">{{ customerAddress }}</span></div>
          </div>
          <div class="progress-section">
            <OrderProgress :status="orderStatusKey" />
          </div>
        </div>

        <div class="info-card">
          <div class="info-header">
            <img src="@/assets/card.svg" class="info-icon" alt="payment" />
            <h4>결제 정보</h4>
          </div>
          <div class="info-content">
            <div class="info-row"><span class="label">결제수단</span><span class="val">무통장 입금</span></div>
            <div class="info-row"><span class="label">입금자명</span><span class="val">프레시마켓</span></div>
            <div class="info-row"><span class="label">결제상태</span><span class="val highlight">입금 대기</span></div>
            <div class="total-payment-row">
              <span class="label">총 결제 금액</span>
              <span class="amount">{{ totalAmount.toLocaleString() }}원</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import OrderProgress from '@/views/orderlist/OrderProgress.vue'
import { fetchOrderDetail } from '@/api/OrderApi.js'

const route = useRoute()
const orderDetail = ref(null)
const loading = ref(true)
const error = ref(null)

const items = computed(() => {
  if (!orderDetail.value || !orderDetail.value.orderItems) return []
  return orderDetail.value.orderItems.map((item, index) => ({
    id: index,
    name: item.itemName || item.gradeName || item.varietyName || '상품명 없음',
    code: item.gradeName || '코드 없음',
    option: item.varietyName || '옵션 없음',
    price: item.price,
    quantity: item.quantity,
    image: item.itemImage || '',
  }))
})

const totalQuantity = computed(() => {
  if (!orderDetail.value || !orderDetail.value.orderItems) return 0;
  return orderDetail.value.orderItems.reduce((sum, item) => sum + item.quantity, 0)
})

const totalAmount = computed(() => orderDetail.value ? orderDetail.value.totalAmount : 0)

const customerAddress = computed(() => {
  if (!orderDetail.value?.customerInfo) return '주소 정보 없음';
  const { postalCode, addressLine1, addressLine2 } = orderDetail.value.customerInfo;
  return `(${postalCode || ''}) ${addressLine1 || ''} ${addressLine2 || ''}`.trim();
});

const orderStatusKey = computed(() => {
  if (!orderDetail.value || !orderDetail.value.orderStatus) return 'UNKNOWN';
  const statusMap = {
    '주문 완료': 'PENDING',
    '상품 준비중': 'PAID',
    '배송 준비중': 'PREPARING',
    '배송 중': 'SHIPPING',
    '배송 완료': 'DELIVERED',
    '주문 취소': 'CANCELLED'
  };
  return statusMap[orderDetail.value.orderStatus] || 'UNKNOWN';
});

const loadOrderDetail = async () => {
  loading.value = true;
  try {
    const response = await fetchOrderDetail(route.params.id)
    if (response.success) orderDetail.value = response.data
    else error.value = response.message
  } catch (err) { error.value = err.message }
  finally { loading.value = false }
}

onMounted(loadOrderDetail)
</script>

<style scoped>
/* 관리자 시스템 공통 레이아웃 */
.admin-container { padding: 20px 50px; background-color: #f8f9fb; min-height: 100vh; text-align: left; }
.breadcrumb { font-size: 14px; color: #888; margin-bottom: 20px; }

/* 레이아웃 구성 */
.order-content-layout { display: flex; gap: 25px; align-items: flex-start; }
.main-column { flex: 1; display: flex; flex-direction: column; gap: 25px; }
.side-column { width: 360px; display: flex; flex-direction: column; gap: 25px; }

/* 카드 공통 스타일 */
.filter-card, .list-card, .info-card {
  background: #fff; border-radius: 20px; border: 1px solid #e0e0e0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03); padding: 30px;
}

/* 헤더 카드 */
.header-card { display: flex; justify-content: space-between; align-items: center; padding: 25px 35px; }
.order-id { font-size: 22px; font-weight: 800; color: #333; margin: 0; }
.order-date { font-size: 14px; color: #999; margin-top: 5px; }

/* 배지 스타일 */
.status-badge { padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; }
.status-badge.PENDING { background: #fff8ee; color: #f39c12; border: 1px solid #f39c12; }
.status-badge.DELIVERED { background: #eefdee; color: #11D411; border: 1px solid #11D411; }
.status-badge.CANCELLED { background: #fef2f2; color: #ef4444; border: 1px solid #ef4444; }

/* 정보 카드 (사이드바) */
.info-card { padding: 25px; }
.info-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f1f1f1; }
.info-icon { width: 20px; }
.info-header h4 { margin: 0; font-size: 16px; font-weight: 700; color: #333; }
.info-content { display: flex; flex-direction: column; gap: 12px; }
.info-row { display: flex; justify-content: space-between; font-size: 14px; }
.info-row .label { color: #888; min-width: 70px; }
.info-row .val { color: #333; font-weight: 600; text-align: right; }
.info-row .val.address { font-size: 13px; line-height: 1.4; max-width: 200px; }
.info-row .val.highlight { color: #f39c12; }

.progress-section { margin-top: 25px; padding-top: 20px; border-top: 2px dashed #f1f1f1; }

.total-payment-row {
  margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;
  display: flex; justify-content: space-between; align-items: center;
}
.total-payment-row .label { font-weight: 700; color: #333; }
.total-payment-row .amount { color: #ef4444; font-size: 20px; font-weight: 800; }

/* 테이블 섹션 */
.card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.title-icon-svg { width: 20px; }
.card-header h3 { font-size: 17px; font-weight: 700; margin: 0; }

.table-container { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; }
.admin-table th { padding: 15px; background: #fdfdfd; border-bottom: 2px solid #f1f1f1; color: #888; font-size: 14px; text-align: center; }
.admin-table td { padding: 18px 10px; border-bottom: 1px solid #f9f9f9; font-size: 14px; text-align: center; }

.item-info-box { display: flex; align-items: center; gap: 15px; text-align: left; }
.item-thumb { width: 60px; height: 60px; border-radius: 10px; border: 1px solid #eee; object-fit: cover; }
.item-txt .name { font-weight: 700; color: #333; margin-bottom: 4px; }
.item-txt .code { font-size: 12px; color: #999; }

.price-text { color: #11D411; }
.bold { font-weight: 700; }
.text-right { text-align: right !important; padding-right: 20px !important; }

.final-summary { margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee; }
.summary-box { display: flex; justify-content: flex-end; gap: 40px; align-items: center; }
.total-qty { font-size: 15px; color: #666; }
.total-qty strong { color: #333; margin-left: 5px; }
.green-text { color: #11D411; font-size: 24px; margin-left: 10px; }

.loading-state, .error-state { padding: 100px; text-align: center; color: #666; }

@media (max-width: 1200px) {
  .order-content-layout { flex-direction: column; }
  .side-column { width: 100%; }
}
</style>