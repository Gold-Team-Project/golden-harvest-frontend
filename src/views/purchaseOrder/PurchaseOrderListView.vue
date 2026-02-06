<template>
  <div class="admin-container">
    <div class="breadcrumb">홈 / 주문 관리 / <strong>주문 등록 (발주)</strong></div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item flex-2">
          <label>상품 검색</label>
          <div class="search-input-wrapper">
            <img src="@/assets/search.svg" class="search-icon-svg" alt="search" />
            <input
                type="text"
                v-model="filters.keyword"
                placeholder="품목명 / 품목코드 / SKU 검색"
                @keyup.enter="applyFilters"
                class="search-input"
            />
          </div>
        </div>
        <div class="filter-item">
          <label>카테고리</label>
          <select class="basic-select" disabled>
            <option>전체</option>
          </select>
        </div>
        <div class="filter-item">
          <label>원산지</label>
          <select class="basic-select" disabled>
            <option>전체</option>
          </select>
        </div>
        <div class="filter-item">
          <label>거래처</label>
          <select class="basic-select" disabled>
            <option>전체</option>
          </select>
        </div>
        <button class="search-btn" @click="applyFilters">필터 적용</button>
      </div>
    </div>

    <div class="list-card">
      <div class="card-header">
        <img src="@/assets/master-list.svg" class="title-icon-svg" alt="master-list" />
        <h3>상품 발주 리스트</h3>
      </div>

      <div v-if="loading" class="state-msg">데이터를 불러오는 중입니다...</div>
      <div v-else-if="error" class="state-msg error">{{ error }}</div>

      <div v-else class="product-grid">
        <article class="card" v-for="item in visibleItems" :key="item.itemCode">
          <div class="thumb">
            <img :src="resolveImage(item)" :alt="item.itemName"/>
          </div>

          <div class="card-body">
            <div class="sku-code">코드: {{ item.itemCode }}</div>
            <div class="item-name">{{ item.itemName }}</div>

            <div class="sku-meta-box">
              <label class="meta-label">
                SKU 선택
                <span class="step-hint" v-if="detailOf(item)">
                  (단위: {{ formatQty(stepOf(item)) }}{{ baseUnitSuffix(item) }})
                </span>
              </label>
              <select class="basic-select sku-select" v-model="selectedSkuByItem[item.itemCode]">
                <option v-for="s in item.skus" :key="s.skuNo" :value="s.skuNo">
                  {{ s.skuNo }} · {{ s.gradeName }}
                </option>
              </select>
              <div class="badge-row">
                <span class="badge">{{ currentSku(item)?.gradeName }}</span>
                <span class="badge light">{{ currentSku(item)?.varietyName }}</span>
              </div>
            </div>

            <div class="price-info">
              <span class="label">도매 공급가</span>
              <div class="price-val">
                <template v-if="priceLoadingOf(item)">조회중...</template>
                <template v-else-if="latestPriceOf(item)">
                  <strong>{{ formatNumber(latestPriceOf(item).originPrice) }}</strong>원
                  <small>/ {{ latestPriceOf(item).unit }}</small>
                </template>
                <template v-else>-</template>
              </div>
            </div>

            <div class="qty-control-row">
              <span class="unit-pill">{{ baseUnitLabel(item) }}</span>
              <div class="stepper-group">
                <button class="step-btn" @click="decItem(item)">-</button>
                <div class="qty-display">{{ formatQty(qtyByItem[item.itemCode] ?? 0) }}{{ baseUnitSuffix(item) }}</div>
                <button class="step-btn" @click="incItem(item)">+</button>
              </div>
            </div>

            <button
                class="action-order-btn"
                :disabled="!selectedSkuByItem[item.itemCode] || (qtyByItem[item.itemCode] ?? 0) <= 0"
                @click="addToOrder(item)"
            >
              {{ (qtyByItem[item.itemCode] ?? 0) > 0 ? formatNumber(calculateTotalPrice(item)) + '원 발주' : '발주하기' }}
            </button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
/* 로직은 기존과 동일하므로 생략 (변동 사항 없음) */
import {computed, reactive, ref, watch, onMounted} from "vue";
import http from "@/api/axios.js";
import Swal from 'sweetalert2';

const filters = reactive({keyword: ""});
const loading = ref(false);
const error = ref("");
const items = ref([]);
const selectedSkuByItem = reactive({});
const qtyByItem = reactive({});
const skuDetailBySku = reactive({});
const skuLoadingBySku = reactive({});
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=60";

