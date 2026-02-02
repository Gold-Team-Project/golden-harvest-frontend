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
          <BaseButton
              variant="primary"
              :disabled="isSubmitting"
              @click="handleAddToCart"
          >
            장바구니 담기
          </BaseButton>


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

<<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '@/components/button/BaseButton.vue';
import { fetchItemDetail, addToCart } from '@/api/OrderApi.js';

const route = useRoute();
const router = useRouter();

const productDetails = ref(null);
const quantity = ref(1);
const displayPrice = ref(0);
const isSubmitting = ref(false);

/* 수량 */
const increaseQuantity = () => quantity.value++;
const decreaseQuantity = () => {
  if (quantity.value > 1) quantity.value--;
};

/* 총 금액 */
const totalPrice = computed(() => displayPrice.value * quantity.value);

/* 장바구니 */
const handleAddToCart = async () => {
  if (!productDetails.value || isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    await addToCart({
      skuNo: productDetails.value.skuNo,
      quantity: quantity.value,
    });
    alert('장바구니에 담았습니다 🛒');
  } catch (e) {
    alert('장바구니 담기에 실패했습니다.');
  } finally {
    isSubmitting.value = false;
  }
};



onMounted(async () => {
  const skuNo = route.params.id;
  const priceQuery = route.query.price;

  if (priceQuery) displayPrice.value = Number(priceQuery);

  try {
    const res = await fetchItemDetail(skuNo);
    if (res?.success) {
      productDetails.value = res.data;
    } else {
      console.error('상품 상세 정보 로드 실패:', res?.message);
    }
  } catch (error) {
    console.error('상품 상세 정보 로드 중 오류 발생:', error);
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
