<template>
  <div class="order-progress">
    <h3 class="title">주문 진행 상태</h3>

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
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * props:
 * status 값 예시
 * - CREATED
 * - PREPARING
 * - SHIPPING
 * - DELIVERED
 */
const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const steps = [
  { key: 'CREATED', label: '신규 주문', index: 0 },
  { key: 'PREPARING', label: '상품준비중', index: 1 },
  { key: 'SHIPPING', label: '배송 중', index: 2 },
  { key: 'DELIVERED', label: '배송 완료', index: 3 }
]

const currentStepIndex = computed(() => {
  const step = steps.find(s => s.key === props.status)
  return step ? step.index : 0
})

const progressPercent = computed(() => {
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
  background: #2ecc71;
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
  color: #2ecc71;
  font-weight: 600;
}
</style>