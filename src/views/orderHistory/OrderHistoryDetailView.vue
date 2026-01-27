<template>
  <div class="order-detail-view">
    <div class="main-content">
      <div v-if="loading" class="card">
        <p>주문 상세 정보를 불러오는 중...</p>
      </div>
      <div v-else-if="error" class="card">
        <p style="color: red;">오류: {{ error }}</p>
      </div>
      <div v-else-if="orderDetail" class="card">
        <div class="order-header">
          <div>
            <h2 class="order-title">주문 상세</h2>
            <p class="order-info">{{ orderDetail.createdAt }} 주문 <span class="order-id">주문번호 : {{ orderDetail.salesOrderId }}</span></p>
          </div>
          <BaseButton variant="outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;"><path d="M19 8H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2h3a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1Zm-5 11h-4v-5h4v5Zm3-6H7v-4h10v4Z" /></svg>
            거래 명세서 출력
          </BaseButton>
        </div>

        <h3 class="section-title">주문 품목 리스트</h3>
        <div class="table-responsive">
          <table class="item-table">
            <thead>
              <tr>
                <th>상품 정보</th>
                <th>단가</th>
                <th>수량</th>
                <th>합계</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td>
                  <div class="item-info">
                    <img :src="item.image" alt="item-image" class="item-image" />
                    <div class="item-details">
                      <p class="item-name">{{ item.name }}</p>
                      <p class="item-code">코드: {{ item.code }}</p>
                      <p class="item-option">옵션: {{ item.option }}</p>
                    </div>
                  </div>
                </td>
                <td>{{ item.price.toLocaleString() }}원</td>
                <td>{{ item.quantity }}</td>
                <td>{{ (item.price * item.quantity).toLocaleString() }}원</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="total-summary">
          <span>합계 :</span>
          <span class="total-amount">{{ totalAmount.toLocaleString() }}원</span>
        </div>
      </div>
      <div v-else class="card">
        <p>주문 정보를 찾을 수 없습니다.</p>
      </div>
    </div>

    <div class="sidebar-content">
      <div class="card">
        <h3 class="section-title">배송 정보</h3>
        <div class="info-grid">
          <p><span class="label">수령인</span> : 홍길동</p>
          <p><span class="label">연락처</span> : 010-1234-5678</p>
          <p><span class="label">주소</span> : (99999) 서울특별시 겁나게 하기싫다 999-99 하나로마트 1층</p>
          <p><span class="label">배송요청사항</span> : 공동현관 비밀번호 1234</p>
        </div>
        <div class="shipping-status">
          <ul>
            <li class="status-item done">
              <div class="status-dot"></div>
              <div class="status-text">
                <p>주문 완료</p>
                <p class="status-date">2025.12.31</p>
              </div>
            </li>
            <li class="status-item">
              <div class="status-dot"></div>
              <div class="status-text">상품준비중</div>
            </li>
            <li class="status-item">
              <div class="status-dot"></div>
              <div class="status-text">배송중</div>
            </li>
            <li class="status-item">
              <div class="status-dot"></div>
              <div class="status-text">배송완료</div>
            </li>
          </ul>
        </div>
      </div>
      <div class="card">
        <h3 class="section-title">결제 정보</h3>
        <div class="info-grid payment-info">
          <p><span class="label">결제 수단</span><span class="value">무통장 입금</span></p>
          <p><span class="label">입금자명</span><span class="value">프레시마켓</span></p>
          <p><span class="label">결제 상태</span><span class="value">입금 대기</span></p>
        </div>
        <div class="total-payment">
          <span class="label">총 결제 금액</span>
          <span class="amount">{{ totalAmount.toLocaleString() }}원</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/button/BaseButton.vue'
import { fetchOrderDetail } from '@/api/OrderApi'

const route = useRoute()
const orderDetail = ref(null)
const loading = ref(true)
const error = ref(null)