async function fetchMasterSkus() {
  loading.value = true;
  try {
    const res = await http.get("/master-data/items", { params: { itemName: filters.keyword || undefined } });
    const payload = res.data;
    if (!payload?.success) throw new Error(payload?.message || "오류");
    const map = new Map();
    for (const r of payload.data) {
      if (!map.has(r.itemCode)) {
        map.set(r.itemCode, { itemCode: r.itemCode, itemName: r.itemName, imageUrl: FALLBACK_IMAGE, skus: [] });
      }
      map.get(r.itemCode).skus.push({ skuNo: r.skuNo, gradeName: r.gradeName, varietyName: r.varietyName, active: String(r.status).toLowerCase() !== "false" });
    }
    items.value = Array.from(map.values());
    for (const it of items.value) {
      const firstActive = it.skus.find((s) => s.active) ?? it.skus[0];
      selectedSkuByItem[it.itemCode] = firstActive?.skuNo ?? "";
      qtyByItem[it.itemCode] ??= 0;
      if (selectedSkuByItem[it.itemCode]) fetchPriceDetail(selectedSkuByItem[it.itemCode]);
    }
  } catch (e) { error.value = e.message || "실패"; } finally { loading.value = false; }
}

async function fetchPriceDetail(skuNo) {
  if (!skuNo || skuDetailBySku[skuNo]) return;
  skuLoadingBySku[skuNo] = true;
  const res = await http.get(`/master-data/items/${encodeURIComponent(skuNo)}`);
  skuDetailBySku[skuNo] = res.data.data;
  skuLoadingBySku[skuNo] = false;
}

watch(() => ({...selectedSkuByItem}), (next) => { Object.values(next).forEach((skuNo) => { if (skuNo) fetchPriceDetail(skuNo); }); }, {deep: true});
onMounted(fetchMasterSkus);
function applyFilters() { fetchMasterSkus(); }
const visibleItems = computed(() => {
  const k = filters.keyword.trim().toLowerCase();
  if (!k) return items.value;
  return items.value.filter((it) => it.itemName?.toLowerCase().includes(k) || it.itemCode.toLowerCase().includes(k));
});
function currentSku(item) { return item.skus.find((s) => s.skuNo === selectedSkuByItem[item.itemCode]) ?? null; }
function detailOf(item) { return skuDetailBySku[selectedSkuByItem[item.itemCode]] || null; }
function priceLoadingOf(item) { return !!skuLoadingBySku[selectedSkuByItem[item.itemCode]]; }
function latestPriceOf(item) { return detailOf(item)?.originPrices?.[0] ?? null; }
function stepOf(item) {
  const priceData = latestPriceOf(item);
  if (!priceData || !priceData.unit) return 1;
  const match = priceData.unit.match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
}
function incItem(item) { qtyByItem[item.itemCode] = (qtyByItem[item.itemCode] ?? 0) + stepOf(item); }
function decItem(item) { qtyByItem[item.itemCode] = Math.max(0, (qtyByItem[item.itemCode] ?? 0) - stepOf(item)); }
function calculateTotalPrice(item) {
  const priceData = latestPriceOf(item);
  const qty = qtyByItem[item.itemCode] ?? 0;
  if (!priceData || qty <= 0) return 0;
  return (priceData.originPrice / stepOf(item)) * qty;
}
function baseUnitSuffix(item) { return detailOf(item)?.baseUnit ?? ""; }
function baseUnitLabel(item) { return detailOf(item)?.baseUnit ?? "단위"; }
function resolveImage(item) { return detailOf(item)?.fileUrl || item.imageUrl || FALLBACK_IMAGE; }
function formatNumber(n) { return new Intl.NumberFormat("ko-KR").format(n); }
function formatQty(v) { return String(v ?? 0); }
async function addToOrder(item) {
  const skuNo = selectedSkuByItem[item.itemCode];
  const quantity = qtyByItem[item.itemCode];
  try {
    const res = await http.post("/purchase", null, { params: { quantity, skuNo } });
    if (res.data.success) {
      Swal.fire({ title: '발주 완료', text: '성공적으로 처리되었습니다.', icon: 'success', confirmButtonColor: '#11D411', borderRadius: '16px' });
      qtyByItem[item.itemCode] = 0;
    }
  } catch (e) { Swal.fire({ title: '발주 실패', icon: 'error', confirmButtonColor: '#ef4444' }); }
}
</script>

