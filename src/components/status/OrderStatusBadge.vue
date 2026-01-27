<template>
  <span class="status-badge" :class="statusClass">
    {{ displayText }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true,
  }
});

const displayText = computed(() => {
  switch (props.status) {
    case 'PENDING': return '주문 접수';
    case 'PAID': return '상품 준비중'; // Changed from '결제 완료' to '상품 준비중'
    case 'PREPARING': return '배송 준비중'; // Changed from '상품 준비중' to '배송 준비중'
    case 'SHIPPING': return '배송 중';
    case 'DELIVERED': return '배송 완료';
    case 'CANCELLED': return '주문 취소';
    case 'PENDING_PAYMENT': return '입금 대기';
    default: return '알 수 없음';
  }
});

const statusClass = computed(() => {
  switch (props.status) {
    case 'PENDING': return 'status-pending';
    case 'PAID': return 'status-paid';
    case 'PREPARING': return 'status-preparing';
    case 'SHIPPING': return 'status-shipping';
    case 'DELIVERED': return 'status-delivered';
    case 'CANCELLED': return 'status-cancelled';
    case 'PENDING_PAYMENT': return 'status-pending-payment';
    default: return 'status-unknown';
  }
});
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;

  border: none;          /* 테두리 제거 */
}

/* Status-specific styles */
.status-pending {
  background-color: #fffbe6; /* Light yellow */
  color: #d97706; /* Dark yellow/orange */
}
.status-paid {
  background-color: #dcfce7; /* Light green */
  color: #16a34a; /* Dark green */
}
.status-preparing {
  background-color: #eff6ff; /* Light blue */
  color: #2563eb; /* Dark blue */
}
.status-shipping {
  background-color: #f0f9ff; /* Lighter blue */
  color: #0c4a6e; /* Darker blue */
}
.status-delivered {
  background-color: #dbeafe; /* Another light blue */
  color: #1d4ed8; /* Another dark blue */
}
.status-cancelled {
  background-color: #fee2e2; /* Light red */
  color: #ef4444; /* Dark red */
}
.status-pending-payment {
  background-color: #fef2f2; /* Light peach */
  color: #b91c1c; /* Dark red for pending payment */
}
.status-unknown {
  background-color: #e5e7eb; /* Light gray */
  color: #4b5563; /* Gray */
}
</style>
