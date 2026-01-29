<template>
  <div class="page">
    <div class="breadcrumb">홈 / 주문 관리 / 주문 등록 / 주문 상세</div>

    <!-- Filter (API에 없는 항목은 임시 비활성) -->
    <section class="filter-wrap" aria-label="상품 필터">
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">카테고리</label>
          <select class="select" disabled>
            <option>전체</option>
          </select>
        </div>

        <div class="filter-item">
          <label class="filter-label">원산지</label>
          <select class="select" disabled>
            <option>전체</option>
          </select>
        </div>

        <div class="filter-item">
          <label class="filter-label">거래처</label>
          <select class="select" disabled>
            <option>전체</option>
          </select>
        </div>

        <div class="filter-item search">
          <label class="filter-label">검색</label>
          <div class="search-box">
            <span class="search-icon" aria-hidden="true">🔍</span>
            <input
                class="input"
                v-model="filters.keyword"
                placeholder="품목명/품목코드/SKU/등급/품종으로 검색"
                @keyup.enter="applyFilters"
            />
          </div>
        </div>

        <button class="apply-btn" type="button" @click="applyFilters">
          필터 적용
        </button>
      </div>
    </section>

    <section class="grid-wrap" aria-label="상품 리스트">
      <div v-if="loading" class="state">불러오는 중...</div>
      <div v-else-if="error" class="state error">{{ error }}</div>

      <div v-else class="product-grid">
        <article class="card" v-for="item in visibleItems" :key="item.itemCode">
          <div class="thumb">
            <img :src="resolveImage(item)" :alt="item.itemName" />
          </div>

          <div class="card-body">
            <div class="sku">품목코드: {{ item.itemCode }}</div>
            <div class="name">{{ item.itemName }}</div>

            <div class="meta one">
              <div class="meta-col">
                <div class="meta-label">
                  SKU 선택
                  <span class="muted" v-if="detailOf(item)">
                    · 증가 단위: {{ formatQty(stepOf(item)) }}{{ baseUnitSuffix(item) }}
                  </span>
                </div>

                <select
                    class="select sku-select"
                    v-model="selectedSkuByItem[item.itemCode]"
                >
                  <option
                      v-for="s in item.skus"
                      :key="s.skuNo"
                      :value="s.skuNo"
                  >
                    {{ s.skuNo }} · {{ s.gradeName }} · {{ s.varietyName }}
                  </option>
                </select>

                <div class="sku-desc">
                  <span class="badge">{{ currentSku(item)?.gradeName }}</span>
                  <span class="badge light">{{ currentSku(item)?.varietyName }}</span>
                  <span class="badge light" v-if="detailOf(item)?.country">
                    {{ detailOf(item)?.country }}
                  </span>
                </div>
              </div>
            </div>

            <div class="price-row">
              <div class="price-label">도매 공급가</div>
              <div class="price">
                <span v-if="priceLoadingOf(item)" class="muted">조회중…</span>
                <span v-else-if="latestPriceOf(item)">
                  {{ formatNumber(latestPriceOf(item).originPrice) }}
                  <span class="muted"> / {{ latestPriceOf(item).unit }}</span>
                </span>
                <span v-else class="muted">-</span>
              </div>
            </div>

            <div class="qty-row">
              <button class="pill" type="button">
                {{ baseUnitLabel(item) }}
              </button>

              <div class="stepper">
                <button class="step-btn" type="button" @click="decItem(item)">-</button>
                <div class="step-value">
                  {{ formatQty(qtyByItem[item.itemCode] ?? 0) }}{{ baseUnitSuffix(item) }}
                </div>
                <button class="step-btn" type="button" @click="incItem(item)">+</button>
              </div>
            </div>

            <button
                class="order-btn"
                type="button"
                :disabled="!selectedSkuByItem[item.itemCode]"
                @click="addToOrder(item)"
            >
              발주하기
            </button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch, onMounted } from "vue";
import http from "@/api/axios.js";

/* ===========================
   상태
=========================== */
const filters = reactive({ keyword: "" });
const loading = ref(false);
const error = ref("");

const items = ref([]);
const selectedSkuByItem = reactive({});
const qtyByItem = reactive({});
const skuDetailBySku = reactive({});
const skuLoadingBySku = reactive({});

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=60";

