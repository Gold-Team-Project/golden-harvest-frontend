<template>
  <div class="admin-container">
    <div class="breadcrumb">홈 / 거래 관리 / 고객 주문 목록 / <strong>{{ orderDetail?.salesOrderId }}</strong></div>

    <div v-if="loading" class="loading-state">
      <p>주문 상세 정보를 불러오는 중...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>오류: {{ error }}</p>
    </div>

    <div v-else-if="orderDetail" class="content-wrapper">
      <div class="filter-card header-flex">
        <div class="order-title-group">
          <h2 class="order-id">주문 #{{ orderDetail.salesOrderId }}</h2>
          <p class="order-date">주문일시: {{ orderDetail.createdAt }}</p>
        </div>
        <div class="header-actions">
          <button
              class="action-btn cancel-btn"
              @click="handleCancelOrder"
              :disabled="orderDetail?.orderStatus === '주문 취소' || orderDetail?.orderStatus === '배송 완료'"
          >주문 취소</button>
          <button
              class="action-btn approve-btn"
              @click="handleApproveOrder"
              :disabled="orderDetail?.orderStatus !== '주문 완료'"
          >주문 승인</button>
        </div>
      </div>

      <div class="list-card status-card">
        <OrderProgress :status="orderStatusKey" />
      </div>

      <div class="info-grid">
        <div class="info-card">
          <div class="info-header">
            <img src="@/assets/user-icon.svg" class="info-icon" alt="user" />
            <h4>주문자 정보</h4>
          </div>
          <div class="info-content">
            <div class="info-row"><span class="label">상호명</span><span class="val">{{ orderDetail.company || '-' }}</span></div>
            <div class="info-row"><span class="label">담당자</span><span class="val">{{ orderDetail.name || '-' }}</span></div>
            <div class="info-row"><span class="label">연락처</span><span class="val">{{ orderDetail.phoneNumber || '-' }}</span></div>
            <div class="info-row"><span class="label">이메일</span><span class="val">ac2ount930@name.co.kr</span></div>
          </div>
        </div>

        <div class="info-card">
          <div class="info-header">
            <img src="@/assets/address.svg" class="info-icon" alt="address" />
            <h4>배송지 정보</h4>
          </div>
          <div class="info-content">
            <div class="info-row"><span class="label">수령인</span><span class="val">{{ orderDetail.name || '-' }}</span></div>
            <div class="info-row"><span class="label">배송주소</span><span class="val address">{{ combinedAddress }}</span></div>
            <div class="info-row"><span class="label">요청일</span><span class="val">2023-10-26</span></div>
            <div class="info-row"><span class="label">요청사항</span><span class="val">오전 중에 도착하게 해주세요</span></div>
          </div>
        </div>

        <div class="info-card">
          <div class="info-header">
            <img src="@/assets/card.svg" class="info-icon" alt="card" />
            <h4>결제 정보</h4>
          </div>
          <div class="info-content">
            <div class="info-row"><span class="label">결제수단</span><span class="val">무통장 입금</span></div>
            <div class="info-row"><span class="label">입금계정</span><span class="val">프레시마켓</span></div>
            <div class="info-row"><span class="label">결제상태</span><span class="val highlight">입금 대기</span></div>
            <div class="info-row total-row">
              <span class="label">총 결제 금액</span>
              <span class="val price">{{ totalAmount.toLocaleString() }}원</span>
            </div>
          </div>
        </div>
      </div>

      <div class="list-card table-section">
        <div class="card-header">
          <img src="@/assets/search.svg" class="title-icon-svg" alt="list" />
          <h3>주문 품목 리스트</h3>
        </div>

        <div class="table-container">
          <table class="admin-table">
            <thead>
            <tr>
              <th style="width: 45%">상품 정보</th>
              <th style="width: 15%">단가</th>
              <th style="width: 15%">수량</th>
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
              <td class="bold text-right total-cell">{{ (item.price * item.quantity).toLocaleString() }}원</td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="final-summary">
          <div class="summary-box">
            <span class="total-qty">합계 수량: <strong>{{ totalQuantity }}개</strong></span>
            <span class="total-amt">총 결제 금액: <strong class="green-text">{{ totalAmount.toLocaleString() }}원</strong></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import OrderProgress from './OrderProgress.vue'
import { fetchOrderDetail, cancelOrder, approveOrder } from '@/api/OrderApi'
import Swal from 'sweetalert2' // 1. Swal 추가

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

