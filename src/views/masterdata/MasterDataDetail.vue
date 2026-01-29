<template>
  <section class="admin-page">
    <div class="page-header">
      <p class="desc">홈 / 마스터 관리 / 품목 상세 정보</p>
    </div>

    <div class="detail-layout">
      <div class="left-col">
        <div class="card image-section">
          <h3 class="card-title">품목 이미지</h3>
          <div class="img-wrapper">
            <img
                v-if="info?.fileUrl"
                :src="getFullImageUrl(info.fileUrl)"
                alt="품목 이미지"
                @error="handleImgError"
            />
            <div v-else class="no-img">
              <span>이미지 없음</span>
            </div>
          </div>
        </div>

        <div class="card price-section">
          <h3 class="card-title">최근 원가 내역 (7건)</h3>
          <div class="table-container">
            <table class="table">
              <thead>
              <tr>
                <th>등록일</th>
                <th class="text-right">원가</th>
                <th>단위</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(price, idx) in priceList" :key="idx">
                <td>{{ price.createdAt?.substring(0, 10) }}</td>
                <td class="text-right emphasize">{{ formatNumber(price.originPrice) }} 원</td>
                <td>{{ price.unit }}</td>
              </tr>
              <tr v-if="priceList.length === 0">
                <td colspan="3" class="empty-msg">등록된 원가 내역이 없습니다.</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="right-col">

        <div class="card basic-info-card">
          <div class="card-header-row">
            <h3 class="card-title">기본 정보</h3>
            <span :class="['status-badge', info?.isActive ? 'active' : 'inactive']">
              {{ info?.isActive ? '사용중' : '사용중지' }}
            </span>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <label>품목코드</label>
              <div class="value">{{ info?.itemCode }}</div>
            </div>
            <div class="info-item">
              <label>표준규격</label>
              <div class="value">
                {{ info?.packToKg ? `${info.packToKg}kg` : '' }} / {{ info?.baseUnit }}
              </div>
            </div>
            <div class="info-item">
              <label>품목명</label>
              <div class="value bold-text">{{ info?.itemName }}</div>
            </div>
            <div class="info-item">
              <label>품종명</label>
              <div class="value">{{ info?.varietyName }}</div>
            </div>
            <div class="info-item full">
              <label>설명</label>
              <div class="value multiline">{{ info?.description || '-' }}</div>
            </div>
          </div>
        </div>

        <div class="card detail-info-card">
          <h3 class="card-title">상세 정보</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>저장온도</label>
              <div class="value">
                {{ info?.storageTempMin }}℃ ~ {{ info?.storageTempMax }}℃
              </div>
            </div>
            <div class="info-item">
              <label>등급</label>
              <div class="value badge-style">{{ info?.grade }}</div>
            </div>
            <div class="info-item">
              <label>유통기한</label>
              <div class="value">
                {{ info?.shelfLifeDays ? `${info.shelfLifeDays}일` : '-' }}
              </div>
            </div>
            <div class="info-item">
              <label>원산지</label>
              <div class="value">{{ info?.country }}</div>
            </div>
            <div class="info-item">
              <label>등록일</label>
              <div class="value">{{ info?.createdAt?.substring(0, 10) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="footer-left">
        <BaseButton
            :class="info?.isActive ? 'btn-red' : 'btn-green'"
            @click="toggleStatus"
        >
          {{ info?.isActive ? '사용 중지' : '사용 전환' }}
        </BaseButton>
      </div>

      <div class="footer-right">
        <BaseButton class="btn-blue" @click="goToEdit">
          수정하기
        </BaseButton>
        <BaseButton class="btn-white" @click="$router.back()">
          목록으로
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import http from '@/api/axios'
import BaseButton from '@/components/button/BaseButton.vue'

// (기존 인터페이스 및 변수, 함수들 그대로 유지...)
interface OriginPriceData {
  originPrice: number
  unit: string
  createdAt: string
}

interface MasterDetailData {
  skuNo: string
  itemCode: string
  itemName: string
  varietyName: string
  baseUnit: string
  packToKg: number
  grade: string
  country: string
  isActive: boolean
  createdAt: string
  description: string
  shelfLifeDays: number
  storageTempMin: number
  storageTempMax: number
  fileUrl: string | null
  originPrices?: OriginPriceData[]
}

const route = useRoute()
const router = useRouter()
const info = ref<MasterDetailData | null>(null)
const priceList = ref<OriginPriceData[]>([])

const BACKEND_URL = 'http://localhost:8088'

const formatNumber = (val: number) => val ? val.toLocaleString() : '0'

const getFullImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${BACKEND_URL}${url}`
}

const handleImgError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = '/assets/no-image.png'
}

const fetchDetail = async () => {
  const skuNo = route.params.skuNo as string
  console.log('[DETAIL] skuNo:', skuNo)

  if (!skuNo) return

  try {
    const res = await http.get(`/master-data/items/${skuNo}`)
    console.log('[DETAIL] raw response:', res)

    const data = res.data?.data || res.data
    console.log('[DETAIL] parsed data:', data)

    if (data) {
      info.value = data
      priceList.value = data.originPrices || []

      console.log('[DETAIL] info.fileUrl:', info.value.fileUrl)

      if (info.value.fileUrl) {
        console.log(
            '[DETAIL] full image url:',
            getFullImageUrl(info.value.fileUrl)
        )
      }
    }
  } catch (err) {
    console.error('[DETAIL] 상세 정보 조회 실패:', err)
  }
}

const goToEdit = () => {
  if (info.value?.skuNo) {
    router.push(`/admin/masterData/edit/${info.value.skuNo}`)
  }
}

const toggleStatus = async () => {
  if (!info.value) return
  const actionName = info.value.isActive ? '중지' : '사용'
  if (!confirm(`해당 품목을 ${actionName} 상태로 변경하시겠습니까?`)) return

  try {
    await http.put(`/master-data/${info.value.itemCode}/status`, {
      isActive: !info.value.isActive
    })
    info.value.isActive = !info.value.isActive
    alert('상태가 변경되었습니다.')
  } catch (err) {
    console.error('상태 변경 실패:', err)
    alert('상태 변경 중 오류가 발생했습니다.')
  }
}

onMounted(fetchDetail)
</script>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1200px;
}

.page-header {
  display: flex;
  margin-bottom: 8px;
}

.desc {
  font-size: 13px;
  color: #6b7280;
}

.detail-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
}

.left-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f3f4f6;
}

.image-section {
}

.img-wrapper {
  width: 100%;
  aspect-ratio: 1/1;
  background-color: #f9fafb;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
  align-items: center;
}

.img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-img {
  color: #9ca3af;
  font-size: 14px;
}

.price-section {
  flex-grow: 1; /* 남는 공간 채우기 */
  display: flex;
  flex-direction: column;
}

.table-container {
  flex: 1;
}

.basic-info-card {
}

.detail-info-card {
  flex-grow: 1;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.table th {
  background: #f9fafb;
  padding: 8px 12px;
  text-align: left;
  color: #6b7280;
  font-weight: 600;
}

.table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}

.text-right {
  text-align: right;
}

.emphasize {
  font-weight: 600;
}

.empty-msg {
  text-align: center;
  color: #9ca3af;
  padding: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px 40px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item.full {
  grid-column: span 2;
}

.info-item label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.info-item .value {
  font-size: 15px;
  color: #111827;
  min-height: 24px;
  display: flex;
  align-items: center;
}

.info-item .value.multiline {
  line-height: 1.6;
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #f3f4f6;
}

.bold-text {
  font-weight: 700;
  font-size: 16px;
}

.badge-style {
  background-color: #dcfce7;
  color: #166534;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.status-badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.status-badge.active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background-color: #f3f4f6;
  color: #4b5563;
}

.page-footer {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  margin-top: 20px;
}

.footer-left {
  display: flex;
  justify-content: flex-start;
}

.footer-right {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 버튼 */
.btn-white {
  background: #fff;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-white:hover {
  background-color: #f9fafb;
}

.btn-blue {
  background: #10b981;
  border: 1px solid #10b981;
  color: #fff;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-blue:hover {
  background: #1d4ed8;
}

.btn-red {
  background: #ef4444;
  border: 1px solid #ef4444;
  color: #fff;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-red:hover {
  background: #dc2626;
}

.btn-green {
  background: #10b981;
  border: 1px solid #10b981;
  color: #fff;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-green:hover {
  background: #059669;
}
</style>