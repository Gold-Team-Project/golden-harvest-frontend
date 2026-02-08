<template>
  <div class="admin-container">
    <div class="breadcrumb">홈 / 마스터 관리 / <strong>품목 리스트</strong></div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item flex-2">
          <label>품목명</label>
          <div class="search-input-wrapper">
            <img src="@/assets/search.svg" class="search-icon-svg" alt="search" />
            <input
                type="text"
                placeholder="품목명 검색"
                v-model="search.itemName"
                @keyup.enter="fetchItems"
            />
          </div>
        </div>
        <div class="filter-item">
          <label>품종명</label>
          <input
              type="text"
              placeholder="품종명 입력"
              v-model="search.varietyName"
              class="basic-input"
          />
        </div>
        <div class="filter-item">
          <label>등급</label>
          <input
              type="text"
              placeholder="등급 입력"
              v-model="search.grade"
              class="basic-input"
          />
        </div>
        <div class="filter-item">
          <label>상태</label>
          <select v-model="search.status" class="basic-select">
            <option value="">상태 전체</option>
            <option :value="true">활성화</option>
            <option :value="false">비활성화</option>
          </select>
        </div>
        <button class="search-btn" @click="fetchItems">검색</button>
      </div>
    </div>

    <div class="list-card">
      <div class="card-header">
        <img src="@/assets/master-list.svg" class="title-icon-svg" alt="list" />
        <h3>품목 내역 목록</h3>
      </div>

      <div class="table-container">
        <table class="admin-table">
          <thead>
          <tr>
            <th style="width: 8%">No</th>
            <th style="width: 20%">품목명</th>
            <th style="width: 18%">품종명</th>
            <th style="width: 12%">등급</th>
            <th style="width: 15%">상태</th>
            <th style="width: 15%">등록일</th>
            <th style="width: 12%">관리</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in items" :key="item.skuNo">
            <td>{{ item.no }}</td>
            <td class="text-left"><strong>{{ item.itemName }}</strong></td>
            <td>{{ item.varietyName }}</td>
            <td>{{ item.grade }}</td>
            <td>
              <span :class="['status-badge', item.isActive ? 'ACTIVE' : 'INACTIVE']">
                {{ item.isActive ? '활성화' : '비활성화' }}
              </span>
            </td>
            <td>{{ item.createdAt }}</td>
            <td>
              <button class="detail-btn" @click="goDetail(item.skuNo)">상세보기</button>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td colspan="7" style="padding: 50px; color: #999; text-align: center;">품목 데이터가 없습니다.</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-wrapper">
        <div class="pagination">
          <button
              class="arrow"
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
          >&lt;</button>

          <button
              v-for="p in pages"
              :key="p"
              :class="['page', { active: currentPage === p }]"
              @click="changePage(p)"
          >
            {{ p }}
          </button>

          <button
              class="arrow"
              :disabled="items.length < pageSize"
              @click="changePage(currentPage + 1)"
          >&gt;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/api/axios'

interface MasterItem {
  no: number
  skuNo: string
  itemName: string
  varietyName: string
  grade: string
  isActive: boolean
  createdAt: string
}

const router = useRouter()
const items = ref<MasterItem[]>([])
const currentPage = ref(1)
const pages = ref<number[]>([])
const pageSize = 7

const search = ref({
  itemName: '',
  varietyName: '',
  grade: '',
  status: '' as '' | boolean,
})

const goDetail = (skuNo: string) => {
  router.push({
    name: 'adminMasterDataDetail',
    params: { skuNo }
  })
}

