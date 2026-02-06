<template>
  <div class="admin-container">
    <div class="breadcrumb">홈 / 거래 관리 / 상품 목록 / <strong>상품 상세</strong></div>

    <div class="detail-wrapper" v-if="productDetails">
      <div class="image-card">
        <div class="image-inner">
          <img
              :src="productDetails.fileUrl || '/path/to/default-image.png'"
              :alt="productDetails.itemName"
              class="main-img"
          />
        </div>
      </div>

      <div class="info-card">
        <div class="info-header">
          <span class="category-tag">{{ productDetails.varietyName || '카테고리' }}</span>
          <h1 class="item-title">{{ productDetails.itemName || '상품명' }}</h1>
          <p class="item-origin">원산지 : {{ productDetails.country || '국산' }}</p>
        </div>

        <div class="price-section">
          <span class="price-label">판매가</span>
          <span class="price-amount">{{ (displayPrice || 0).toLocaleString() }}원</span>
        </div>

        <div class="order-controls">
          <div class="control-row">
            <label>수량 선택</label>
            <div class="quantity-selector">
              <button @click="decreaseQuantity" class="qty-btn" type="button">-</button>
              <input type="text" :value="quantity" readonly class="qty-input" />
              <button @click="increaseQuantity" class="qty-btn" type="button">+</button>
            </div>
          </div>
          <BaseButton
              variant="primary"
              :disabled="isSubmitting"
              @click="handleAddToCart"
          >
            장바구니 담기
          </BaseButton>



          <div class="total-section">
            <span class="total-label">총 주문 금액</span>
            <span class="total-amount">{{ (displayPrice * quantity).toLocaleString() }}원</span>
          </div>

          <div class="button-group">
            <button class="cart-btn" @click="handleAddToCart" :disabled="isSubmitting">
              장바구니 담기
            </button>
            <button class="buy-btn" @click="handleBuyNow" :disabled="isSubmitting">
              바로 구매하기
            </button>
          </div>
        </div>

        <div class="spec-section">
          <h3>상세 정보</h3>
          <ul class="spec-list">
            <li><span class="spec-label">총 중량</span> {{ productDetails.packToKg || '-' }}</li>
            <li><span class="spec-label">품목코드</span> {{ productDetails.itemCode || '-' }}</li>
            <li v-if="productDetails.grade"><span class="spec-label">등급</span> {{ productDetails.grade }}</li>
            <li v-if="productDetails.shelfLifeDays"><span class="spec-label">유통기한</span> 제조일로부터 {{ productDetails.shelfLifeDays }}일</li>
            <li v-if="productDetails.storageTempMin"><span class="spec-label">보관온도</span> {{ productDetails.storageTempMin }}℃ ~ {{ productDetails.storageTempMax }}℃</li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="loading-state">
      <div class="spinner"></div>
      <p>상품 정보를 불러오는 중입니다...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '@/components/button/BaseButton.vue';
import { fetchItemDetail, addToCart } from '@/api/OrderApi.js';
import Swal from 'sweetalert2'; // 1. Swal 추가

const route = useRoute();
const router = useRouter();

const productDetails = ref(null);
const quantity = ref(1);
const displayPrice = ref(0);
const isSubmitting = ref(false);

/* 수량  */
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

    // [디자인 변경] 성공 알림
    Swal.fire({
      title: '장바구니 담기 완료',
      text: '장바구니에 상품을 성공적으로 담았습니다 🛒',
      icon: 'success',
      confirmButtonColor: '#11D411',
      borderRadius: '16px'
    });
  } catch (e) {
    // [디자인 변경] 실패 알림
    Swal.fire({
      title: '담기 실패',
      text: '장바구니 담기에 실패했습니다.',
      icon: 'error',
      confirmButtonColor: '#ef4444',
      borderRadius: '16px'
    });
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
    }
  } catch (error) {
    console.error('데이터 로드 오류:', error);
  }
});
</script>

<style scoped>
.admin-container { padding: 20px 50px; background-color: #f8f9fb; min-height: 100vh; }
.breadcrumb { font-size: 14px; color: #888; margin-bottom: 20px; text-align: left; }

.detail-wrapper { display: flex; gap: 30px; align-items: flex-start; width: 100%; }

/* 이미지 카드 */
.image-card { flex: 1; background: #fff; border-radius: 20px; padding: 20px; border: 1px solid #e0e0e0; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
.image-inner { width: 100%; border-radius: 15px; overflow: hidden; background: #f9f9f9; aspect-ratio: 1/1; }
.main-img { width: 100%; height: 100%; object-fit: cover; }

/* 정보 카드 */
.info-card { flex: 1.2; background: #fff; border-radius: 20px; padding: 40px; border: 1px solid #e0e0e0; box-shadow: 0 4px 20px rgba(0,0,0,0.03); text-align: left; }

.category-tag { color: #11D411; font-weight: 700; font-size: 14px; margin-bottom: 10px; display: block; }
.item-title { font-size: 32px; font-weight: 800; color: #222; margin: 0 0 10px 0; }
.item-origin { font-size: 15px; color: #888; margin-bottom: 30px; }

.price-section { display: flex; align-items: baseline; gap: 15px; padding-bottom: 30px; border-bottom: 1px solid #f1f3f5; margin-bottom: 30px; }
.price-label { font-size: 16px; color: #444; font-weight: 600; }
.price-amount { font-size: 28px; font-weight: 800; color: #11D411; }

/* 주문 컨트롤 박스 */
.order-controls { background: #f8f9fb; padding: 25px; border-radius: 15px; margin-bottom: 30px; }
.control-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.control-row label { font-weight: 700; color: #444; }

.quantity-selector { display: flex; align-items: center; background: #fff; border: 1px solid #C8E4C8; border-radius: 10px; overflow: hidden; }
.qty-btn { width: 40px; height: 40px; border: none; background: #fff; cursor: pointer; font-size: 18px; color: #666; }
.qty-btn:hover { background: #f0fdf0; color: #11D411; }
.qty-input { width: 50px; text-align: center; border: none; font-weight: 700; font-size: 16px; color: #333; outline: none; background: transparent; }

.total-section { display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px dotted #ccc; }
.total-label { font-weight: 700; color: #444; }
.total-amount { font-size: 22px; font-weight: 800; color: #ef4444; }

.button-group { display: flex; gap: 10px; margin-top: 25px; }
.cart-btn, .buy-btn { flex: 1; height: 55px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.cart-btn { background: #374151; border: 1px solid #FFFFFF; color: #fff; }
.cart-btn:hover { background-color: #1f2937; }
.cart-btn:active { transform: scale(0.98); }

.buy-btn { background: #11D411; border: none; color: #fff; }
.buy-btn:hover { background-color: #0fb80f; }
.buy-btn:active { transform: scale(0.98); }



.spec-section h3 { font-size: 18px; font-weight: 700; margin-bottom: 15px; color: #333; }
.spec-list { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.spec-list li { font-size: 14px; color: #666; display: flex; align-items: center; }
.spec-label { width: 80px; font-weight: 600; color: #999; font-size: 13px; flex-shrink: 0; }

.loading-state { padding: 100px; text-align: center; color: #888; width: 100%; }
</style>
