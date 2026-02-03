<template>
  <div class="admin-container">
    <div class="breadcrumb">홈 / 거래 관리 / <strong>상품 목록</strong></div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item">
          <label>카테고리</label>
          <select class="basic-select">
            <option>전체 카테고리</option>
          </select>
        </div>
        <div class="filter-item">
          <label>원산지</label>
          <select class="basic-select">
            <option>전체 원산지</option>
          </select>
        </div>
        <div class="filter-item">
          <label>가격대</label>
          <select class="basic-select">
            <option>전체 가격</option>
          </select>
        </div>
        <div class="filter-item flex-2">
          <label>상품 검색</label>
          <div class="search-input-wrapper">
            <img src="@/assets/search.svg" class="search-icon-svg" alt="search" />
            <input type="text" placeholder="찾으시는 상품명을 입력해주세요." @keyup.enter="loadProducts" />
          </div>
        </div>
        <button class="search-btn">필터 적용</button>
      </div>
    </div>

    <div class="list-card-transparent">
      <div class="card-header-inline">
        <div class="header-left">
          <img src="@/assets/search.svg" class="title-icon-svg" alt="list" />
          <h3>판매 상품 목록</h3>
        </div>
        <span class="total-count">총 <strong>{{ products.length }}</strong>개의 상품</span>
      </div>

      <div class="product-grid">
        <router-link
            v-for="product in products"
            :key="product.id"
            :to="{ name: 'ProductDetail', params: { id: product.id }, query: { price: product.price } }"
            class="product-link"
        >
          <div class="product-item-card">
            <div class="image-area">
              <img :src="product.image || '/path/to/default-apple.png'" :alt="product.name" class="product-img" />
              <span class="best-badge">BEST</span>
            </div>
            <div class="info-area">
              <p class="cat-text">{{ product.category }}</p>
              <h4 class="item-name">{{ product.name }}</h4>
              <div class="price-box">
                <span class="price-val">{{ (product.price || 0).toLocaleString() }}원</span>
                <span class="unit-text">/ {{ product.unit }}</span>
              </div>
              <button class="cart-add-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                장바구니 담기
              </button>
            </div>
          </div>
        </router-link>
      </div>

      <div class="pagination-wrapper">
        <div class="pagination">
          <button class="arrow" :disabled="true">&lt;</button>
          <button class="page active">1</button>
          <button class="arrow">&gt;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchProducts } from '@/api/OrderApi.js';

const products = ref([]);

const loadProducts = async () => {
  try {
    const response = await fetchProducts();
    if (response && response.success && Array.isArray(response.data)) {
      products.value = response.data.map(item => ({
        id: item.skuNo || Math.random().toString(36).substr(2, 9),
        name: item.itemName || '상품명 준비중',
        price: item.customerPrice || 0,
        unit: item.baseUnit || '단위 미정',
        category: item.varietyName ? `${item.varietyName} | ${item.gradeName}` : '일반 품목',
        image: item.fileUrl || '',
      }));
    }
  } catch (error) {
    console.error('에러:', error);
  }
};

onMounted(loadProducts);
</script>

<style scoped>
/* 필터 카드 스타일 (회원 관리 페이지와 동일) */
.filter-card {
  background: #fff; padding: 30px; border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 30px; border: 1px solid #e0e0e0;
}
.filter-grid { display: flex; gap: 15px; align-items: flex-end; }
.filter-item { display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 0; }
.filter-item.flex-2 { flex: 2; }
.filter-item label { font-size: 14px; font-weight: 700; color: #444; }

.search-input-wrapper { position: relative; width: 100%; }
.search-icon-svg { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); width: 18px; }
.search-input-wrapper input, .basic-select {
  width: 100%; height: 45px; padding: 0 15px; border: 1px solid #C8E4C8;
  border-radius: 10px; background: white; font-size: 14px; outline: none; transition: all 0.2s; box-sizing: border-box;
}
.search-input-wrapper input { padding-left: 45px; }
.search-input-wrapper input:focus, .basic-select:focus {
  border-color: #11D411 !important; box-shadow: 0 0 0 3px rgba(17, 212, 17, 0.05);
}

