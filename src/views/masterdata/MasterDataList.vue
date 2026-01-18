<template>
  <section class="admin-page">
    <div class="page-header">
      <p class="desc">홈 / 마스터 관리 / 품목 리스트</p>
    </div>

    <div class="search-card">
      <div class="search-row">
        <div class="field">
          <input v-model="search.itemName" placeholder="품목명"/>
        </div>
        <div class="field">
          <input v-model="search.varietyName" placeholder="품종명"/>
        </div>
        <div class="field">
          <input v-model="search.grade" placeholder="등급"/>
        </div>
        <div class="field">
          <select v-model="search.status">
            <option value="">상태 전체</option>
            <option :value="true">활성화</option>
            <option :value="false">비활성화</option>
          </select>
        </div>
        <BaseButton class="btn-search" @click="fetchItems">
          검색
        </BaseButton>
      </div>
    </div>

    <div class="card">
      <table class="table">
        <thead>
        <tr>
          <th>No</th>
          <th>품목명</th>
          <th>품종명</th>
          <th>등급</th>
          <th>상태</th>
          <th>등록일</th>
          <th>관리</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in items" :key="item.skuNo">
          <td>{{ item.no }}</td>
          <td class="title">{{ item.itemName }}</td>
          <td>{{ item.varietyName }}</td>
          <td>{{ item.grade }}</td>
          <td>
            <StatusBadge :class="item.isActive ? 'status-done' : 'status-wait'">
              {{ item.isActive ? '활성화' : '비활성화' }}
            </StatusBadge>
          </td>
          <td>{{ item.createdAt }}</td>
          <td>
            <BaseButton class="btn-soft" @click="goDetail(item.skuNo)">
              상세보기
            </BaseButton>
          </td>
        </tr>
        <tr v-if="items.length === 0">
          <td colspan="7">품목 데이터가 없습니다.</td>
        </tr>
        </tbody>
      </table>

      <Pagination
          :pages="pages"
          :current="currentPage"
          @update:current="changePage"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import {useRouter} from 'vue-router'
import http from '@/api/axios'

import Pagination from '@/components/pagination/Pagination.vue'
import StatusBadge from '@/components/status/StatusBadge.vue'
import BaseButton from '@/components/button/BaseButton.vue'

/* 타입 정의 */
interface MasterItem {
  no: number
  skuNo: string
  itemCode: string
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
const pageSize = 10

const search = ref({
  itemName: '',
  itemCode: '',
  varietyName: '',
  grade: '',
  status: '' as '' | boolean,
})

const goDetail = (skuNo: string) => {
  router.push({
    name: 'adminMasterDataDetail',
    params: {skuNo}
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
        itemCode: search.value.itemCode || undefined,
        grade: search.value.grade || undefined,
        status: search.value.status === '' ? undefined : search.value.status,
      },
    })

    const payload = res.data?.data?.content ?? res.data?.data ?? []
    console.log(payload)
    items.value = payload.map((item: any, index: number) => ({
      no: (currentPage.value - 1) * pageSize + index + 1,
      skuNo: item.skuNo,
      varietyName: item.varietyName,
      itemName: item.itemName,
      grade: item.gradeName,
      isActive: item.status === true
          || item.status === 'true'
          || item.status === 'TRUE'
          || item.status === 'Y'
          || item.status === 1,

      createdAt: item.createdAt?.substring(0, 10),
    }))

    makePages(payload.length)
  } catch (err) {
    console.error(err)
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
  if (page === currentPage.value) return
  currentPage.value = page
}

watch(currentPage, fetchItems)
onMounted(fetchItems)
</script>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.desc {
  font-size: 13px;
  color: #6b7280;
}

.page-header {
  margin-bottom: 8px;
}

.search-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
}

.search-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.field {
  flex: 1;
}

.search-row input, .search-row select {
  width: 100%;
  height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0 12px;
  box-sizing: border-box;
}

.btn-search {
  height: 40px;
  padding: 0 20px;
  background: #22c55e;
  color: #fff;
  white-space: nowrap;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
}

.title {
  text-align: left;
}

.status-done {
  background: #dcfce7;
  color: #15803d;
}

.status-wait {
  background: #fef3c7;
  color: #b45309;
}

.btn-soft {
  background: #22c55e;
  color: #fff;
}
</style>