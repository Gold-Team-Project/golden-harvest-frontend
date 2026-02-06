<template>
  <div class="admin-dashboard">
    <div class="dashboard-content">
      <div class="metric-cards-grid">


        <!-- 오늘의 흐름 (Today's Flow) -->
        <div class="card metric-card">
          <div class="metric-icon today-flow-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="#F3E5F5"/>
              <path d="M12 6V12L16 14" stroke="#9C27B0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="metric-label">오늘의 흐름</p>
          <div class="flow-details-container">
            <div class="flow-values">
              <span class="flow-in">입고 <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20V4" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 13L12 20L19 13" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>{{ metrics?.inbounds }}</span></span>
              <span class="flow-out">출고 <span>{{ metrics?.outbounds }}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4V20" stroke="#FF9800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 11L12 4L5 11" stroke="#FF9800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></span>
            </div>
            <div class="progress-bar-container flow-progress">
              <div class="progress-bar in" :style="{ width: flowInProgressWidth }"></div>
              <div class="progress-bar out" :style="{ width: flowOutProgressWidth }"></div>
            </div>
          </div>
        </div>

        <!-- 유통기한 임박 (Expiring Soon) -->
        <div class="card metric-card">
          <div class="metric-icon expiring-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="#FFF3E0"/>
              <path d="M12 6V12L16 14" stroke="#FF5722" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="none" stroke="#FF9800" stroke-width="2"/>
            </svg>
          </div>
          <p class="metric-label">유통기한 임박</p>
          <p class="metric-value">{{ formatNumber(metrics?.expireDueLot) }}개 LOT</p>
          <p class="metric-sub-value">7일 이내 만료 예정</p>
          <div class="progress-bar-container">
            <div class="progress-bar yellow" :style="{ width: expiringProgressWidth }"></div>
          </div>
        </div>

        <!-- 예상 폐기량 (Estimated Disposal) -->
        <div class="card metric-card">
          <div class="metric-icon disposal-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="#FFEBEE"/>
              <path d="M10 11V17" stroke="#F44336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 11V17" stroke="#F44336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4 7H20" stroke="#F44336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 7L7 19C7 19.5304 7.21071 20.0391 7.58579 20.4142C7.96086 20.7893 8.46957 21 9 21H15C15.5304 21 16.0391 20.7893 16.4142 20.4142C16.7893 20.0391 17 19.5304 17 19L18 7" stroke="#F44336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5V7H9V5Z" stroke="#F44336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="metric-label">예상 폐기량</p>
          <p class="metric-value">{{ formatNumber(metrics?.discardQuantity) }} kg</p>
          <p class="metric-sub-value">이번 주 폐기 예상</p>
          <div class="progress-bar-container">
            <div class="progress-bar red" :style="{ width: disposalProgressWidth }"></div>
          </div>
        </div>
      </div>

      <!-- Main Content Cards -->
      <div class="main-content-cards">
        <div class="card top-order-card">
          <p class="card-subtitle">이번달 최고 주문</p>
          <p class="top-order-item">{{ bestOrder?.itemName }}</p>
          <div class="top-order-stock">
            <p>{{ bestOrder?.quantity }} 개</p>
            <p>{{ bestOrder?.orderCount }} 주문</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getMetrics, fetchBestOrder } from '../../api/ItemApi.js';

const metrics = ref(null);
const bestOrder = ref(null);

