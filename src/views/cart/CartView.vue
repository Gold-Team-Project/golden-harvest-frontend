<template>
  <div class="admin-container">
    <div class="breadcrumb">홈 / 거래 관리 / <strong>장바구니</strong></div>

    <div class="cart-layout">
      <div class="main-content">
        <div class="list-card">
          <div class="card-header">
            <div class="header-left">
              <img src="@/assets/cart.svg" class="title-icon-svg" alt="cart" />
              <h3>장바구니 상품 ({{ cartItems.length }})</h3>
            </div>
            <div class="header-actions">
              <div class="select-all">
                <input type="checkbox" id="select-all" v-model="allSelected" class="admin-checkbox" />
                <label for="select-all">전체 선택 ({{ selectedItems.length }}/{{ cartItems.length }})</label>
              </div>
              <button class="delete-selected-btn" @click="deleteSelectedItems">선택 삭제</button>
            </div>
          </div>

          <div v-if="loading" class="state-message">장바구니 상품을 불러오는 중...</div>
          <div v-else-if="error" class="state-message error">{{ error }}</div>
          <div v-else-if="cartItems.length === 0" class="state-message">장바구니에 담긴 상품이 없습니다.</div>

          <div v-else class="cart-items-list">
            <div class="cart-item" v-for="item in cartItems" :key="item.id">
              <div class="item-check">
                <input type="checkbox" v-model="item.selected" class="admin-checkbox" />
              </div>
              <div class="item-image-wrapper">
                <img :src="item.image || '/path/to/default.png'" :alt="item.name" class="item-image" />
              </div>
              <div class="item-info">
                <p class="item-name">{{ item.name }}</p>
                <p class="item-spec">규격: {{ item.spec }} | 원산지: {{ item.origin }}</p>
                <p class="item-price">단가: {{ item.price.toLocaleString() }}원</p>
              </div>
              <div class="quantity-control-wrapper">
                <div class="quantity-selector">
                  <button @click="decreaseQuantity(item)" class="qty-btn">-</button>
                  <input type="number" v-model="item.quantity" readonly class="qty-input" />
                  <button @click="increaseQuantity(item)" class="qty-btn">+</button>
                </div>
              </div>
              <p class="item-total-price">{{ (item.price * item.quantity).toLocaleString() }}원</p>
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar-content">
        <div class="summary-card">
          <h3 class="summary-title">결제 금액</h3>
          <div class="summary-details">
            <div class="summary-item">
              <span>총 상품금액</span>
              <span>{{ totalProductPrice.toLocaleString() }}원</span>
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
          <BaseButton class="order-btn" @click="placeOrder">주문하기</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import BaseButton from '@/components/button/BaseButton.vue';
import { fetchCartItems, updateCartItemQuantity, deleteCartItem, checkoutCart } from '@/api/OrderApi';
import Swal from 'sweetalert2'; // 1. Swal 추가

const cartItems = ref([]);
const loading = ref(true);
const error = ref(null);

const selectedItems = computed(() => cartItems.value.filter(item => item.selected));
const allSelected = computed({
  get: () => cartItems.value.length > 0 && selectedItems.value.length === cartItems.value.length,
  set: (value) => { cartItems.value.forEach(item => item.selected = value); }
});

const totalProductPrice = computed(() => {
  return selectedItems.value.reduce((total, item) => total + (item.price * item.quantity), 0);
});

const loadCartItems = async () => {
  loading.value = true; error.value = null;
  try {
    const response = await fetchCartItems();
    if (response.success && response.data) {
      const apiCartItems = response.data.items;
      if (Array.isArray(apiCartItems)) {
        cartItems.value = apiCartItems.map(item => ({
          id: item.skuNo,
          name: item.itemName,
          spec: '정보 없음',
          origin: '정보 없음',
          price: (item.totalPrice && item.quantity) ? (item.totalPrice / item.quantity) : 0,
          quantity: item.quantity || 0,
          image: '',
          selected: true,
        }));
      } else { error.value = '장바구니 데이터 형식이 올바르지 않습니다.'; }
    } else { error.value = response.message || '불러오기 실패'; }
  } catch (err) { error.value = err.message; } finally { loading.value = false; }
};

const callUpdateCartItemQuantity = async (skuNo, quantity) => {
  try { await updateCartItemQuantity(skuNo, quantity); } catch (err) { console.error(err); }
};

const decreaseQuantity = (item) => {
  if (item.quantity > 1) { item.quantity--; callUpdateCartItemQuantity(item.id, item.quantity); }
};

const increaseQuantity = (item) => {
  item.quantity++; callUpdateCartItemQuantity(item.id, item.quantity);
};

const callDeleteCartItem = async (skuNo) => {
  try {
    const response = await deleteCartItem(skuNo);
    if (response.success) {
      cartItems.value = cartItems.value.filter(item => item.id !== skuNo);
    }
  } catch (err) { console.error(err); }
};

