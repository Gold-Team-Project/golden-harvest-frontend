<template>
  <div class="product-detail-view">
    <div class="product-image-section">
      <img src="" alt="Product Image" class="main-product-image" />
    </div>
    <div class="product-info-section">
      <div class="card">
        <h1 class="product-name">사과 15kg</h1>
        <p class="product-origin">원산지 : 전라남도 임자면</p>
        <p class="product-price">80,000 원</p>

        <div class="selection-box">
          <div class="selection-header">
            <span>품목</span>
            <span>가격</span>
            <span>수량</span>
          </div>
          <div class="selection-item">
            <span>대저 짭짤이 토마토 15kg</span>
            <span>80,000</span>
            <span>5</span>
          </div>
          <div class="selection-total">
            <span>합계 : <strong>400,000 원</strong></span>
          </div>
        </div>

        <div class="controls">
          <div class="quantity-control">
            <button>-</button>
            <input type="text" value="5" readonly />
            <button>+</button>
          </div>
          <BaseButton variant="primary">장바구니 담기</BaseButton>
          <BaseButton variant="primary">바로 구매하기</BaseButton>
        </div>

        <ul class="product-details-list">
          <li>총 중량 : 5000g</li>
          <li>과일 종류 : 부사</li>
          <li>품목코드 : A-1023</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/button/BaseButton.vue';
</script>

<style scoped>
.product-detail-view {
  display: flex;
  gap: 24px;
}
.product-image-section {
  flex-basis: 50%;
  max-width: 50%;
}
.main-product-image {
  width: 100%;
  border-radius: 12px;
  background-color: #f3f4f6;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}
.product-info-section {
  flex-basis: 50%;
  max-width: 50%;
}
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
.product-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}
.product-origin {
  font-size: 14px;
  color: #6b7280;
  margin: 8px 0 16px 0;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 16px;
}
.product-price {
  font-size: 28px;
  font-weight: 700;
  color: #ef4444;
  margin: 0 0 24px 0;
}
.selection-box {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  margin-bottom: 24px;
}
.selection-header, .selection-item {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr;
  gap: 16px;
  padding-bottom: 8px;
}
.selection-header {
  color: #6b7280;
  font-weight: 500;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 8px;
}
.selection-total {
  text-align: right;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  font-size: 16px;
}
.selection-total strong {
  color: #ef4444;
  font-size: 18px;
}
.controls {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}
.controls .btn {
  flex: 1;
}
.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.quantity-control button {
  width: 40px;
  height: 40px;
  border: none;
  background: #f9fafb;
  cursor: pointer;
  font-size: 16px;
}
.quantity-control input {
  width: 50px;
  height: 40px;
  border: none;
  text-align: center;
  font-size: 14px;
  -moz-appearance: textfield;
}
.product-details-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 14px;
  color: #4b5563;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