onMounted(async () => {
  try {
    const response = await getMetrics();
    if (response.success) {
      metrics.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
  }
  try {
    const response = await fetchBestOrder();
    if (response.success) {
      bestOrder.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch best order:', error);
  }
});

const formatNumber = (value) => {
  if (value === null || typeof value === 'undefined') return 0;
  return value.toLocaleString();
};

const flowInProgressWidth = computed(() => {
  if (!metrics.value || (metrics.value.inbounds + metrics.value.outbounds === 0)) {
    return '50%';
  }
  const percentage = (metrics.value.inbounds / (metrics.value.inbounds + metrics.value.outbounds)) * 100;
  return `${percentage}%`;
});

const flowOutProgressWidth = computed(() => {
  if (!metrics.value || (metrics.value.inbounds + metrics.value.outbounds === 0)) {
    return '50%';
  }
  const percentage = (metrics.value.outbounds / (metrics.value.inbounds + metrics.value.outbounds)) * 100;
  return `${percentage}%`;
});

const expiringProgressWidth = computed(() => {
  if (!metrics.value || metrics.value.availableLot === 0) {
    return '0%';
  }
  const percentage = (metrics.value.expireDueLot / metrics.value.availableLot) * 100;
  return `${percentage}%`;
});

const disposalProgressWidth = computed(() => {
  if (!metrics.value || metrics.value.availableQuantity === 0) {
    return '0%';
  }
  const percentage = (metrics.value.discardQuantity / metrics.value.availableQuantity) * 100;
  return `${percentage}%`;
});
</script>

<style scoped>
.admin-dashboard {
  padding: 24px;
  background-color: #f8f9fa; /* Light gray background for the entire dashboard area */
  min-height: 100vh; /* Ensure it takes full height */
  display: flex;
  flex-direction: column;
}



.dashboard-content {
  flex: 1; /* Allows content to take available space */
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.section-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}

.metric-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Three columns */
  gap: 20px; /* Gap between cards */
  margin-bottom: 30px;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  display: flex;
  flex-direction: column;
}

.metric-card {
  align-items: flex-start;
  gap: 8px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.metric-icon svg {
  width: 24px;
  height: 24px;
}


.today-flow-icon {
  background-color: #F3E5F5; /* Light purple */
}
.today-flow-icon svg path:first-child { fill: #F3E5F5; }
.today-flow-icon svg path:nth-child(2) { stroke: #9C27B0; } /* Darker purple */


.expiring-icon {
  background-color: #FFF3E0; /* Light orange */
}
.expiring-icon svg path:first-child { fill: #FFF3E0; }
.expiring-icon svg path:nth-child(2) { stroke: #FF5722; } /* Darker orange */
.expiring-icon svg path:last-child { stroke: #FF9800; } /* Another orange shade for circle stroke */


.disposal-icon {
  background-color: #FFEBEE; /* Light red */
}
.disposal-icon svg path:first-child { fill: #FFEBEE; }
.disposal-icon svg path:not(:first-child) { stroke: #F44336; } /* Darker red */


.metric-label {
  font-size: 16px;
  color: #666;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.metric-sub-value {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.progress-bar-container {
  width: 100%;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  /* margin-top: auto; - Removed from here */
}

.progress-bar {
  height: 100%;
  background-color: #22c55e; /* Default green */
  border-radius: 3px;
}
.progress-bar.yellow { background-color: #FFD54F; } /* Yellow for expiring */
.progress-bar.red { background-color: #EF5350; }   /* Red for disposal */

.flow-details-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: auto; /* Push this whole block to the bottom */
  gap: 16px; /* Further adjusted gap for more spacing */
}

.flow-values {
  display: flex;
  width: 100%;
  justify-content: space-around;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 0; /* Changed from 10px to 0 previously, now explicitly 0 to remove it */
}
.flow-in, .flow-out {
  display: flex;
  align-items: center;
  gap: 5px;
}
.flow-in { color: #4CAF50; }
.flow-out { color: #FF9800; }
.flow-values svg {
  width: 16px;
  height: 16px;
}

.progress-bar-container.flow-progress {
  display: flex;
}
.progress-bar.in {
  background-color: #4CAF50; /* Green for in */
}
.progress-bar.out {
  background-color: #FF9800; /* Orange for out */
}

.main-content-cards {
  display: grid;
  grid-template-columns: 2fr 1fr; /* Top order card wider than notifications */
  gap: 20px;
}

.top-order-card {
  justify-content: space-between; /* Push subtitle to top, stock to bottom */
}

.top-order-card .card-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.top-order-item {
  font-size: 36px;
  font-weight: 700;
  color: #333;
  margin-top: auto; /* Pushes it to the bottom if content above is flexible */
}

.top-order-stock {
  text-align: right;
  margin-top: 10px; /* Space from item name */
}
.top-order-stock p:first-child {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}
.top-order-stock p:last-child {
  font-size: 14px;
  color: #999;
}

.notifications-card .card-subtitle {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.notifications-card .card-subtitle::before {
  content: '';
  width: 8px;
  height: 8px;
  background-color: #EF5350; /* Red dot */
  border-radius: 50%;
  display: inline-block;
}


.notification-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-dot {
  width: 6px;
  height: 6px;
  background-color: #EF5350; /* Red dot */
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px; /* Align with text baseline */
}

.notification-details {
  display: flex;
  flex-direction: column;
}

.notification-message {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.notification-description {
  font-size: 13px;
  color: #EF5350; /* Red for alert item */
  margin: 2px 0;
}

.notification-sub-description {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.view-all-notifications {
  text-align: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.view-all-notifications a {
  color: #22c55e;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.view-all-notifications a:hover {
  text-decoration: underline;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .metric-cards-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 columns on medium screens */
  }
}

@media (max-width: 768px) {
  .metric-cards-grid {
    grid-template-columns: 1fr; /* 1 column on small screens */
  }
  .main-content-cards {
    grid-template-columns: 1fr; /* Stack main cards on small screens */
  }
  .admin-dashboard {
    padding: 16px;
  }
}

</style>
