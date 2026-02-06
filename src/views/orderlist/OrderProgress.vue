<template>
  <div class="order-progress-horizontal">
    <div v-if="isCancelled" class="cancelled-message">
      {{ displayText }}
    </div>

    <ul v-else class="steps-container">
      <li
          v-for="(step, index) in steps"
          :key="step.key"
          :class="['step-item', { 'active': step.index <= currentStepIndex, 'current': step.index === currentStepIndex }]"
      >
        <div class="node-wrapper">
          <div v-if="index !== 0" class="progress-line"></div>

          <div class="status-dot">
            <span v-if="step.index < currentStepIndex" class="check-icon">✓</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
        </div>

        <div class="status-text">
          <p>{{ step.label }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const steps = [
  { key: 'PENDING', label: '주문 접수', index: 0 },
  { key: 'PAID', label: '상품 준비중', index: 1 },
  { key: 'PREPARING', label: '배송 준비중', index: 2 },
  { key: 'SHIPPING', label: '배송 중', index: 3 },
  { key: 'DELIVERED', label: '배송 완료', index: 4 }
]

const isCancelled = computed(() => props.status === 'CANCELLED');

const displayText = computed(() => {
  if (isCancelled.value) return '주문이 취소되었습니다.';
  return steps.find(s => s.key === props.status)?.label || '알 수 없음';
});

const currentStepIndex = computed(() => {
  const step = steps.find(s => s.key === props.status);
  return step ? step.index : -1;
})
</script>

<style scoped>
.order-progress-horizontal {
  background: #ffffff;
  padding: 20px 0;
  width: 100%;
}

.steps-container {
  display: flex;
  justify-content: space-between;
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.step-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

/* 원과 선을 감싸는 영역 */
.node-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
  justify-content: center;
  margin-bottom: 12px;
}

/* 가로 연결 선 */
.progress-line {
  position: absolute;
  right: 50%; /* 원의 중심까지 */
  width: 100%;
  height: 2px;
  background-color: #e5e7eb;
  z-index: 1;
}

.status-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #ccc;
  z-index: 2;
  transition: all 0.3s ease;
}

/* 활성화 상태 스타일 */
.step-item.active .status-dot {
  background-color: #11D411;
  border-color: #11D411;
  color: #ffffff;
}

.step-item.active .progress-line {
  background-color: #11D411;
}

/* 현재 단계 강조 (그림자 효과) */
.step-item.current .status-dot {
  box-shadow: 0 0 0 4px rgba(17, 212, 17, 0.2);
}

.status-text p {
  margin: 0;
  font-size: 14px;
  color: #999;
  font-weight: 500;
}

.step-item.active .status-text p {
  color: #333;
}

.step-item.current .status-text p {
  color: #11D411;
  font-weight: 700;
}

.check-icon {
  font-size: 16px;
}

.cancelled-message {
  color: #ef4444;
  font-weight: 700;
  font-size: 16px;
  text-align: center;
  padding: 20px;
}
</style>