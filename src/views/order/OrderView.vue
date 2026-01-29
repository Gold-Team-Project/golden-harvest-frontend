<template>
  <div class="order-view">
    <div class="card filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label>카테고리</label>
          <select>
            <option>전체</option>
          </select>
        </div>
        <div class="filter-group">
          <label>원산지</label>
          <select>
            <option>전체</option>
          </select>
        </div>
        <div class="filter-group">
          <label>가격대</label>
          <select>
            <option>전체</option>
          </select>
        </div>
      </div>
      <div class="filter-row">
        <div class="search-group">
          <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" fill="none" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" stroke-width="2" />
          </svg>
          <input placeholder="찾으시는 상품을 입력해주세요." />
        </div>
        <BaseButton>필터 적용</BaseButton>
      </div>
    </div>

    <div class="product-grid">
      <router-link
          v-for="product in products"
          :key="product.id"
          :to="{
          name: 'ProductDetail',
          params: { id: product.id },
          query: { price: product.price }
        }"
          class="product-link"
      >
        <div class="product-card">
          <div class="product-image-wrapper">
            <img :src="product.image || '/path/to/default-apple.png'" :alt="product.name" class="product-image" />
            <span class="best-badge">베스트</span>
          </div>
          <div class="product-info">
            <p class="product-category">{{ product.category }}</p>
            <p class="product-name">{{ product.name }}</p>
            <p class="product-price">
              <span class="price-value">{{ (product.price || 0).toLocaleString() }}원</span>
              <span class="price-unit"> / {{ product.unit }}</span>
            </p>
            <BaseButton variant="primary" size="md" class="add-to-cart-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
                <circle cx="9" cy="20" r="2" fill="currentColor"/>
                <circle cx="17" cy="20" r="2" fill="currentColor"/>
                <path d="M3 4h2l3 10h10l3-6H7" fill="currentColor"/>
              </svg>
              담기
            </BaseButton>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BaseButton from '@/components/button/BaseButton.vue';
import { fetchProducts } from '@/api/OrderApi.js';

const products = ref([]);

const loadProducts = async () => {
  try {
    const response = await fetchProducts();
    // ✅ response.data가 null이거나 빈 배열일 경우에 대비한 안전 장치
    if (response && response.success && Array.isArray(response.data)) {
      products.value = response.data.map(item => ({
        // ✅ 데이터가 비어있을 경우(null/undefined) 기본값 처리
        id: item.skuNo || Math.random().toString(36).substr(2, 9),
        name: item.itemName || '상품명 준비중',
        price: item.customerPrice || 0, // 0으로 처리하여 toLocaleString() 에러 방지
        unit: item.baseUnit || '단위 미정',
        category: item.varietyName ? `${item.varietyName} | ${item.gradeName}` : '카테고리 미분류',
        image: item.fileUrl || '',
      }));
    } else {
      console.warn('상품 데이터가 비어있거나 응답이 성공이 아닙니다:', response?.message);
    }
  } catch (error) {
    console.error('상품을 불러오는 중 에러가 발생했습니다:', error);
  }
};

onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
.order-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.product-link {
  text-decoration: none;
  color: inherit;
}
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
.filter-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-group label {
  font-size: 14px;
  color: #374151;
}
.filter-group select {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  min-width: 150px;
}
.search-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 8px 12px;
}
.search-icon { color: #6b7280; }
.search-group input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}
.product-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}
.product-image-wrapper {
  position: relative;
}
.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  background-color: #f3f4f6;
}
.best-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: #3b82f6;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}
.product-info {
  padding: 16px;
}
.product-category {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 4px 0;
}
.product-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.product-price {
  margin: 0 0 16px 0;
}
.price-value {
  font-size: 18px;
  font-weight: 700;
  color: #16a34a;
}
.price-unit {
  font-size: 14px;
  color: #6b7280;
}
.add-to-cart-btn {
  width: 100%;
  justify-content: center;
}
</style>