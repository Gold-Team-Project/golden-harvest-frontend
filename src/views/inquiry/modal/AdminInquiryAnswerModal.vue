<template>
  <div class="modal-backdrop">
    <div class="modal">
      <header class="modal-header">
        <h3>문의 상세</h3>
        <button class="close" @click="$emit('close')">✕</button>
      </header>

      <div class="modal-body">
        <div v-if="!detail" class="loading">
          문의 정보를 불러오는 중입니다...
        </div>

        <div v-else>
          <div class="info-grid">
            <div><span>문의번호</span>{{ no }}</div>
            <div><span>문의일</span>{{ detail.createdAt?.substring(0, 10) }}</div>

            <div><span>거래처명</span>{{ detail.company }}</div>
            <div><span>담당자</span>{{ detail.name }}</div>

            <div><span>연락처</span>{{ detail.phoneNumber }}</div>
            <div><span>이메일</span>{{ detail.email }}</div>

            <div>
              <span>상태</span>
              <StatusBadge
                  :class="detail.processingStatus === 'Y'
                  ? 'status-done'
                  : 'status-wait'"
              >
                {{ detail.processingStatus === 'Y' ? '답변완료' : '대기중' }}
              </StatusBadge>
            </div>
          </div>

          <div class="field">
            <label>제목</label>
            <div class="box">{{ detail.title }}</div>
          </div>

          <div class="field">
            <label>내용</label>
            <div class="box multiline">{{ detail.body }}</div>
          </div>

          <div v-if="detail.fileName" class="field">
            <label>첨부파일</label>
            <div class="file-box" @click="downloadFile">
              📎 {{ detail.fileName }}
            </div>
          </div>

          <div class="field">
            <label>답변</label>
            <textarea
                v-model="comment"
                placeholder="답변을 입력하세요"
            />
          </div>
        </div>
      </div>

      <footer class="modal-footer">
        <BaseButton class="btn-primary" @click="submitAnswer">
          답변등록
        </BaseButton>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/api/axios'
import BaseButton from '@/components/button/BaseButton.vue'
import StatusBadge from '@/components/status/StatusBadge.vue'

const props = defineProps<{
  inquiryNo: string
  no: number
}>()
const emit = defineEmits(['close', 'answered'])

const detail = ref<any>(null)
const comment = ref('')

// 상세 조회
const fetchDetail = async () => {
  if (!props.inquiryNo) return

  try {
    const res = await http.get(`/admin/inquiries/${props.inquiryNo}`)
    console.log("서버 응답 상세 데이터:", res.data.data)
    detail.value = res.data.data
    comment.value = detail.value?.comment ?? ''
  } catch (error) {
    console.error('상세 조회 실패:', error)
  }
}

/* 파일 다운로드 */
const downloadFile = async () => {
  const url = detail.value?.downloadUrl
  if (!url || url === "-0") return alert("다운로드할 파일이 없습니다.")

  const response = await fetch(url, { method: "GET" }) // 또는 axios.get(url,{responseType:'blob'})
  const blob = await response.blob()

  const a = document.createElement("a")
  const objectUrl = URL.createObjectURL(blob)
  a.href = objectUrl
  a.download = detail.value.fileName || url.split("/").pop()!
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(objectUrl)
}


/* 답변 등록 */
const submitAnswer = async () => {
  try {
    await http.post(`/inquiries/${props.inquiryNo}/comments`, {
      comment: comment.value,
    })
    emit('answered')
    emit('close')
  } catch (error) {
    console.error('답변 등록 실패:', error)
    alert('답변 등록에 실패했습니다.')
  }
}

onMounted(fetchDetail)
</script>

<style scoped>
/* 배경 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 모달 */
.modal {
  width: 680px;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  max-height: 90vh; /* 전체 화면 높이의 90%까지만 사용 */
}

/* 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;
}

/* 바디 (스크롤 영역) */
.modal-body {
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
}

/* 스크롤바 커스텀 */
.modal-body::-webkit-scrollbar {
  width: 8px;
}
.modal-body::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 4px;
}
.modal-body::-webkit-scrollbar-track {
  background-color: transparent;
}

.loading {
  padding: 40px;
  text-align: center;
  color: #6b7280;
}

/* 상단 정보 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
  font-size: 13px;
}

.info-grid span {
  display: inline-block;
  width: 72px;
  color: #6b7280;
  font-weight: 500;
}

/* 필드 */
.field {
  margin-bottom: 20px;
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

/* 박스 */
.box {
  background: #f9fafb;
  padding: 14px 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #1f2937;
  border: 1px solid #f3f4f6;

  word-break: break-all;
  white-space: pre-wrap;
}

.box.multiline {
  min-height: 100px;
}

/* 파일 */
.file-box {
  background: #f3f4f6;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #4b5563;
  transition: background-color 0.2s;
  display: inline-block;
  min-width: 200px;
}

.file-box:hover {
  background: #e5e7eb;
  color: #111827;
}

/* textarea */
textarea {
  width: 100%;
  min-height: 120px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  resize: none;

  box-sizing: border-box;
}

textarea:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.1);
}

/* 푸터 */
.modal-footer {
  padding: 16px 24px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

/* 버튼 */
.btn-primary {
  background: #22c55e;
  color: #fff;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
}

.btn-primary:hover {
  background: #16a34a;
}

/* 상태 */
.status-done {
  background: #dcfce7;
  color: #15803d;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-wait {
  background: #fef3c7;
  color: #b45309;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>