const items = computed(() => {
  if (!orderDetail.value || !orderDetail.value.orderItems) {
    return []
  }
  return orderDetail.value.orderItems.map((item, index) => ({
    id: index, // Using index as ID, as no specific item ID is provided in API response
    name: item.itemName || item.gradeName || item.varietyName || '상품명 없음',
    code: item.gradeName || '코드 없음', // Placeholder
    option: item.varietyName || '옵션 없음', // Placeholder
    price: item.price,
    quantity: item.quantity,
    image: '', // No image URL in API response
  }))
})

const totalAmount = computed(() => {
  return orderDetail.value ? orderDetail.value.totalAmount : 0
})

const loadOrderDetail = async () => {
  loading.value = true
  error.value = null
  try {
    const orderId = route.params.id
    const response = await fetchOrderDetail(orderId)
    if (response.success && response.data) {
      orderDetail.value = response.data
    } else {
      error.value = response.message || '주문 상세 정보를 불러오는데 실패했습니다.'
    }
  } catch (err) {
    error.value = 'API 호출 중 오류가 발생했습니다: ' + err.message
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.order-detail-view {
  display: flex;
  gap: 24px;
}
.main-content {
  flex: 1;
}
.sidebar-content {
  width: 320px;
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
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
  margin-bottom: 24px;
}
.order-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}
.order-info {
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
}
.order-id {
  color: #22c55e;
  font-weight: 600;
  margin-left: 16px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}
.item-table {
  width: 100%;
  border-collapse: collapse;
}
.item-table th, .item-table td {
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
  text-align: left;
}
.item-table th {
  font-size: 13px;
  color: #6b7280;
  background-color: #f9fafb;
  padding: 8px;
}
.item-table td:nth-child(1) { width: 50%; }
.item-info {
  display: flex;
  align-items: center;
  gap: 16px;
}
.item-image {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
}
.item-details p { margin: 0; font-size: 13px; }
.item-name { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
.item-code, .item-option { color: #6b7280; }
.total-summary {
  text-align: right;
  margin-top: 24px;
  font-size: 16px;
  font-weight: 600;
}
.total-amount {
  font-size: 20px;
  color: #22c55e;
  margin-left: 16px;
}
.info-grid {
  display: grid;
  gap: 12px;
  font-size: 14px;
  color: #374151;
}
.info-grid .label {
  color: #6b7280;
  display: inline-block;
  width: 90px;
}
.payment-info .value {
  float: right;
  font-weight: 500;
}
.shipping-status {
  margin-top: 24px;
}
.shipping-status ul {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
}
.shipping-status ul::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 5px;
  bottom: 5px;
  width: 2px;
  background-color: #e5e7eb;
}
.status-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  padding-bottom: 24px;
}
.status-item:last-child {
  padding-bottom: 0;
}
.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #e5e7eb;
  border: 2px solid #ffffff;
  z-index: 1;
}
.status-item.done .status-dot {
  background-color: #22c55e;
}
.status-text {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.2;
}
.status-item.done .status-text {
  color: #111827;
  font-weight: 600;
}
.status-date {
  font-size: 12px;
  color: #6b7280;
  font-weight: 400;
}
.total-payment {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}
.total-payment .amount {
  color: #ef4444;
  font-size: 20px;
}

@media (max-width: 768px) {
  .order-detail-view {
    flex-direction: column;
  }

  .sidebar-content {
    width: 100%; /* Make sidebar full width */
  }

  .info-grid {
    grid-template-columns: 1fr; /* Stack info items vertically */
  }

  .info-grid .label {
    width: auto; /* Allow label to take necessary width */
    margin-right: 8px; /* Add some space between label and value */
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .order-id {
    font-size: 20px; /* Adjust font size for smaller screens */
  }

  .order-info {
    margin-top: 4px;
  }

  .actions {
    flex-wrap: wrap; /* Allow buttons to wrap */
    width: 100%; /* Make buttons take full width if wrapped */
    justify-content: flex-start; /* Align buttons to start */
  }

  .actions .BaseButton {
    flex: 1 1 auto; /* Allow buttons to grow/shrink but keep some base size */
  }

  /* Table responsiveness */
  .table-responsive {
    width: 100%;
    overflow-x: auto;
  }
}
</style>