<style scoped>
/* 관리자 공통 레이아웃 스타일 적용 */
.admin-container { padding: 20px 50px; background-color: #f8f9fb; min-height: 100vh; box-sizing: border-box; }
.breadcrumb { font-size: 14px; color: #888; margin-bottom: 20px; }

/* 필터 카드 (회원관리와 동일) */
.filter-card {
  background: #fff; padding: 30px; border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 30px; border: 1px solid #e0e0e0;
}
.filter-grid { display: flex; gap: 15px; align-items: flex-end; }
.filter-item { display: flex; flex-direction: column; gap: 10px; flex: 1; }
.filter-item.flex-2 { flex: 1.8; }
.filter-item label { font-size: 14px; font-weight: 700; color: #444; }

/* 1. 검색창 래퍼 */
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* 2. 검색 아이콘 (클래스명을 .search-icon-svg로 확실히 매칭) */
.search-icon-svg {
  position: absolute;
  left: 15px;      /* 왼쪽 벽에서 15px 안으로 */
  top: 50%;        /* 세로 중앙 */
  transform: translateY(-50%);
  width: 18px;     /* 아이콘 크기 고정 */
  height: 18px;
  z-index: 10;     /* 인풋박스 위로 올림 */
  pointer-events: none; /* 아이콘 클릭해도 인풋 포커스 되게 */
}

/* 3. 검색 인풋 */
.search-input {
  width: 100%;
  height: 45px;
  padding: 0 15px 0 45px !important; /* 왼쪽 패딩을 45px 줘서 텍스트가 아이콘 뒤로 안가게 함 */
  border: 1px solid #C8E4C8;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}

/* 4. 리스트 헤더 아이콘 크기 조절 */
.title-icon-svg {
  width: 22px;
  height: 22px;
  object-fit: contain;
}
.search-input-wrapper input, .basic-select {
  width: 100%; height: 45px; padding: 0 15px; border: 1px solid #C8E4C8;
  border-radius: 10px; background: white; font-size: 14px; outline: none; transition: all 0.2s; box-sizing: border-box;
}
.search-input-wrapper input { padding-left: 45px; }
.search-input-wrapper input:focus, .basic-select:focus {
  border-color: #11D411 !important; box-shadow: 0 0 0 3px rgba(17, 212, 17, 0.05);
}

.search-btn {
  background: #11D411; color: #fff; border: none; padding: 0 30px; height: 45px;
  border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s;
}
.search-btn:hover { background-color: #0fb80f; transform: scale(0.98); }

/* 리스트 카드 (회원관리의 list-card 스타일 적용) */
.list-card { background: #fff; border-radius: 20px; padding: 30px; border: 1px solid #e0e0e0; }
.card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 25px; }
.title-icon-box { font-size: 20px; }
.card-header h3 { font-size: 18px; font-weight: 700; margin: 0; }

.state-msg { padding: 40px; text-align: center; color: #888; }

/* 상품 그리드 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

/* 개별 상품 카드 */
.card {
  border-radius: 16px; border: 1px solid #eee; overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s; background: #fff;
}
.card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); }

.thumb { height: 180px; background: #f9f9f9; }
.thumb img { width: 100%; height: 100%; object-fit: cover; }

.card-body { padding: 20px; }
.sku-code { font-size: 12px; color: #aaa; margin-bottom: 4px; }
.item-name { font-size: 17px; font-weight: 800; color: #333; margin-bottom: 15px; }

.sku-meta-box { background: #f8f9fb; padding: 12px; border-radius: 12px; margin-bottom: 15px; }
.meta-label { font-size: 12px; font-weight: 700; color: #666; display: block; margin-bottom: 8px; }
.step-hint { font-weight: normal; color: #999; font-size: 11px; }
.sku-select { height: 38px !important; font-size: 13px !important; margin-bottom: 8px; }

.badge-row { display: flex; gap: 5px; }
.badge { background: #11D411; color: #fff; font-size: 11px; padding: 3px 8px; border-radius: 6px; font-weight: 700; }
.badge.light { background: #f1f3f5; color: #666; }

.price-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 0 5px; }
.price-info .label { font-size: 13px; font-weight: 700; color: #444; }
.price-val { font-size: 14px; color: #333; }
.price-val strong { font-size: 18px; color: #11D411; }

.qty-control-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.unit-pill { background: #333; color: #fff; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 700; }

.stepper-group { display: flex; align-items: center; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; }
.step-btn { width: 35px; height: 35px; border: none; background: #fff; cursor: pointer; font-size: 18px; font-weight: bold; }
.step-btn:hover { background: #f1f3f5; }
.qty-display { min-width: 80px; text-align: center; font-weight: 800; font-size: 14px; border-left: 1px solid #ddd; border-right: 1px solid #ddd; }

.action-order-btn {
  width: 100%; height: 45px; background: #11D411; color: #fff; border: none;
  border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; transition: 0.2s;
}
.action-order-btn:hover:not(:disabled) { background: #0fb80f; box-shadow: 0 4px 12px rgba(17, 212, 17, 0.2); }
.action-order-btn:disabled { background: #eee; color: #aaa; cursor: not-allowed; }
</style>