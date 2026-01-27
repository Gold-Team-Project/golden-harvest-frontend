<template>
  <div class="cart-view">
    <div class="main-content">
      <h1 class="page-title">장바구니</h1>
      <p class="page-subtitle">주문하실 상품을 확인하고 결제를 진행해주세요.</p>

      <div class="card cart-items-card">
        <div class="card-header">
          <div class="select-all">
            <input type="checkbox" id="select-all" v-model="allSelected" @change="selectAll" />
            <label for="select-all">전체 선택 ({{ selectedItems.length }}/{{ cartItems.length }})</label>
          </div>
          <button class="delete-selected-btn">선택 삭제</button>
        </div>

        <div class="cart-items-list">
          <div class="cart-item" v-for="item in cartItems" :key="item.id">
            <input type="checkbox" v-model="item.selected" />
            <img :src="item.image" :alt="item.name" class="item-image" />
            <div class="item-info">
              <p class="item-name">{{ item.name }}</p>
              <p class="item-spec">규격: {{ item.spec }} | 원산지: {{ item.origin }}</p>
              <p class="item-price">단가: {{ item.price.toLocaleString() }}원</p>
            </div>
            <div class="quantity-control">
              <button>-</button>
              <input type="text" :value="item.quantity" readonly />
              <button>+</button>
            </div>
            <p class="item-total-price">{{ (item.price * item.quantity).toLocaleString() }}원</p>
          </div>
        </div>
      </div>
    </div>

    <div class="sidebar-content">
      <div class="card summary-card">
        <h3 class="summary-title">결제 금액</h3>
        <div class="summary-details">
          <div class="summary-item">
            <span>총 상품금액</span>
            <span>{{ totalProductPrice.toLocaleString() }}원</span>
          </div>
          <div class="summary-item">
            <span>상품 할인</span>
            <span>0원</span>
          </div>
          <div class="summary-item">
            <span>배송비</span>
            <span>0원</span>
          </div>
        </div>
        <div class="final-payment">
          <span>최종 결제 금액</span>
          <span class="final-amount">{{ totalProductPrice.toLocaleString() }}원</span>
        </div>
        <BaseButton>주문하기</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseButton from '@/components/button/BaseButton.vue';

const cartItems = ref([
  {
    id: 1,
    name: '국내산 신선 배추 20kg',
    spec: '20kg 박스',
    origin: '국내산',
    price: 30000,
    quantity: 5,
    image: '',
    selected: true,
  },
  {
    id: 2,
    name: '국내산 신선 배추 20kg',
    spec: '20kg 박스',
    origin: '국내산',
    price: 30000,
    quantity: 5,
    image: '',
    selected: true,
  },
]);

const selectedItems = computed(() => cartItems.value.filter(item => item.selected));
const allSelected = computed({
  get: () => selectedItems.value.length === cartItems.value.length,
  set: (value) => {
    cartItems.value.forEach(item => item.selected = value);
  }
});

const selectAll = () => {
  const allAreSelected = allSelected.value;
  cartItems.value.forEach(item => item.selected = !allAreSelected);
}

const totalProductPrice = computed(() => {
  return selectedItems.value.reduce((total, item) => total + (item.price * item.quantity), 0);
});

</script>

<style scoped>
.cart-view {
  display: flex;
  gap: 24px;
}
.main-content {
  flex: 1;
}
.sidebar-content {
  width: 320px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}
.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
}
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
.cart-items-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}
.select-all {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
.delete-selected-btn {
  font-size: 13px;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
}
.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}
.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
}
.item-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
}
.item-info {
  flex: 1;
}
.item-info p { margin: 0; }
.item-name { font-weight: 600; font-size: 16px; margin-bottom: 4px; }
.item-spec, .item-price { font-size: 13px; color: #6b7280; }
.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.quantity-control button {
  width: 30px;
  height: 30px;
  border: none;
  background: #f9fafb;
  cursor: pointer;
  font-size: 16px;
}
.quantity-control input {
  width: 40px;
  height: 30px;
  border: none;
  text-align: center;
  font-size: 14px;
  -moz-appearance: textfield;
}
.item-total-price {
  font-size: 16px;
  font-weight: 600;
  width: 120px;
  text-align: right;
}
.summary-card .summary-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}
.summary-card .summary-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
  color: #4b5563;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}
.summary-item {
  display: flex;
  justify-content: space-between;
}
.final-payment {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
  font-weight: 600;
}
.final-amount {
  font-size: 20px;
  color: #22c55e;
}
.summary-card .btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
}
</style>
