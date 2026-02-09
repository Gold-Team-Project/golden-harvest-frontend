<template>
  <div class="product-detail-container">
    <div class="breadcrumb">홈 / 주문 / <strong>상품 상세</strong></div>

    <div v-if="loading" class="loading-state">
      <p>상품 정보를 불러오는 중...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>오류: {{ error }}</p>
    </div>

    <div v-else-if="product" class="detail-content">
      <div class="image-section">
        <div class="card img-card">
          <img :src="product.fileUrl || '/placeholder.png'" :alt="product.itemName" class="main-img" />
        </div>
      </div>

      <div class="info-section">
        <div class="card info-card">
          <div class="category-badge">{{ product.varietyName }} | {{ product.grade }}</div>
          <h2 class="product-name">{{ product.itemName }}</h2>
          
          <div class="price-box">
            <span class="price">{{ (product.customerPrice || 0).toLocaleString() }}원</span>
            <span class="unit">/ {{ product.baseUnit }}</span>
          </div>

          <div class="divider"></div>

          <div class="spec-grid">
            <div class="spec-item">
              <span class="label">원산지</span>
              <span class="val">{{ product.country || '국산' }}</span>
            </div>
            <div class="spec-item">
              <span class="label">규격</span>
              <span class="val">{{ product.packToKg }}kg / {{ product.baseUnit }}</span>
            </div>
            <div class="spec-item">
              <span class="label">저장방법</span>
              <span class="val">{{ product.storageTempMin }}℃ ~ {{ product.storageTempMax }}℃</span>
            </div>
          </div>

          <div class="quantity-box">
            <label>수량 선택</label>
            <div class="qty-control">
              <button @click="quantity > 1 && quantity--" :disabled="quantity <= 1">-</button>
              <input type="number" v-model.number="quantity" min="1" />
              <button @click="quantity++">+</button>
            </div>
          </div>

          <div class="total-box">
            <span class="label">주문금액</span>
            <span class="val">{{ (product.customerPrice * quantity).toLocaleString() }}원</span>
          </div>

          <div class="action-btns">
            <button class="cart-btn" @click="handleAddToCart">장바구니 담기</button>
            <button class="buy-btn" @click="handleBuyNow">바로 구매</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchItemDetail, addToCart } from '@/api/OrderApi.js'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const product = ref(null)
const loading = ref(true)
const error = ref(null)
const quantity = ref(1)

const loadProductDetail = async () => {
  loading.value = true
  try {
    const response = await fetchItemDetail(route.params.id)
    if (response.success) {
      product.value = response.data
    } else {
      error.value = response.message
    }
  } catch (err) {
    error.value = '상품 정보를 가져오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

const handleAddToCart = async () => {
  try {
    const response = await addToCart({
      skuNo: product.value.skuNo,
      quantity: quantity.value
    })
    if (response.data && response.data.success) {
      Swal.fire({
        title: '장바구니 담기 성공',
        text: '상품이 장바구니에 담겼습니다.',
        icon: 'success',
        confirmButtonColor: '#11D411'
      })
    }
  } catch (err) {
    Swal.fire({
      title: '오류 발생',
      text: '장바구니 담기 중 오류가 발생했습니다.',
      icon: 'error'
    })
  }
}

const handleBuyNow = async () => {
  // 장바구니에 담고 바로 장바구니 페이지로 이동하는 심플한 로직
  try {
    await addToCart({
      skuNo: product.value.skuNo,
      quantity: quantity.value
    })
    router.push({ name: 'Cart' })
  } catch (err) {
    Swal.fire({
      title: '오류 발생',
      text: '구매 요청 중 오류가 발생했습니다.',
      icon: 'error'
    })
  }
}

onMounted(loadProductDetail)
</script>

<style scoped>
.product-detail-container { padding: 20px 50px; background-color: #f8f9fb; min-height: 100vh; text-align: left; }
.breadcrumb { font-size: 14px; color: #888; margin-bottom: 20px; }

.detail-content { display: flex; gap: 40px; align-items: flex-start; }
.image-section { flex: 1; }
.info-section { flex: 1.2; }

.card { background: #fff; border-radius: 20px; border: 1px solid #e0e0e0; box-shadow: 0 4px 20px rgba(0,0,0,0.03); padding: 30px; }
.img-card { padding: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; background: #fff; height: 500px; }
.main-img { width: 100%; height: 100%; object-fit: contain; }

.info-card { display: flex; flex-direction: column; gap: 20px; }
.category-badge { display: inline-block; padding: 4px 12px; background: #f0fdf0; color: #11D411; border-radius: 20px; font-size: 12px; font-weight: 700; align-self: flex-start; }
.product-name { font-size: 28px; font-weight: 800; color: #333; margin: 0; }

.price-box { display: flex; align-items: baseline; gap: 8px; }
.price { font-size: 32px; font-weight: 900; color: #11D411; }
.unit { font-size: 18px; color: #888; }

.divider { height: 1px; background: #eee; margin: 10px 0; }

.spec-grid { display: flex; flex-direction: column; gap: 15px; }
.spec-item { display: flex; gap: 20px; font-size: 15px; }
.spec-item .label { color: #888; min-width: 80px; }
.spec-item .val { color: #333; font-weight: 600; }

.quantity-box { margin-top: 20px; display: flex; flex-direction: column; gap: 10px; }
.quantity-box label { font-size: 14px; font-weight: 700; color: #444; }
.qty-control { display: flex; align-items: center; gap: 10px; }
.qty-control button { width: 36px; height: 36px; border: 1px solid #ddd; background: #fff; cursor: pointer; border-radius: 8px; font-size: 18px; transition: all 0.2s; }
.qty-control button:hover:not(:disabled) { border-color: #11D411; color: #11D411; }
.qty-control button:disabled { opacity: 0.3; cursor: not-allowed; }
.qty-control input { width: 60px; height: 36px; text-align: center; border: 1px solid #ddd; border-radius: 8px; outline: none; }

.total-box { margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
.total-box .label { font-size: 16px; font-weight: 700; color: #333; }
.total-box .val { font-size: 24px; font-weight: 900; color: #11D411; }

.action-btns { display: flex; gap: 15px; margin-top: 20px; }
.action-btns button { flex: 1; height: 55px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.cart-btn { background: #fff; border: 2px solid #11D411; color: #11D411; }
.cart-btn:hover { background: #f0fdf0; }
.buy-btn { background: #11D411; border: none; color: #fff; }
.buy-btn:hover { background: #0fb80f; }

.loading-state, .error-state { padding: 100px; text-align: center; color: #666; }

@media (max-width: 1024px) {
  .detail-content { flex-direction: column; }
  .img-card { height: 350px; }
}
</style>
