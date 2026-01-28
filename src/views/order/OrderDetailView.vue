<template>
  <div class="product-detail-view" v-if="productDetails">
    <div class="product-image-section">
      <img :src="productDetails.fileUrl" :alt="productDetails.itemName" class="main-product-image" />
    </div>
    <div class="product-info-section">
      <div class="card">
        <h1 class="product-name">{{ productDetails.itemName }}</h1>
        <p class="product-origin">원산지 : {{ productDetails.country }}</p>
        <p class="product-price">
          {{ displayPrice.toLocaleString() }} 원
        </p>

        <div class="controls">
          <div class="quantity-control">
            <button @click="decreaseQuantity">-</button>
            <input type="text" :value="quantity" readonly />
            <button @click="increaseQuantity">+</button>
          </div>
          <BaseButton variant="primary">장바구니 담기</BaseButton>
          <BaseButton variant="primary">바로 구매하기</BaseButton>
        </div>

        <ul class="product-details-list">
          <li>총 중량 : {{ productDetails.packToKg }}</li>
          <li>과일 종류 : {{ productDetails.varietyName }}</li>
          <li>품목코드 : {{ productDetails.itemCode }}</li>
          <li v-if="productDetails.grade">등급 : {{ productDetails.grade }}</li>
          <li v-if="productDetails.description">설명 : {{ productDetails.description }}</li>
          <li v-if="productDetails.shelfLifeDays">유통기한 : {{ productDetails.shelfLifeDays }}일</li>
          <li v-if="productDetails.storageTempMin && productDetails.storageTempMax">
            저장 온도 : {{ productDetails.storageTempMin }}℃ ~ {{ productDetails.storageTempMax }}℃
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div v-else>
    <p>상품 정보를 불러오는 중...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BaseButton from '@/components/button/BaseButton.vue';
import { fetchItemDetail } from '@/api/OrderApi.js';

const route = useRoute();
const productDetails = ref(null);
const quantity = ref(1);
const displayPrice = ref(0); // New reactive variable for the price passed from OrderView

const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

onMounted(async () => {
  const skuNo = route.params.id; // Assuming skuNo is passed as 'id' in route params
  const priceQuery = route.query.price; // Get price from query parameter

  if (priceQuery) {
    displayPrice.value = parseFloat(priceQuery); // Parse price as a number
  } else {
    console.warn('Price not provided in query parameters.');
  }

  if (skuNo) {
    try {
      const response = await fetchItemDetail(skuNo);
      if (response && response.success) {
        productDetails.value = response.data;
      } else {
        console.error('상품 상세 정보를 불러오는데 실패했습니다:', response?.message);
        productDetails.value = null; // Set to null on failure
      }
    } catch (error) {
      console.error('상품 상세 정보를 불러오는 중 에러가 발생했습니다:', error);
      productDetails.value = null; // Set to null on error
    }
  } else {
    console.error('skuNo가 제공되지 않았습니다.');
    productDetails.value = null;
  }
});
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