/* ===========================
   API (여기만 수정됨)
=========================== */
async function fetchMasterSkus() {
  loading.value = true;
  error.value = "";

  try {
    const res = await http.get("/master-data/items", {
      params: {
        itemName: filters.keyword || undefined,
      },
    });

    const payload = res.data;
    if (!payload?.success) {
      throw new Error(payload?.message || "마스터 리스트 API 오류");
    }

    // payload.data = 배열
    const rows = Array.isArray(payload.data) ? payload.data : [];

    const map = new Map();
    for (const r of rows) {
      if (!map.has(r.itemCode)) {
        map.set(r.itemCode, {
          itemCode: r.itemCode,
          itemName: r.itemName,
          imageUrl: FALLBACK_IMAGE,
          skus: [],
        });
      }
      map.get(r.itemCode).skus.push({
        skuNo: r.skuNo,
        gradeName: r.gradeName,
        varietyName: r.varietyName,
        active: String(r.status).toLowerCase() !== "false",
      });
    }

    items.value = Array.from(map.values());

    for (const it of items.value) {
      const firstActive = it.skus.find((s) => s.active) ?? it.skus[0];
      selectedSkuByItem[it.itemCode] = firstActive?.skuNo ?? "";
      qtyByItem[it.itemCode] ??= 0;

      if (selectedSkuByItem[it.itemCode]) {
        fetchPriceDetail(selectedSkuByItem[it.itemCode]);
      }
    }
  } catch (e) {
    error.value = e.message || "데이터 로딩 실패";
  } finally {
    loading.value = false;
  }
}

async function fetchPriceDetail(skuNo) {
  if (!skuNo || skuDetailBySku[skuNo]) return;

  skuLoadingBySku[skuNo] = true;
  const res = await http.get(`/master-data/items/${encodeURIComponent(skuNo)}`);
  skuDetailBySku[skuNo] = res.data.data;
  skuLoadingBySku[skuNo] = false;
}

/* ===========================
   기존 로직 (변경 없음)
=========================== */
watch(
    () => ({ ...selectedSkuByItem }),
    (next) => {
      Object.values(next).forEach((skuNo) => {
        if (skuNo) fetchPriceDetail(skuNo);
      });
    },
    { deep: true }
);

onMounted(fetchMasterSkus);

function applyFilters() {
  fetchMasterSkus();
}

const visibleItems = computed(() => {
  const k = filters.keyword.trim().toLowerCase();
  if (!k) return items.value;

  return items.value.filter((it) => {
    const hitItem =
        it.itemName?.toLowerCase().includes(k) ||
        it.itemCode.toLowerCase().includes(k);

    const hitSku = it.skus.some(
        (s) =>
            s.skuNo.toLowerCase().includes(k) ||
            (s.gradeName ?? "").toLowerCase().includes(k) ||
            (s.varietyName ?? "").toLowerCase().includes(k)
    );

    return hitItem || hitSku;
  });
});

/* 이하 전부 원본 그대로 */
function currentSku(item) {
  const skuNo = selectedSkuByItem[item.itemCode];
  return item.skus.find((s) => s.skuNo === skuNo) ?? null;
}
function detailOf(item) {
  const skuNo = selectedSkuByItem[item.itemCode];
  return skuNo ? skuDetailBySku[skuNo] : null;
}
function priceLoadingOf(item) {
  const skuNo = selectedSkuByItem[item.itemCode];
  return !!(skuNo && skuLoadingBySku[skuNo]);
}
function latestPriceOf(item) {
  const d = detailOf(item);
  return d?.originPrices?.[0] ?? null;
}
function stepOf() { return 1; }
function incItem(item) {
  qtyByItem[item.itemCode] = (qtyByItem[item.itemCode] ?? 0) + 1;
}
function decItem(item) {
  qtyByItem[item.itemCode] = Math.max(0, (qtyByItem[item.itemCode] ?? 0) - 1);
}
function baseUnitSuffix(item) {
  return detailOf(item)?.baseUnit ?? "";
}
function baseUnitLabel(item) {
  return detailOf(item)?.baseUnit ?? "단위 미정";
}
function resolveImage(item) {
  return detailOf(item)?.fileUrl || item.imageUrl || FALLBACK_IMAGE;
}
function formatNumber(n) {
  return new Intl.NumberFormat("ko-KR").format(n);
}
function formatQty(v) {
  return String(v ?? 0);
}
function addToOrder(item) {
  console.log("addToOrder", item);
}
</script>


