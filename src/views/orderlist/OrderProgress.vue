<template>
  <div class="order-progress">
    <h3 class="title">주문 진행 상태</h3>

    <!-- 취소 상태일 때 -->
    <div v-if="isCancelled" class="cancelled-bar">
      {{ displayText }}
    </div>

    <!-- 진행 상태일 때 -->
    <template v-else>
      <!-- 진행 바 -->
      <div class="progress-bar">
        <div
          class="progress-bar__active"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>

      <!-- 단계 라벨 -->
      <div class="steps">
        <span
          v-for="step in steps"
          :key="step.key"
          :class="['step', { active: step.index <= currentStepIndex }]"
        >
          {{ step.label }}
        </span>
      </div>
    </template>
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

// Define the steps for sequential progress
const steps = [
  { key: 'PENDING', label: '주문 접수', index: 0 },
  { key: 'PAID', label: '상품 준비중', index: 1 }, // Changed from '결제 완료' to '상품 준비중'
  { key: 'PREPARING', label: '배송 준비중', index: 2 }, // Changed from '상품 준비중' to '배송 준비중'
  { key: 'SHIPPING', label: '배송 중', index: 3 },
  { key: 'DELIVERED', label: '배송 완료', index: 4 }
]

// Check if the order is cancelled
const isCancelled = computed(() => props.status === 'CANCELLED');

// Display text for cancelled status
const displayText = computed(() => {
  if (isCancelled.value) return '주문 취소';
  // Fallback, though typically not used if isCancelled handles it
  return steps.find(s => s.key === props.status)?.label || '알 수 없음';
});


const currentStepIndex = computed(() => {
  const step = steps.find(s => s.key === props.status)
  // If cancelled or unknown, don't highlight any step (or show a special state)
  return step ? step.index : -1 // -1 means no step is active for standard progress
})

const progressPercent = computed(() => {
  if (isCancelled.value) return 0; // No progress for cancelled state
  if (currentStepIndex.value === -1) return 0; // No progress for unknown state
  return (currentStepIndex.value / (steps.length - 1)) * 100
})
</script>

<style scoped>
.order-progress {
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

/* 진행 바 */
.progress-bar {
  position: relative;
  height: 8px;
  background: #eaecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar__active {
  height: 100%;
  background: #2ecc71; /* Green for active progress */
  transition: width 0.3s ease;
}

/* 단계 텍스트 */
.steps {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.step {
  font-size: 12px;
  color: #b0b0b0;
}

.step.active {
  color: #2ecc71; /* Green for active step text */
  font-weight: 600;
}

/* 취소 상태 바 */
.cancelled-bar {
  height: 8px; /* Same height as progress bar */
  background: #ef4444; /* Red color for cancelled */
  border-radius: 4px;
  display: flex; /* To center text if needed */
  align-items: center;
  justify-content: center;
  color: white; /* White text on red bar */
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px; /* Space from title */
}
</style>