const fetchItems = async () => {
  try {
    const res = await http.get('/master-data/items', {
      params: {
        page: currentPage.value,
        size: pageSize,
        itemName: search.value.itemName || undefined,
        varietyName: search.value.varietyName || undefined,
        grade: search.value.grade || undefined,
        status: search.value.status === '' ? undefined : search.value.status,
      },
    })

    const payload = res.data?.data?.content ?? res.data?.data ?? []

    items.value = payload.map((item: any, index: number) => {
      // [완벽 통일] 문자열 "true" 및 다양한 활성 신호를 처리
      const rawValue = item.status !== undefined ? item.status : item.isActive;
      const normalizedValue = String(rawValue).toLowerCase();

      // 상세 페이지와 100% 동일한 판단 로직
      const isActuallyActive = (
          normalizedValue === 'true' ||
          normalizedValue === 'y' ||
          normalizedValue === 'active' ||
          rawValue === 1 ||
          rawValue === true
      );

      return {
        no: (currentPage.value - 1) * pageSize + index + 1,
        skuNo: item.skuNo,
        itemName: item.itemName,
        varietyName: item.varietyName,
        grade: item.gradeName || item.grade,
        isActive: isActuallyActive,
        createdAt: item.createdAt?.substring(0, 10),
      }
    })

    makePages(payload.length)
  } catch (err) {
    console.error("데이터 로드 실패:", err)
  }
}

const makePages = (size: number) => {
  const temp: number[] = []
  if (currentPage.value > 1) temp.push(currentPage.value - 1)
  temp.push(currentPage.value)
  if (size === pageSize) temp.push(currentPage.value + 1)
  pages.value = temp
}

const changePage = (page: number) => {
  if (page < 1) return
  currentPage.value = page
}

watch(currentPage, fetchItems)
onMounted(fetchItems)
</script>

<style scoped>
/* 스타일은 기존과 동일 */
.admin-container { padding: 20px 50px; background-color: #f8f9fb; min-height: 95vh; box-sizing: border-box; display: flex; flex-direction: column; }
.breadcrumb { font-size: 14px; color: #888; margin-bottom: 20px; flex-shrink: 0; }
.filter-card { background: #fff; padding: 25px 30px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 25px; border: 1px solid #e0e0e0; flex-shrink: 0; }
.filter-grid { display: flex; gap: 15px; align-items: flex-end; }
.filter-item { display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 0; }
.filter-item.flex-2 { flex: 1.5; }
.filter-item label { font-size: 14px; font-weight: 700; color: #444; }
.search-input-wrapper { position: relative; width: 100%; }
.search-icon-svg { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); width: 18px; }
.search-input-wrapper input, .basic-input, .basic-select { width: 100%; height: 45px; padding: 0 15px; border: 1px solid #C8E4C8; border-radius: 10px; background: white; font-size: 14px; outline: none; transition: all 0.2s; box-sizing: border-box; }
.search-input-wrapper input { padding-left: 45px; }
.search-input-wrapper input:focus, .basic-input:focus, .basic-select:focus { border-color: #11D411 !important; box-shadow: 0 0 0 3px rgba(17, 212, 17, 0.05); }
.search-btn { background: #11D411; color: #fff; border: none; padding: 0 35px; height: 45px; border-radius: 10px; font-weight: 700; cursor: pointer; flex-shrink: 0; }
.search-btn:hover { background-color: #0fb80f; }
.list-card { background: #fff; border-radius: 20px; padding: 25px 30px; border: 1px solid #e0e0e0; flex: 1; display: flex; flex-direction: column; }
.card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.title-icon-svg { width: 22px; }
.table-container { flex: 1; overflow-y: auto; width: 100%; }
.admin-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.admin-table th { padding: 15px; text-align: center; color: #888; border-bottom: 2px solid #f4f4f4; font-size: 14px; background: #fff; position: sticky; top: 0; }
.admin-table td { padding: 15px 10px; font-size: 14px; border-bottom: 1px solid #f9f9f9; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.admin-table td.text-left { text-align: left; }
.status-badge { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; }
.status-badge.ACTIVE { background: #eefdee; color: #11D411; border: 1px solid #11D411; }
.status-badge.INACTIVE { background: #fff8ee; color: #f39c12; border: 1px solid #f39c12; }
.detail-btn { background: #f1f3f5; border: 1px solid #dee2e6; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; }
.detail-btn:hover { background: #e9ecef; }
.pagination-wrapper { margin-top: auto; padding-top: 20px; flex-shrink: 0; }
.pagination { display: flex; justify-content: center; gap: 5px; }
.page, .arrow { min-width: 32px; height: 32px; border-radius: 6px; border: 1px solid #eee; background: transparent; cursor: pointer; font-size: 13px; }
.page.active { background: #11D411; color: #fff; border-color: #11D411; font-weight: 700; }
.arrow:disabled { cursor: not-allowed; opacity: 0.5; }
</style>