.search-btn { background: #11D411; color: #fff; border: none; padding: 0 30px; height: 45px; border-radius: 10px; font-weight: 700; cursor: pointer; flex-shrink: 0; }
.search-btn:hover { background-color: #0fb80f; }

/* 상품 리스트 영역 */
.list-card-transparent { display: flex; flex-direction: column; }
.card-header-inline { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 0 10px; }
.header-left { display: flex; align-items: center; gap: 10px; }
.title-icon-svg { width: 22px; }
.card-header-inline h3 { font-size: 18px; font-weight: 700; color: #333; margin: 0; }
.total-count { font-size: 14px; color: #666; }
.total-count strong { color: #11D411; }

/* 상품 그리드 & 카드 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}
.product-link { text-decoration: none; color: inherit; }

.product-item-card {
  background: #fff; border-radius: 20px; overflow: hidden; border: 1px solid #eef0f2;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.product-item-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.08);
  outline: 5px solid #11D411;
}

.image-area { position: relative; height: 220px; overflow: hidden; background: #f9f9f9; }
.product-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.product-item-card:hover .product-img { transform: scale(1.05); }

.best-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  /* 더 선명하고 고급스러운 골드 그라데이션 */
  background: linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #FF4500 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 900;
  padding: 6px 14px;
  border-radius: 50px; /* 알약 모양으로 변경하여 더 세련되게 */

  /* 배지 외곽에 빛나는 네온 효과 추가 */
  box-shadow: 0 0 15px rgba(255, 140, 0, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.5);

  text-transform: uppercase;
  letter-spacing: 1px;
  z-index: 10;
  overflow: hidden; /* 빛 효과가 배지 안에서만 보이도록 */
}

/* 반짝이는 빛 효과 (애니메이션) */
.best-badge::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -100%;
  width: 50%;
  height: 200%;
  background: rgba(255, 255, 255, 0.6);
  transform: rotate(30deg);
  transition: none;
  animation: shine 3s infinite; /* 3초마다 자동으로 반짝임 */
}

@keyframes shine {
  0% { left: -100%; }
  20% { left: 150%; }
  100% { left: 150%; }
}

/* 카드를 호버했을 때 더 역동적인 반응 */
.product-item-card:hover .best-badge {
  transform: scale(1.2) translateY(-3px) rotate(-5deg); /* 더 커지고 위로 살짝 뜸 */
  box-shadow: 0 0 25px rgba(255, 69, 0, 0.8); /* 호버 시 네온 효과 강화 */
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* 통통 튀는 느낌 */
}

.info-area { padding: 20px; text-align: left; }
.cat-text { font-size: 12px; color: #999; margin-bottom: 8px; }
.item-name { font-size: 17px; font-weight: 700; color: #333; margin: 0 0 12px 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.price-box { margin-bottom: 15px; display: flex; align-items: baseline; gap: 4px; }
.price-val { font-size: 20px; font-weight: 800; color: #11D411; }
.unit-text { font-size: 14px; color: #888; }

.cart-add-btn {
  width: 100%; height: 45px; border-radius: 12px; border: 1px solid #C8E4C8;
  background: #fdfdfd; color: #11D411; font-weight: 700; font-size: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; transition: all 0.2s;
}
.cart-add-btn:hover { background: #11D411; color: #fff; border-color: #11D411; }

/* 페이지네이션 */
.pagination-wrapper { margin-top: 40px; }
.pagination { display: flex; justify-content: center; gap: 5px; }
.page, .arrow { min-width: 32px; height: 32px; border-radius: 8px; border: 1px solid #eee; background: #fff; cursor: pointer; }
.page.active { background: #11D411; color: #fff; border-color: #11D411; }
</style>