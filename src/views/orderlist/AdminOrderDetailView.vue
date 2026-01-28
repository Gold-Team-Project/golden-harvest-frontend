<template>
  <div class="order-detail">
    <div v-if="loading" class="card">
      <p>주문 상세 정보를 불러오는 중...</p>
    </div>
    <div v-else-if="error" class="card">
      <p style="color: red;">오류: {{ error }}</p>
    </div>
    <div v-else-if="orderDetail">
      <div class="page-header">
        <div>
          <p class="desc">홈 / 거래 관리 / 고객 주문 목록 / {{ orderDetail.salesOrderId }}</p>
        </div>
      </div>
      <!-- 주문 헤더 -->
      <div class="order-header">
        <div>
          <h2 class="order-id">주문 #{{ orderDetail.salesOrderId }}</h2>
          <p class="order-date">주문일시 : {{ orderDetail.createdAt }}</p>
        </div>

        <div class="actions">

          <BaseButton
            variant="primary"
            style="background-color: #ef4444;"
            @click="handleCancelOrder"
            :disabled="orderDetail?.orderStatus === '주문 취소' || orderDetail?.orderStatus === '배송 완료'"
          >주문 취소</BaseButton>
          <BaseButton
            variant="primary"
            style="background-color: #2ecc71;"
            @click="handleApproveOrder"
            :disabled="orderDetail?.orderStatus !== '주문 접수'"
          >승인</BaseButton>
        </div>
      </div>

      <!-- 주문 진행 상태 -->
      <div class="card order-progress-card">
        <OrderProgress :status="orderStatusKey" />
      </div>

      <!-- 정보 카드 -->
      <div class="info-cards-grid">
        <InfoCard title="주문자 정보" icon="👤">
              <p><strong>상호명</strong> {{ orderDetail.company || '정보 없음' }}</p>
              <p><strong>담당자</strong> {{ orderDetail.name || '정보 없음' }}</p>
              <p><strong>연락처</strong> {{ orderDetail.phoneNumber || '정보 없음' }}</p>
              <p><strong>이메일</strong> ac2ount930@name.co.kr</p>
            </InfoCard>
      
            <InfoCard title="배송지 정보" icon="🚚">
              <p><strong>수령인</strong> {{ orderDetail.name || '정보 없음' }}</p>
              <p><strong>배송주소</strong> {{ combinedAddress || '정보 없음' }}</p>
              <p><strong>배송요청일</strong> 2023-10-26</p>
              <p><strong>요청사항</strong> 오전 중에 도착하게 해주세요</p>
            </InfoCard>
      
            <InfoCard title="결제 정보" icon="💳">
              <p><strong>결제 수단</strong> 무통장 입금</p>
              <p><strong>입금 계정</strong> 프레시마켓</p>
              <p><strong>결제 상태</strong> 입금 대기</p>
              <p class="total"><strong>총 결제 금액</strong> {{ totalAmount.toLocaleString() }}원</p>
            </InfoCard>
          </div>
      
          <!-- 주문 상품 리스트 -->
          <div class="card order-items-list-card">
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
      
            <div class="item-summary">
              <div class="summary-total-quantity">
                <span>합계 수량:</span>
                <span>{{ totalQuantity }}개</span>
              </div>
              <div class="summary-total-amount">
                <span></span>
                <span>{{ totalAmount.toLocaleString() }}원</span>
              </div>
            </div>
          </div>
    </div>
    <div v-else class="card">
      <p>주문 정보를 찾을 수 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/button/BaseButton.vue';
import InfoCard from './InfoCard.vue'
import OrderProgress from './OrderProgress.vue'
import { fetchOrderDetail, cancelOrder, approveOrder } from '@/api/OrderApi' // Import approveOrder

const route = useRoute()
const orderDetail = ref(null)
const loading = ref(true)
const error = ref(null)

const items = computed(() => {
  if (!orderDetail.value || !orderDetail.value.orderItems) {
    return []
  }
  return orderDetail.value.orderItems.map((item, index) => ({
    id: index,
    name: item.itemName || item.gradeName || item.varietyName || '상품명 없음',
    code: item.gradeName || '코드 없음',
    option: item.varietyName || '옵션 없음',
    price: item.price,
    quantity: item.quantity,
    image: '',
  }))
})

const totalQuantity = computed(() => {
  if (!orderDetail.value || !orderDetail.value.orderItems) return 0;
  return orderDetail.value.orderItems.reduce((sum, item) => sum + item.quantity, 0)
})

const totalAmount = computed(() => {
  return orderDetail.value ? orderDetail.value.totalAmount : 0
})

const combinedAddress = computed(() => {
  if (!orderDetail.value) return '정보 없음';
  const { addressLine1, addressLine2, postalCode } = orderDetail.value;
  let address = '';
  if (postalCode) address += `(${postalCode}) `;
  if (addressLine1) address += addressLine1;
  if (addressLine2) address += ` ${addressLine2}`;
  return address.trim();
});