// [수정] 선택 삭제 로직
const deleteSelectedItems = async () => {
  if (selectedItems.value.length === 0) {
    return Swal.fire({
      title: '선택된 상품 없음',
      text: '삭제할 상품을 선택해주세요.',
      icon: 'warning',
      confirmButtonColor: '#11D411',
      borderRadius: '16px'
    });
  }

  const result = await Swal.fire({
    title: '상품 삭제',
    text: `${selectedItems.value.length}개의 상품을 장바구니에서 삭제하시겠습니까?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#9ca3af',
    confirmButtonText: '삭제하기',
    cancelButtonText: '취소',
    reverseButtons: true,
    borderRadius: '16px'
  });

  if (result.isConfirmed) {
    // 실제 삭제 함수 호출
    const deletePromises = selectedItems.value.map(item => callDeleteCartItem(item.id));
    await Promise.all(deletePromises);

    Swal.fire({
      title: '삭제 완료',
      icon: 'success',
      confirmButtonColor: '#11D411',
      timer: 1500,
      showConfirmButton: false
    });
  }
};

// [수정] 주문하기 로직
const placeOrder = async () => {
  if (selectedItems.value.length === 0) {
    return Swal.fire({
      title: '주문 불가',
      text: '주문할 상품을 선택해주세요.',
      icon: 'warning',
      confirmButtonColor: '#11D411',
      borderRadius: '16px'
    });
  }

  const result = await Swal.fire({
    title: '주문하시겠습니까?',
    text: `${selectedItems.value.length}개의 상품을 주문합니다.`,
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#11D411',
    cancelButtonColor: '#9ca3af',
    confirmButtonText: '주문하기',
    cancelButtonText: '취소',
    reverseButtons: true,
    borderRadius: '16px'
  });

  if (result.isConfirmed) {
    try {
      const response = await checkoutCart();
      if (response.success) {
        await Swal.fire({
          title: '주문 완료',
          html: `성공적으로 주문되었습니다.<br>주문번호: <b>${response.data}</b>`,
          icon: 'success',
          confirmButtonColor: '#11D411',
          borderRadius: '16px'
        });
        loadCartItems();
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: '오류 발생',
        text: '주문 처리 중 문제가 발생했습니다.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  }
};

onMounted(() => { loadCartItems(); });
</script>

<style scoped>


.cart-layout { display: flex; gap: 30px; align-items: flex-start; }
.main-content { flex: 1; }
.sidebar-content { width: 350px; position: sticky; top: 20px; }

/* 리스트 카드 스타일 */
.list-card { background: #fff; border-radius: 20px; padding: 30px; border: 1px solid #e0e0e0; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
.card-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid #f1f3f5; margin-bottom: 20px; }
.header-left { display: flex; align-items: center; gap: 10px; }
.header-left h3 { font-size: 18px; font-weight: 800; color: #333; margin: 0; }
.title-icon-svg { width: 22px; }

.header-actions { display: flex; align-items: center; gap: 20px; }
.select-all { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #444; }
.admin-checkbox { width: 18px; height: 18px; accent-color: #11D411; cursor: pointer; }
.delete-selected-btn { background: none; border: none; color: #888; font-size: 13px; text-decoration: underline; cursor: pointer; }

/* 장바구니 아이템 리스트 */
.cart-items-list { display: flex; flex-direction: column; }
.cart-item { display: flex; align-items: center; padding: 20px 0; border-bottom: 1px solid #f9f9f9; }
.item-image-wrapper { width: 90px; height: 90px; border-radius: 12px; overflow: hidden; background: #f5f5f5; border: 1px solid #eee; margin: 0 20px; }
.item-image { width: 100%; height: 100%; object-fit: cover; }

.item-info { flex: 1; }
.item-name { font-size: 16px; font-weight: 700; color: #333; margin: 0 0 5px 0; }
.item-spec { font-size: 13px; color: #999; margin-bottom: 5px; }
.item-price { font-size: 14px; color: #11D411; font-weight: 600; }

/* 수량 조절기 디자인 통일 */
.quantity-selector { display: flex; align-items: center; background: #fff; border: 1px solid #C8E4C8; border-radius: 8px; overflow: hidden; }
.qty-btn { width: 32px; height: 32px; border: none; background: #fff; cursor: pointer; font-size: 16px; color: #666; transition: all 0.2s; }
.qty-btn:hover { background: #f0fdf0; color: #11D411; }
.qty-input { width: 45px; text-align: center; border: none; font-weight: 700; font-size: 14px; outline: none; background: transparent; }

.item-total-price { width: 130px; text-align: right; font-size: 18px; font-weight: 800; color: #333; }

/* 우측 요약 카드 */
.summary-card { background: #fff; border-radius: 20px; padding: 30px; border: 1px solid #e0e0e0; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
.summary-title { font-size: 18px; font-weight: 800; color: #333; margin: 0 0 25px 0; }
.summary-details { display: flex; flex-direction: column; gap: 15px; padding-bottom: 20px; border-bottom: 1px dotted #e0e0e0; }
.summary-item { display: flex; justify-content: space-between; font-size: 15px; color: #666; }

.final-payment { display: flex; justify-content: space-between; align-items: center; margin: 25px 0; }
.final-payment span:first-child { font-weight: 700; color: #333; }
.final-amount { font-size: 24px; font-weight: 800; color: #ef4444; }

/* 주문하기 버튼 */
.order-btn {
  width: 100% !important; height: 55px; background: #11D411 !important; color: #fff !important;
  border: none !important; border-radius: 12px !important; font-size: 18px !important; font-weight: 700 !important;
}
.order-btn:hover { background: #0fb80f !important; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(17, 212, 17, 0.3); }

.state-message { padding: 60px 0; text-align: center; color: #999; }
.state-message.error { color: #ef4444; }
</style>