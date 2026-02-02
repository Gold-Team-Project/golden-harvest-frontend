<template>
  <div class="cart-view">
    <div class="main-content">
      <h1 class="page-title">장바구니</h1>
      <p class="page-subtitle">주문하실 상품을 확인하고 결제를 진행해주세요.</p>

      <div v-if="loading" class="card cart-items-card">
        <p>장바구니 상품을 불러오는 중...</p>
      </div>
      <div v-else-if="error" class="card cart-items-card">
        <p style="color: red;">오류: {{ error }}</p>
      </div>
      <div v-else-if="cartItems.length === 0" class="card cart-items-card">
        <p>장바구니에 담긴 상품이 없습니다.</p>
      </div>
      <div v-else class="card cart-items-card">
        <div class="card-header">
          <div class="select-all">
            <input type="checkbox" id="select-all" v-model="allSelected" />
            <label for="select-all">전체 선택 ({{ selectedItems.length }}/{{ cartItems.length }})</label>
          </div>
          <button class="delete-selected-btn" @click="deleteSelectedItems">선택 삭제</button>
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
              <button @click="decreaseQuantity(item)">-</button>
              <input type="number" v-model="item.quantity" readonly /> <!-- v-model instead of :value, keeping readonly for now -->
              <button @click="increaseQuantity(item)">+</button>
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
        </div>
        <div class="final-payment">
          <span>최종 결제 금액</span>
          <span class="final-amount">{{ totalProductPrice.toLocaleString() }}원</span>
        </div>
        <BaseButton @click="placeOrder">주문하기</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import BaseButton from '@/components/button/BaseButton.vue';
import { fetchCartItems, updateCartItemQuantity, deleteCartItem, checkoutCart } from '@/api/OrderApi';

const cartItems = ref([]); // Initialize as empty array
const loading = ref(true); // Loading state
const error = ref(null); // Error state

const selectedItems = computed(() => cartItems.value.filter(item => item.selected));
const allSelected = computed({
  get: () => cartItems.value.length > 0 && selectedItems.value.length === cartItems.value.length,
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

// Function to load cart items from API
const loadCartItems = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetchCartItems(); // Call the API
    if (response.success && response.data) {
      // Access the items array nested within response.data
      const apiCartItems = response.data.items;

      if (Array.isArray(apiCartItems)) {
        cartItems.value = apiCartItems.map(item => ({
          id: item.skuNo, // Using skuNo as id, as cartItemId is not provided
          name: item.itemName,
          spec: '정보 없음', // API does not provide spec, default to '정보 없음'
          origin: '정보 없음', // API does not provide origin, default to '정보 없음'
          price: (item.totalPrice && item.quantity) ? (item.totalPrice / item.quantity) : 0, // Calculate unit price
          quantity: item.quantity || 0,
          image: '', // API does not provide image, default to empty string
          selected: true,
        }));
      } else {
        // If data.items is not an array, set error or handle appropriately
        console.error('API response.data.items is not an array:', apiCartItems);
        error.value = '장바구니 데이터 형식이 올바르지 않습니다.';
      }
    } else {
      error.value = response.message || '장바구니 상품을 불러오는데 실패했습니다.';
    }
  } catch (err) {
    error.value = 'API 호출 중 오류가 발생했습니다: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Function to update item quantity via API
const callUpdateCartItemQuantity = async (skuNo, quantity) => {
  // Save old quantity to revert on error
  const oldCartItem = cartItems.value.find(item => item.id === skuNo);
  const oldQuantity = oldCartItem ? oldCartItem.quantity : quantity;

  loading.value = true; // Use main loading for now
  error.value = null;
  try {
    const response = await updateCartItemQuantity(skuNo, quantity);
    if (!response.success) {
      error.value = response.message || '수량 변경에 실패했습니다.';
      // Revert quantity on error
      if (oldCartItem) oldCartItem.quantity = oldQuantity;
    }
  } catch (err) {
    error.value = 'API 호출 중 오류가 발생했습니다: ' + err.message;
    console.error(err);
    // Revert quantity on error
    if (oldCartItem) oldCartItem.quantity = oldQuantity;
  } finally {
    loading.value = false;
  }
};

// Decrease item quantity
const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--;
    callUpdateCartItemQuantity(item.id, item.quantity);
  }
};

// Increase item quantity
const increaseQuantity = (item) => {
  item.quantity++;
  callUpdateCartItemQuantity(item.id, item.quantity);
};

// Function to delete an item from the cart via API
const callDeleteCartItem = async (skuNo) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await deleteCartItem(skuNo);
    if (response.success) {
      // Remove item from local cartItems array
      cartItems.value = cartItems.value.filter(item => item.id !== skuNo);
    } else {
      error.value = response.message || '상품 삭제에 실패했습니다.';
    }
  } catch (err) {
    error.value = 'API 호출 중 오류가 발생했습니다: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};



// Delete all selected items from cart
const deleteSelectedItems = async () => {
  if (selectedItems.value.length === 0) {
    alert('삭제할 상품을 선택해주세요.');
    return;
  }

  // Confirm with user (optional, but good practice)
  if (!confirm(`${selectedItems.value.length}개의 상품을 삭제하시겠습니까?`)) {
    return;
  }

  // Collect promises for all delete operations
  const deletePromises = selectedItems.value.map(item => callDeleteCartItem(item.id));

  // Wait for all deletions to complete
  await Promise.all(deletePromises);
  
  // After all deletions, the cartItems.value should be updated locally by callDeleteCartItem
  // If API requires a full reload after multiple deletes for consistency, call loadCartItems() here.
  // For now, assume local update is sufficient or loadCartItems will be called by another action.
};

// Function to place an order (checkout)
const placeOrder = async () => {
  if (selectedItems.value.length === 0) {
    alert('주문할 상품을 선택해주세요.');
    return;
  }
  
  if (!confirm(`${selectedItems.value.length}개의 상품을 주문하시겠습니까?`)) {
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    const response = await checkoutCart();
    if (response.success && response.data) {
      alert(`주문이 성공적으로 완료되었습니다! 주문 번호: ${response.data}`);
      // Clear cart locally and reload to reflect empty state
      cartItems.value = [];
      loadCartItems(); // Reload cart to ensure consistency
    } else {
      error.value = response.message || '주문에 실패했습니다.';
    }
  } catch (err) {
    error.value = 'API 호출 중 오류가 발생했습니다: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Load cart items on component mount
onMounted(() => {
  loadCartItems();
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