const orderStatusKey = computed(() => {
  if (!orderDetail.value || !orderDetail.value.orderStatus) return 'UNKNOWN';
  switch (orderDetail.value.orderStatus) {
    case '주문 접수': return 'PENDING';
    case '상품 준비중': return 'PAID'; // API now sends '상품 준비중' for PAID status
    case '배송 준비중': return 'PREPARING'; // '배송 준비중' remains PREPARING
    case '배송 중': return 'SHIPPING';
    case '배송 완료': return 'DELIVERED';
    case '주문 취소': return 'CANCELLED';
    default: return 'UNKNOWN';
  }
});

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

// Function to handle order cancellation
const handleCancelOrder = async () => {
  if (!orderDetail.value) return;

  const orderId = route.params.id;
  if (!orderId) {
    alert('주문 ID를 찾을 수 없습니다.');
    return;
  }

  // Prevent cancellation if already cancelled or delivered
  if (orderDetail.value.orderStatus === '주문 취소' || orderDetail.value.orderStatus === '배송 완료') {
    alert('이미 취소되었거나 완료된 주문은 취소할 수 없습니다.');
    return;
  }

  if (!confirm(`주문번호 ${orderId}를 정말 취소하시겠습니까?`)) {
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    const response = await cancelOrder(orderId);
    if (response.success) {
      alert('주문이 성공적으로 취소되었습니다.');
      await loadOrderDetail(); // Reload details to reflect new status
    } else {
      error.value = response.message || '주문 취소에 실패했습니다.';
    }
  } catch (err) {
    error.value = 'API 호출 중 오류가 발생했습니다: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Function to handle order approval
const handleApproveOrder = async () => {
  if (!orderDetail.value) return;

  const orderId = route.params.id;
  if (!orderId) {
    alert('주문 ID를 찾을 수 없습니다.');
    return;
  }

  // Prevent approval if already approved, cancelled, or delivered
  if (orderDetail.value.orderStatus === '배송 완료' || orderDetail.value.orderStatus === '주문 취소' || orderDetail.value.orderStatus === '상품 준비중') {
    alert('이미 완료되었거나 취소된 주문 또는 이미 상품 준비중인 주문은 승인할 수 없습니다.');
    return;
  }

  if (!confirm(`주문번호 ${orderId}를 승인하시겠습니까?`)) {
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    const response = await approveOrder(orderId);
    if (response.success) {
      alert('주문이 성공적으로 승인되었습니다.');
      await loadOrderDetail(); // Reload details to reflect new status
    } else {
      error.value = response.message || '주문 승인에 실패했습니다.';
    }
  } catch (err) {
    error.value = 'API 호출 중 오류가 발생했습니다: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.order-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card { /* Base card style for .order-items-list-card */
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

/* Order Header */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px; /* Added padding to match other cards */
  background: #ffffff; /* Added background for header */
  border-radius: 12px; /* Added border-radius */
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
.order-id {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}
.order-date {
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
}
.actions {
  display: flex;
  gap: 8px;
}

.order-progress-card {
  margin-top: 24px; /* Ensure space from the header */
}



/* Info Cards Grid */
.info-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 24px; /* Added to explicitly push it down */
}

/* Order Items List Card */
.order-items-list-card {
  /* Inherits .card styles */
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}
.item-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}
.item-table th, .item-table td {
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  text-align: left;
  vertical-align: middle;
}
.item-table th {
  font-size: 13px;
  color: #6b7280;
  background-color: #f9fafb;
  padding: 8px;
}
.item-table td:nth-child(1) { width: 40%; } /* 상품 정보 */
.item-table td:nth-child(2) { width: 20%; } /* 단가 */
.item-table td:nth-child(3) { width: 10%; } /* 수량 */
.item-table td:nth-child(4) { width: 30%; text-align: right; } /* 합계 */
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
  background-color: #f3f4f6;
}
.item-details p { margin: 0; font-size: 13px; }
.item-name { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
.item-code, .item-option { color: #6b7280; }

.item-summary {
  display: flex;
  justify-content: flex-end;
  gap: 24px;
  margin-top: 24px;
  font-size: 16px;
  font-weight: 600;
}
.summary-total-quantity, .summary-total-amount {
  display: flex;
  gap: 8px;
}
.summary-total-amount span:last-child {
  color: #22c55e;
  font-size: 20px;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .actions {
    flex-wrap: wrap;
    width: 100%;
  }

  .actions .BaseButton {
    flex: 1 1 auto;
  }

  .info-cards-grid {
    grid-template-columns: 1fr; /* Stack cards vertically */
  }

  /* Table responsiveness */
  .table-responsive {
    width: 100%;
    overflow-x: auto;
  }
}

.page-header {
  margin-bottom: 8px;
}

.desc {
  font-size: 13px;
  color: #6b7280;
}
</style>