const combinedAddress = computed(() => {
  if (!orderDetail.value) return '-';
  const { addressLine1, addressLine2, postalCode } = orderDetail.value;
  return `${postalCode ? '('+postalCode+') ' : ''}${addressLine1 || ''} ${addressLine2 || ''}`.trim() || '-';
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

// [디자인 변경] 주문 취소 핸들러
const handleCancelOrder = async () => {
  const result = await Swal.fire({
    title: '주문을 취소하시겠습니까?',
    text: '취소된 주문은 되돌릴 수 없습니다.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#9ca3af',
    confirmButtonText: '주문 취소',
    cancelButtonText: '닫기',
    reverseButtons: true,
    borderRadius: '16px'
  });

  if (!result.isConfirmed) return;

  try {
    const res = await cancelOrder(route.params.id);
    if (res.success) {
      await Swal.fire({
        title: '취소 완료',
        text: '주문이 성공적으로 취소되었습니다.',
        icon: 'success',
        confirmButtonColor: '#11D411',
        borderRadius: '16px'
      });
      loadOrderDetail();
    }
  } catch (err) {
    Swal.fire({
      title: '오류 발생',
      text: '주문 취소 처리 중 문제가 발생했습니다.',
      icon: 'error',
      confirmButtonColor: '#ef4444',
      borderRadius: '16px'
    });
  }
};

// [디자인 변경] 주문 승인 핸들러
const handleApproveOrder = async () => {
  const result = await Swal.fire({
    title: '주문을 승인하시겠습니까?',
    text: '승인 후 상품 준비 단계로 변경됩니다.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#11D411',
    cancelButtonColor: '#9ca3af',
    confirmButtonText: '승인하기',
    cancelButtonText: '취소',
    reverseButtons: true,
    borderRadius: '16px'
  });

  if (!result.isConfirmed) return;

  try {
    const res = await approveOrder(route.params.id);
    if (res.success) {
      await Swal.fire({
        title: '승인 완료',
        text: '주문이 정상적으로 승인되었습니다.',
        icon: 'success',
        confirmButtonColor: '#11D411',
        borderRadius: '16px'
      });
      loadOrderDetail();
    }
  } catch (err) {
    Swal.fire({
      title: '오류 발생',
      text: '주문 승인 처리 중 문제가 발생했습니다.',
      icon: 'error',
      confirmButtonColor: '#ef4444',
      borderRadius: '16px'
    });
  }
};

onMounted(loadOrderDetail)
</script>

<style scoped>
/* 시스템 공통 레이아웃 */
.admin-container { padding: 20px 50px; background-color: #f8f9fb; min-height: 100vh; text-align: left; }
.breadcrumb { font-size: 14px; color: #888; margin-bottom: 20px; }

/* 헤더 섹션 */
.header-flex { display: flex; justify-content: space-between; align-items: center; border-radius: 20px !important; margin-bottom: 20px !important; }
.order-id { font-size: 22px; font-weight: 800; color: #333; margin: 0; }
.order-date { font-size: 14px; color: #999; margin-top: 5px; }

.header-actions { display: flex; gap: 10px; }
.action-btn { padding: 10px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; }
.approve-btn { background: #11D411; color: #fff; }
.approve-btn:hover { background: #0fb80f; }
.cancel-btn { background: #fef2f2; color: #ef4444; border: 1px solid #ef4444; }
.cancel-btn:hover { background: #fee2e2; }
.action-btn:disabled { background: #eee; color: #aaa; border: none; cursor: not-allowed; }

/* 정보 카드 그리드 */
.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 25px; }
.info-card { background: #fff; border-radius: 20px; padding: 25px; border: 1px solid #e0e0e0; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
.info-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f1f1f1; }
.info-icon { width: 20px; height: 20px; }
.info-header h4 { margin: 0; font-size: 16px; color: #333; font-weight: 700; }

.info-content { display: flex; flex-direction: column; gap: 12px; }
.info-row { display: flex; justify-content: space-between; font-size: 14px; }
.info-row .label { color: #888; font-weight: 500; min-width: 80px; }
.info-row .val { color: #333; font-weight: 600; text-align: right; }
.info-row .val.address { font-size: 13px; line-height: 1.4; max-width: 180px; }
.info-row .val.highlight { color: #f39c12; }

.total-row { margin-top: 10px; padding-top: 10px; border-top: 2px dashed #f1f1f1; }
.total-row .price { color: #11D411; font-size: 18px; font-weight: 800; }

/* 테이블 섹션 */
.table-section { flex: 1; }
.card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.title-icon-svg { width: 20px; }
.card-header h3 { font-size: 16px; font-weight: 700; margin: 0; }

.table-container { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; }
.admin-table th { padding: 15px; background: #fdfdfd; border-bottom: 2px solid #f1f1f1; color: #888; font-size: 14px; text-align: center; }
.admin-table td { padding: 15px; border-bottom: 1px solid #f9f9f9; font-size: 14px; text-align: center; }

.item-info-box { display: flex; align-items: center; gap: 15px; text-align: left; }
.item-thumb { width: 50px; height: 50px; border-radius: 8px; background: #f8f9fb; object-fit: cover; border: 1px solid #eee; }
.item-txt .name { font-weight: 700; color: #333; margin: 0 0 4px 0; }
.item-txt .code { font-size: 12px; color: #999; margin: 0; }

.bold { font-weight: 700; color: #333; }
.text-right { text-align: right !important; padding-right: 30px !important; }
.green-text { color: #11D411; }

.final-summary { margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee; }
.summary-box { display: flex; justify-content: flex-end; gap: 40px; align-items: center; }
.total-qty { font-size: 15px; color: #666; }
.total-qty strong { color: #333; margin-left: 5px; }
.total-amt { font-size: 16px; color: #333; font-weight: 700; }
.total-amt strong { font-size: 24px; margin-left: 10px; }

/* 공통 카드 스타일 (필터카드 스타일 상속) */
.filter-card, .list-card {
  background: #fff; border-radius: 20px; border: 1px solid #e0e0e0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03); padding: 30px;
}

.status-card { margin-bottom: 20px; padding: 40px 30px; }

@media (max-width: 1200px) {
  .info-grid { grid-template-columns: 1fr; }
}
</style>