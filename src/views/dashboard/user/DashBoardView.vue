<template>
  <div class="dashboard-content">
    <header class="section-header">
      <h2>구매 현황</h2>
    </header>

    <div class="stat-container">
      <div v-for="(stat, idx) in stats" :key="idx" class="stat-card">
        <div class="stat-info">
          <div class="stat-header">
            <span class="stat-label">{{ stat.label }}</span>
            <img :src="stat.icon" :alt="stat.label" class="stat-icon-svg" />
          </div>
          <div class="stat-value-group">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-unit">{{ stat.unit }}</span>
          </div>
        </div>
      </div>
    </div>

    <section class="order-status-card">
      <h3>주문 진행 상황</h3>
      <div class="stepper-container">
        <div class="stepper-line"></div>
        <div class="stepper-wrapper">
          <div v-for="(step, idx) in orderSteps" :key="idx" class="step-item">
            <div class="step-icon-only">
              <img :src="step.icon" :alt="step.label" class="step-svg" />
            </div>
            <span class="step-label">{{ step.label }}</span>
            <span class="step-count">{{ step.count }} <small>orders</small></span>
          </div>
        </div>
      </div>
    </section>

    <section class="favorite-section">
      <div class="section-header-flex">
        <div class="title-group">
          <h3>자주 구매한 상품</h3>
          <span class="sub-desc">주간 구매 빈도 기준</span>
        </div>
      </div>

      <div class="item-grid">
        <div v-for="(item, idx) in favoriteItems" :key="idx" class="item-card">
          <div class="item-image">
            <img :src="item.fileUrl || '/placeholder.png'" :alt="item.itemName" class="dashboard-item-thumb" />
          </div>
          <div class="item-details">
            <p class="item-name">{{ item.itemName }}</p>
            <div class="frequent-order-info">
              <span class="order-count">{{ item.orderCount }}회 주문</span>
              <span class="quantity">{{ item.quantity }}개</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchUserOrderInfo, fetchUserFrequentOrders } from '@/api/OrderApi';
import DayIcon from '@/assets/day.svg';
import WeeklyIcon from '@/assets/weekly.svg';
import MonthlyIcon from '@/assets/monthly.svg';
import AverageIcon from '@/assets/average.svg';
import TotalIcon from '@/assets/total.svg';
import OrderIcon from '@/assets/order-completed.svg';
import ProductIcon from '@/assets/product-packaging.svg';
import ShippingIcon from '@/assets/shipping.svg';
import DeliveryIcon from '@/assets/delivery-completed.svg';
import CancelIcon from '@/assets/cancel.svg';

const stats = ref([
  { label: '당일', value: '0', unit: 'orders', icon: DayIcon },
  { label: '주간', value: '0', unit: 'orders', icon: WeeklyIcon },
  { label: '월간', value: '0', unit: 'orders', icon: MonthlyIcon },
  { label: '평균 주문 수', value: '0', unit: '/ day', icon: AverageIcon },
  { label: '총합', value: '0', unit: 'YDT', icon: TotalIcon },
]);

const orderSteps = ref([
  { label: '주문 접수', count: 0, icon: OrderIcon },
  { label: '상품 준비중', count: 0, icon: ProductIcon },
  { label: '배송중', count: 0, icon: ShippingIcon },
  { label: '배송 완료', count: 0, icon: DeliveryIcon },
  { label: '주문 취소', count: 0, icon: CancelIcon },
]);

const favoriteItems = ref([]);

onMounted(async () => {
  try {
    const userOrderInfoResponse = await fetchUserOrderInfo();
    const userOrderInfoData = userOrderInfoResponse.result;

    stats.value = [
      { label: '당일', value: userOrderInfoData.todayOrders, unit: 'orders', icon: DayIcon },
      { label: '주간', value: userOrderInfoData.weeklyOrders, unit: 'orders', icon: WeeklyIcon },
      { label: '월간', value: userOrderInfoData.MonthlyOrders, unit: 'orders', icon: MonthlyIcon },
      { label: '평균 주문 수', value: userOrderInfoData.averageOrders, unit: '/ day', icon: AverageIcon },
      { label: '총합', value: userOrderInfoData.totalOrders, unit: 'YDT', icon: TotalIcon },
    ];

    orderSteps.value = [
      { label: '주문접수', count: userOrderInfoData.orderReceived, icon: OrderIcon },
      { label: '상품준비중', count: userOrderInfoData.productPreparing, icon: ProductIcon },
      { label: '배송중', count: userOrderInfoData.shipping, icon: ShippingIcon },
      { label: '배송완료', count: userOrderInfoData.delivered, icon: DeliveryIcon },
      { label: '주문취소', count: userOrderInfoData.cancelled, icon: CancelIcon },
    ];
  } catch (error) {
    console.error('Failed to fetch user order info:', error);
    // Optional: Add user-facing error handling
  }

  try {
    const frequentOrdersResponse = await fetchUserFrequentOrders();
    // Assuming frequentOrdersResponse.result is an array of items
    if (frequentOrdersResponse.success && Array.isArray(frequentOrdersResponse.data)) {
      favoriteItems.value = frequentOrdersResponse.data;
    } else {
      console.warn('Frequent orders response data is not an array or success is false:', frequentOrdersResponse);
      favoriteItems.value = [];
    }
  } catch (error) {
    console.error('Failed to fetch user frequent orders:', error);
  }
});
</script>

