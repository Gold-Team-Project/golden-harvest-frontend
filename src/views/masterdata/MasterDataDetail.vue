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
            <span v-if="info" :class="['status-badge', info.isActive ? 'active' : 'inactive']">
              {{ info.isActive ? '사용중' : '사용중지' }}
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
            v-if="info"
            :class="info.isActive ? 'btn-stop' : 'btn-use'"
            @click="toggleStatus"
        >
          {{ info.isActive ? '사용 중지' : '사용 전환' }}
        </BaseButton>
      </div>

      <div class="footer-right">
        <BaseButton class="btn-edit" @click="goToEdit">
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '@/api/axios'
import BaseButton from '@/components/button/BaseButton.vue'
import Swal from 'sweetalert2'

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
  if (!skuNo) return

  try {
    const res = await http.get(`/master-data/items/${skuNo}`)
    const data = res.data?.data || res.data

    if (data) {
      // [핵심 수정] 서버에서 오는 "true" (문자열)를 논리값 true로 변환
      const rawStatus = String(data.status || data.isActive).toLowerCase()
      const isActuallyActive = (rawStatus === 'true' || rawStatus === 'y' || data.status === 1 || data.status === true)

      info.value = {
        ...data,
        isActive: isActuallyActive
      }

      priceList.value = data.originPrices || []
      console.log("상세 페이지 변환된 상태(isActive):", info.value.isActive)
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

  const isCurrentlyActive = info.value.isActive
  const actionName = isCurrentlyActive ? '중지' : '사용'
  const beforeStatusText = isCurrentlyActive ? '사용중' : '사용중지'
  const afterStatusText = isCurrentlyActive ? '사용중지' : '사용중'
  const confirmColor = isCurrentlyActive ? '#ef4444' : '#11D411'

  const result = await Swal.fire({
    title: `상태를 ${actionName}하시겠습니까?`,
    text: `품목 상태가 [${beforeStatusText}]에서 [${afterStatusText}] 상태로 변경됩니다.`,
    icon: isCurrentlyActive ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonColor: confirmColor,
    cancelButtonColor: '#9ca3af',
    confirmButtonText: `네, ${actionName}합니다`,
    cancelButtonText: '취소',
    reverseButtons: true,
    borderRadius: '16px'
  })

  if (!result.isConfirmed) return

  try {
    const nextActiveState = !isCurrentlyActive

    // API 전송 시 백엔드가 문자열 "true"/"false"를 원할 수도 있으므로 맞춰서 전송 가능
    await http.put(`/master-data/${info.value.itemCode}/status`, {
      isActive: nextActiveState
    })

    info.value.isActive = nextActiveState

    Swal.fire({
      title: '변경 완료',
      text: `해당 품목이 ${afterStatusText} 상태로 전환되었습니다.`,
      icon: 'success',
      confirmButtonColor: '#11D411',
      timer: 1500,
      showConfirmButton: false,
      borderRadius: '16px'
    })
  } catch (err) {
    console.error('상태 변경 실패:', err)
    Swal.fire({
      title: '변경 실패',
      text: '상태 변경 중 오류가 발생했습니다.',
      icon: 'error',
      confirmButtonColor: '#ef4444',
      borderRadius: '16px'
    })
  }
}

onMounted(fetchDetail)
</script>

<style scoped>
/* 스타일은 기존과 동일하므로 생략 가능하나 유지를 위해 남겨둠 */
.admin-page { display: flex; flex-direction: column; gap: 16px; max-width: 1200px; padding-bottom: 40px; }
.page-header { display: flex; margin-bottom: 8px; }
.desc { font-size: 13px; color: #6b7280; }
.detail-layout { display: grid; grid-template-columns: 320px 1fr; gap: 20px; }
.left-col { display: flex; flex-direction: column; gap: 20px; }
.right-col { display: flex; flex-direction: column; gap: 20px; }
.card { background: #fff; border-radius: 8px; padding: 24px; border: 1px solid #f3f4f6; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
.card-title { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #f3f4f6; }
.img-wrapper { width: 100%; aspect-ratio: 1/1; background-color: #f9fafb; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; display: flex; justify-content: center; align-items: center; }
.img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.no-img { color: #9ca3af; font-size: 14px; }
.price-section { flex-grow: 1; display: flex; flex-direction: column; }
.table-container { flex: 1; }
.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table th { background: #f9fafb; padding: 8px 12px; text-align: left; color: #6b7280; font-weight: 600; }
.table td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #374151; }
.text-right { text-align: right; }
.emphasize { font-weight: 600; }
.empty-msg { text-align: center; color: #9ca3af; padding: 20px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px 40px; }
.info-item { display: flex; flex-direction: column; gap: 6px; }
.info-item.full { grid-column: span 2; }
.info-item label { font-size: 13px; color: #6b7280; font-weight: 500; }
.info-item .value { font-size: 15px; color: #111827; min-height: 24px; display: flex; align-items: center; }
.info-item .value.multiline { line-height: 1.6; background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #f3f4f6; }
.bold-text { font-weight: 700; font-size: 16px; }
.badge-style { background-color: #dcfce7; color: #166534; padding: 2px 10px; border-radius: 9999px; font-size: 13px; font-weight: 600; }
.card-header-row { display: flex; justify-content: space-between; align-items: flex-start; }
.status-badge { font-size: 15px; padding: 4px 8px; border-radius: 20px; font-weight: 600; }
.status-badge.active { background-color: #d1fae5; color: #065f46; }
.status-badge.inactive { background-color: #f3f4f6; color: #4b5563; }
.page-footer { display: grid; grid-template-columns: 320px 1fr; gap: 20px; margin-top: 20px; }
.footer-left { display: flex; justify-content: flex-start; }
.footer-right { display: flex; justify-content: flex-end; gap: 8px; }
.btn-white { background: #fff; border: 1px solid #d1d5db; color: #374151; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-white:hover { background-color: #f9fafb; }
.btn-edit { background: #11D411; border: 1px solid #11D411; color: #fff; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-edit:hover { background-color: #0fb80f; }
.btn-edit:active { transform: scale(0.98); }
.btn-stop { background: #ef4444; border: 1px solid #ef4444; color: #fff; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-stop:hover { background: #dc2626; }
.btn-stop:active { transform: scale(0.98); }
.btn-use { background: #11D411; border: 1px solid #11D411; color: #fff; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-use:hover { background-color: #0fb80f; }
.btn-use:active { transform: scale(0.98); }
</style>