<template>
  <section class="admin-page">
    <div class="page-header">
      <p class="desc">홈 / 마스터 관리 / 품목 정보 수정</p>
    </div>

    <div class="detail-layout">
      <div class="left-col">
        <div class="card">
          <h3 class="card-title">품목 이미지</h3>
          <div class="img-wrapper">
            <img
                v-if="previewUrl || form.fileUrl"
                :src="previewUrl || getFullImageUrl(form.fileUrl)"
                alt="이미지 미리보기"
                @error="handleImgError"
            />
            <div v-else class="no-img">
              <span>이미지 없음</span>
            </div>
          </div>
          <div class="file-upload-box">
            <input type="file" id="fileInput" @change="onFileChange" accept="image/*"/>
            <label for="fileInput" class="btn-file">이미지 변경</label>
          </div>
        </div>
      </div>

      <div class="right-col">
        <div class="card info-section">
          <h3 class="card-title">기본 정보 (수정 불가)</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>품목코드</label>
              <input type="text" v-model="form.itemCode" disabled class="input-disabled"/>
            </div>
            <div class="info-item">
              <label>등록일</label>
              <input type="text" :value="form.createdAt?.substring(0, 10)" disabled class="input-disabled"/>
            </div>

            <div class="info-item">
              <label>품목명</label>
              <input type="text" v-model="form.itemName" disabled class="input-disabled"/>
            </div>
            <div class="info-item">
              <label>품종명</label>
              <input type="text" v-model="form.varietyName" disabled class="input-disabled"/>
            </div>
            <div class="info-item">
              <label>단위 (Base Unit)</label>
              <input type="text" v-model="form.baseUnit" disabled class="input-disabled"/>
            </div>
            <div class="info-item">
              <label>표준 규격 (kg)</label>
              <input type="number" v-model="form.packToKg" disabled class="input-disabled"/>
            </div>
            <div class="info-item">
              <label>등급</label>
              <input type="text" v-model="form.grade" disabled class="input-disabled"/>
            </div>
            <div class="info-item">
              <label>원산지</label>
              <input type="text" v-model="form.country" disabled class="input-disabled"/>
            </div>

            <div class="info-item full">
              <label>설명 <span class="edit-badge">수정 가능</span></label>
              <textarea
                  v-model="form.description"
                  class="multiline-input"
                  placeholder="품목에 대한 상세 설명을 수정할 수 있습니다."
              ></textarea>
            </div>
          </div>

          <div class="divider"></div>

          <h3 class="card-title">상세 정보 수정</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>최저 저장온도 (℃) <span class="edit-badge">수정 가능</span></label>
              <input type="number" v-model="form.storageTempMin" step="0.1"/>
            </div>
            <div class="info-item">
              <label>최고 저장온도 (℃) <span class="edit-badge">수정 가능</span></label>
              <input type="number" v-model="form.storageTempMax" step="0.1"/>
            </div>
            <div class="info-item">
              <label>유통기한 (일) <span class="edit-badge">수정 가능</span></label>
              <input type="number" v-model="form.shelfLifeDays"/>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="footer-left"></div>
      <div class="footer-right">
        <BaseButton class="btn-cancel" @click="$router.back()">취소</BaseButton>
        <BaseButton class="btn-save" @click="submitUpdate">저장하기</BaseButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {ref, onMounted, reactive} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import http from '@/api/axios'
import BaseButton from '@/components/button/BaseButton.vue'
import Swal from 'sweetalert2' // 1. Swal 추가

const route = useRoute()
const router = useRouter()
const skuNo = route.params.skuNo as string

const BACKEND_URL = 'http://localhost:8088'

// 폼 데이터
const form = reactive({
  skuNo: '',
  itemCode: '',
  itemName: '',
  varietyName: '',
  baseUnit: '',
  packToKg: 0,
  grade: '',
  country: '',
  description: '',
  shelfLifeDays: 0,
  storageTempMin: 0.0,
  storageTempMax: 0.0,
  fileUrl: '',
  createdAt: ''
})

