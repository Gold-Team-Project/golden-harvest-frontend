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
    case 'PENDING':
    case 'ORDER_RECEIVED': return '주문접수';
    case 'PAID': return '결제완료';
    case 'PREPARING':
    case 'PRODUCT_PREPARING': return '상품준비중';
    case 'SHIPPING': return '배송중';
    case 'DELIVERED': return '배송완료';
    case 'CONFIRMED':
    case 'PURCHASE_CONFIRMED': return '구매확정';
    case 'CANCELLED': return '주문취소';
    case 'RETURN_EXCHANGE': return '반품/교환';
    case 'REFUNDED': return '환불완료';
    case 'PENDING_PAYMENT': return '입금대기';
    default: return '알 수 없음';
  }
});

const statusClass = computed(() => {
  switch (props.status) {
    case 'PENDING':
    case 'ORDER_RECEIVED': return 'status-pending';
    case 'PAID': return 'status-paid';
    case 'PREPARING':
    case 'PRODUCT_PREPARING': return 'status-preparing';
    case 'SHIPPING': return 'status-shipping';
    case 'DELIVERED': return 'status-delivered';
    case 'CONFIRMED':
    case 'PURCHASE_CONFIRMED': return 'status-confirmed';
    case 'CANCELLED': return 'status-cancelled';
    case 'RETURN_EXCHANGE': return 'status-return-exchange';
    case 'REFUNDED': return 'status-refunded';
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
  background-color: #fffbe6;
  color: #d97706;
}
.status-paid {
  background-color: #dcfce7;
  color: #16a34a;
}
.status-preparing {
  background-color: #eff6ff;
  color: #2563eb;
}
.status-shipping {
  background-color: #f0f9ff;
  color: #0c4a6e;
}
.status-delivered {
  background-color: #dbeafe;
  color: #1d4ed8;
}
.status-confirmed {
  background-color: #f0fdfa; /* Teal */
  color: #0f766e;
}
.status-cancelled {
  background-color: #fee2e2;
  color: #ef4444;
}
.status-return-exchange {
  background-color: #fff7ed; /* Orange */
  color: #c2410c;
}
.status-refunded {
  background-color: #f5f5f5; /* Light Gray */
  color: #666;
}
.status-pending-payment {
  background-color: #fff1f2;
  color: #be123c;
}
.status-unknown {
  background-color: #f3f4f6;
  color: #6b7280;
}
</style>
