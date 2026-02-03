<template>
  <div class="order-progress-vertical">
    <h3 class="title">주문 진행 상태</h3>
    
    <div v-if="isCancelled" class="cancelled-message">
      {{ displayText }}
    </div>
    
    <ul v-else class="steps-list">
      <li 
        v-for="step in steps" 
        :key="step.key" 
        :class="['step-item', { 'active': step.index <= currentStepIndex }]"
      >
        <div class="status-dot"></div>
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
.order-progress-vertical {
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 10px;
}

.title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 20px;
}

.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
}

/* The vertical line */
.steps-list::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 5px;
  bottom: 5px;
  width: 2px;
  background-color: #e5e7eb;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  padding-bottom: 24px;
}

.step-item:last-child {
  padding-bottom: 0;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #e5e7eb;
  border: 2px solid #ffffff;
  z-index: 1;
  flex-shrink: 0;
  margin-top: 2px;
}

.step-item.active .status-dot {
  background-color: #2ecc71; /* Green for active step */
}

.status-text p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.step-item.active .status-text p {
  color: #111827;
  font-weight: 600;
}

.cancelled-message {
  color: #ef4444;
  font-weight: 600;
  font-size: 14px;
}
</style>