const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')

const getFullImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${BACKEND_URL}${url}`
}

const handleImgError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = '/assets/no-image.png'
}

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    previewUrl.value = URL.createObjectURL(selectedFile.value)
  }
}

const fetchDetail = async () => {
  if (!skuNo) return
  try {
    const res = await http.get(`/master-data/items/${skuNo}`)
    const data = res.data?.data || res.data
    Object.assign(form, data)
  } catch (err) {
    console.error('데이터 로드 실패', err)
    router.back()
  }
}

// [수정] 수정 내용 저장 핸들러
const submitUpdate = async () => {
  // 1. 저장 확인창
  const result = await Swal.fire({
    title: '변경 내용을 저장하시겠습니까?',
    text: '수정된 정보가 마스터 데이터에 반영됩니다.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#11D411', // 포인트 컬러
    cancelButtonColor: '#9ca3af',
    confirmButtonText: '저장하기',
    cancelButtonText: '취소',
    reverseButtons: true,
    borderRadius: '16px'
  })

  if (!result.isConfirmed) return

  try {
    const formData = new FormData()

    const requestData = {
      description: form.description,
      shelfLifeDays: form.shelfLifeDays,
      storageTempMin: form.storageTempMin,
      storageTempMax: form.storageTempMax
    }
    formData.append('request', JSON.stringify(requestData))

    if (selectedFile.value) {
      formData.append('file', selectedFile.value)
    }

    const targetId = form.itemCode || skuNo

    await http.patch(`/master-data/${targetId}`, formData, {
      headers: {'Content-Type': 'multipart/form-data'}
    })

    // 2. 성공 알림
    await Swal.fire({
      title: '수정 완료',
      text: '품목 정보가 성공적으로 수정되었습니다.',
      icon: 'success',
      confirmButtonColor: '#11D411',
      borderRadius: '16px'
    })

    router.push(`/admin/masterData/${skuNo}`)
  } catch (err) {
    console.error('수정 실패:', err)

    // 3. 에러 알림
    Swal.fire({
      title: '수정 실패',
      text: '수정 처리 중 오류가 발생했습니다.',
      icon: 'error',
      confirmButtonColor: '#ef4444',
      borderRadius: '16px'
    })
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
  margin-bottom: 8px;
}

.desc {
  font-size: 13px;
  color: #6b7280;
}

/* 레이아웃 */
.detail-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
}

.left-col, .right-col {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 카드 스타일 */
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

.info-section {
  height: 100%;
}

/* 이미지 */
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
  margin-bottom: 12px;
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

.file-upload-box {
  text-align: center;
}

.file-upload-box input[type="file"] {
  display: none;
}

.btn-file {
  display: inline-block;
  padding: 8px 16px;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  transition: 0.2s;
}

.btn-file:hover {
  background-color: #e5e7eb;
}

/* 폼 스타일 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item.full {
  grid-column: span 2;
}

.info-item label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

input, textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #11D411;
  ring: 2px solid #bfdbfe;
}

.multiline-input {
  height: 100px;
  resize: none;
  line-height: 1.5;
}

/* Read-Only 스타일 */
.input-disabled {
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

.edit-badge {
  font-size: 11px;
  color: #2563eb;
  background: #eff6ff;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 4px;
}

.divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 32px 0;
}

/* Footer 정렬 수정 (Grid Layout) */
.page-footer {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  margin-top: 20px;
}

.footer-left {
  display: flex;
}

.footer-right {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 버튼 */
.btn-cancel {
  background: #fff;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.btn-cancel:active { transform: scale(0.98); }

.btn-save {
  background: #11D411;
  border: 1px solid #11D411;
  color: #fff;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-save:hover { background-color: #0fb80f; }
.btn-save:active { transform: scale(0.98); }
</style>