<style scoped>
/* (스타일은 이전과 동일) */
.page { padding: 18px 22px 40px; background: #fff; }
.breadcrumb { font-size: 13px; color: #6b7280; margin-bottom: 14px; }
.filter-wrap { border: 2px dashed rgba(59,130,246,.35); border-radius: 10px; padding: 14px; margin-bottom: 18px; }
.filter-row { display:flex; gap:12px; align-items:flex-end; flex-wrap:wrap; }
.filter-item { display:flex; flex-direction:column; gap:6px; min-width:160px; }
.filter-item.search { flex:1; min-width:260px; }
.filter-label { font-size:12px; color:#6b7280; }
.select,.input { height:42px; border-radius:10px; border:1px solid #e5e7eb; padding:0 12px; outline:none; background:#fff; }
.select:disabled { background:#f3f4f6; color:#9ca3af; }
.search-box { position:relative; }
.search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); opacity:.6; font-size:14px; }
.search-box .input { width:100%; padding-left:34px; }
.apply-btn { height:42px; padding:0 16px; border-radius:10px; border:none; background:#16a34a; color:#fff; font-weight:700; cursor:pointer; white-space:nowrap; }

.grid-wrap { border:2px dashed rgba(59,130,246,.35); border-radius:10px; padding:14px; }
.state { padding:16px; color:#6b7280; }
.state.error { color:#ef4444; }

.product-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:18px; }
@media (max-width:1200px){ .product-grid{ grid-template-columns:repeat(3,minmax(0,1fr)); } }
@media (max-width:900px){ .product-grid{ grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (max-width:560px){ .product-grid{ grid-template-columns:repeat(1,minmax(0,1fr)); } }

.card { border-radius:14px; border:1px solid #eef2f7; background:#fff; overflow:hidden; box-shadow:0 1px 0 rgba(0,0,0,.02); }
.thumb { height:170px; background:#f3f4f6; }
.thumb img { width:100%; height:100%; object-fit:cover; }
.card-body { padding:12px 12px 14px; }
.sku { font-size:12px; color:#6b7280; margin-bottom:4px; }
.name { font-size:16px; font-weight:800; margin-bottom:10px; }

.meta { padding:10px; border-radius:10px; background:#f6f7fb; margin-bottom:10px; }
.meta-label { font-size:12px; color:#6b7280; margin-bottom:6px; }
.sku-select { width:100%; height:38px; border-radius:10px; }

.sku-desc { display:flex; gap:6px; margin-top:8px; flex-wrap:wrap; }
.badge { font-size:12px; font-weight:800; border:1px solid #111827; padding:4px 8px; border-radius:999px; background:#fff; }
.badge.light { border-color:#cbd5e1; color:#334155; }

.price-row { display:flex; justify-content:space-between; align-items:center; padding:10px 2px 12px; border-bottom:1px solid #eef2f7; margin-bottom:12px; }
.price-label { font-size:13px; font-weight:700; color:#111827; }
.price { font-size:14px; font-weight:800; }
.muted { color:#9ca3af; font-weight:700; }

.qty-row { display:flex; justify-content:space-between; gap:10px; align-items:center; margin-bottom:10px; }
.pill { height:34px; padding:0 12px; border-radius:10px; border:1px solid #111827; background:#fff; font-weight:700; font-size:12px; white-space:nowrap; }

.stepper { display:inline-flex; align-items:center; border:1px solid #111827; border-radius:10px; overflow:hidden; height:34px; }
.step-btn { width:34px; height:34px; border:none; background:#fff; cursor:pointer; font-size:16px; font-weight:800; }
.step-value { min-width:90px; text-align:center; font-weight:800; font-size:12px; padding:0 10px; }

.order-btn { width:100%; height:40px; border-radius:10px; border:1px solid #111827; background:#93a7f7; color:#111827; font-weight:800; cursor:pointer; }
.order-btn:disabled { cursor:not-allowed; opacity:.6; }
</style>