<style scoped>

.section-header h2 {
  font-size: 22px;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 10px; /* 아래 지표 카드와의 간격 */
  padding-top: -20px;
}

.stat-container {
  display: flex; background: white; border-radius: 20px;
  border: 1px solid #E0E4E0; margin: 0 20px 25px 20px;
}
.stat-card { flex: 1; padding: 10px 20px; border-right: 1px solid #F0F0F0; }
.stat-card:last-child { border-right: none; }
.stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; min-height: unset; }
.stat-label { color: #888; font-size: 15px; font-weight: 700; }

.stat-icon-svg { width: 32px; height: 32px; object-fit: contain; }
.stat-card:first-child .stat-icon-svg {
  width: 40px !important; height: 40px !important;
  transform: scale(4); transform-origin: center;
}

.stat-value { font-size: 28px; font-weight: 800; color: #333; }
.stat-unit { font-size: 13px; color: #AAA; margin-left: 6px; }

.order-status-card {
  background: white; padding: 15px 35px; border-radius: 20px;
  border: 1px solid #E0E4E0; margin: 0 20px 25px 20px;
}
.order-status-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 15px; }
.stepper-container { position: relative; padding: 0 40px; }
.stepper-line { position: absolute; top: 25px; left: 60px; right: 60px; height: 2px; background: #E6F9E6; z-index: 1; }
.stepper-wrapper { display: flex; justify-content: space-between; position: relative; z-index: 2; }
.step-item { text-align: center; flex: 1; display: flex; flex-direction: column; align-items: center; }
.step-icon-only {
  width: 50px; height: 50px; background: white;
  display: flex; align-items: center; justify-content: center; margin-bottom: 12px;
}
.step-svg { width: 45px; height: 45px; object-fit: contain; }
.step-label { font-weight: 700; font-size: 14px; color: #444; margin-bottom: 4px; }
.step-count { font-size: 13px; color: #11D411; font-weight: 600; }

.favorite-section {
  flex-grow: 1; /* 남은 하단 공간을 채움 */
  background: white;
  padding: 25px 35px; /* 주문 진행 상황 카드(35px)와 동일한 좌우 패딩 */
  border-radius: 20px;
  border: 1px solid #E0E4E0;
  margin: 0 20px 20px 20px; /* 좌, 우, 하단 마진만 주어 위 카드와 간격 유지 */
  display: flex;
  flex-direction: column;
}

/* 주문 진행 상황 h3와 동일하게 사이즈 맞춤 */
.favorite-section h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 15px; /* 요청하신 30px 마진 적용 */
  color: #333;
}

.section-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.sub-desc {
  font-size: 12px;
  color: #AAA;
  font-weight: 400;
  margin-left: 10px; /* 제목 옆에 붙을 때 간격 */
}

/* 아이템 그리드 (삐져나가지 않게 최적화) */
.item-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
}

.item-card {
  border: 3px solid #F2F2F2;
  border-radius: 12px;
  padding: 10px 0px;
  text-align: left;
  background: #fff;

  /* 1. 기본 그림자 효과 (은은하게) */
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

  /* 부드러운 전환 효과 */
  transition: all 0.2s ease-in-out;
}

/* 2. 마우스를 올렸을 때(hover) 효과 */
.item-card:hover {
  /* 그림자를 더 진하게 하여 위로 붕 뜬 느낌 */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  /* 테두리 색상도 살짝 강조 (선택 사항) */
  border-color: #D1D9E0;
  /* 살짝 위로 이동하는 효과 */
  transform: translateY(-4px);
}

.item-image {
  width: 100%;
  height: 160px;
  background: #f8f8f8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}
.dashboard-item-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.box-icon { font-size: 24px; }

.item-name {
  font-size: 13px;
  font-weight: 700;
  color: #333;
  height: 38px;
  overflow: hidden;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.frequent-order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 10px; /* Added padding for consistent spacing */
}

.order-count {
  font-size: 13px;
  font-weight: 600;
  color: #11D411;
}

.quantity {
  font-size: 13px;
  color: #555;
}

</style>