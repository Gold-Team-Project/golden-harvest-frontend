<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <header class="modal-header">
        <h3>문의 상세 검토</h3>
        <button class="close-x" @click="$emit('close')">✕</button>
      </header>

      <div class="modal-body">
        <div v-if="!detail" class="loading">문의 정보를 불러오는 중입니다...</div>

        <div v-else>
          <div class="info-grid">
            <div class="info-row">
              <div class="info-item">
                <label>문의 번호</label>
                <div class="display-box">{{ no }}</div>
              </div>
              <div class="info-item">
                <label>문의 일자</label>
                <div class="display-box">{{ detail.createdAt?.substring(0, 10) }}</div>
              </div>
            </div>

            <div class="info-row">
              <div class="info-item">
                <label>거래처명</label>
                <div class="display-box">{{ detail.company }}</div>
              </div>
              <div class="info-item">
                <label>담당자 / 연락처</label>
                <div class="display-box">{{ detail.name }} ({{ detail.phoneNumber }})</div>
              </div>
            </div>
          </div>

          <div class="doc-section">
            <label>문의 제목</label>
            <div class="content-box title-highlight">{{ detail.title }}</div>
          </div>

          <div class="doc-section">
            <label>문의 상세 내용</label>
            <div class="content-box multiline">{{ detail.body }}</div>
          </div>

          <div v-if="detail.fileName" class="doc-section">
            <label>첨부파일 확인</label>
            <div class="file-attachment" @click="downloadFile">
              <span class="clip-icon">📎</span>
              <span class="file-name">{{ detail.fileName }}</span>
              <span class="download-text">클릭하여 다운로드</span>
            </div>
          </div>

          <div class="doc-section">
            <label>승인 / 거절 사유 입력</label>
            <textarea
                v-model="comment"
                placeholder="상대방에게 전달될 처리 사유를 입력하세요."
                class="reason-textarea"
            />
          </div>
        </div>
      </div>

      <footer class="modal-footer">
        <button class="reject-btn" @click="handleAction('REJECTED')">문의 거절</button>
        <button class="approve-btn" @click="handleAction('APPROVED')">문의 승인</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/api/axios'
import Swal from 'sweetalert2'

const props = defineProps<{
  inquiryNo: string
  no: number
}>()
const emit = defineEmits(['close', 'answered'])

const detail = ref<any>(null)
const comment = ref('')

// 상세 데이터 로드
const fetchDetail = async () => {
  if (!props.inquiryNo) return
  try {
    const res = await http.get(`/admin/inquiries/${props.inquiryNo}`)
    detail.value = res.data.data
    comment.value = detail.value?.comment ?? ''
  } catch (error) {
    console.error('상세 조회 실패:', error)
  }
}

// 승인/거절 처리 핸들러
const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
  const actionText = status === 'APPROVED' ? '승인' : '거절';

  if (!comment.value.trim()) {
    alert(`${actionText} 사유를 입력해주세요.`);
    return;
  }

  if (!confirm(`해당 문의를 ${actionText}하시겠습니까?`)) return;

  try {
    // 백엔드 명세에 맞춰 status와 comment를 함께 전송
    await http.post(`/admin/inquiries/${props.inquiryNo}/process`, {
      status: status,
      comment: comment.value,
    })

    alert(`성공적으로 ${actionText} 처리되었습니다.`);
    emit('answered')
    emit('close')
  } catch (error) {
    console.error(`${actionText} 처리 실패:`, error)
    alert('처리에 실패했습니다.')
  }
}

/* 파일 다운로드 로직 유지 */
const downloadFile = async () => {
  const url = detail.value?.downloadUrl
  if (!url || url === "-0") return alert("다운로드할 파일이 없습니다.")
  window.open(url, '_blank');
}

onMounted(fetchDetail)
</script>

<style scoped>
/* 회원 관리 모달 디자인 시스템 적용 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 3000; }
.modal-box { background: #fff; width: 600px; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 50px rgba(0,0,0,0.2); display: flex; flex-direction: column; max-height: 90vh; }

.modal-header { display: flex; justify-content: space-between; padding: 20px 25px; border-bottom: 1px solid #eee; background: #fff; }
.modal-header h3 { font-size: 18px; font-weight: 700; color: #333; margin: 0; }
.close-x { background: none; border: none; font-size: 20px; cursor: pointer; color: #999; }

.modal-body { padding: 25px; overflow-y: auto; flex: 1; }
.loading { padding: 40px; text-align: center; color: #999; }

/* 정보 그리드 스타일 */
.info-grid { margin-bottom: 20px; }
.info-row { display: flex; gap: 15px; margin-bottom: 12px; }
.info-item { flex: 1; }
label { display: block; font-size: 13px; font-weight: 700; color: #666; margin-bottom: 8px; }

.display-box {
  width: 100%; padding: 12px; border: 1px solid #eee; border-radius: 10px;
  background: #fcfcfc; font-size: 14px; color: #333; box-sizing: border-box;
}

/* 컨텐츠 섹션 */
.doc-section { margin-bottom: 20px; }
.content-box {
  background: #f9f9f9; padding: 15px; border-radius: 12px; border: 1px solid #f0f0f0;
  font-size: 14px; line-height: 1.6; color: #444; word-break: break-all;
}
.title-highlight { font-weight: 600; color: #111; }
.multiline { min-height: 80px; white-space: pre-wrap; }

/* 파일 첨부 스타일 (회원관리 미리보기 느낌 차용) */
.file-attachment {
  border: 1px dashed #C8E4C8; background: #f8fff8; padding: 12px 18px; border-radius: 12px;
  display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s;
}
.file-attachment:hover { background: #f0fdf0; border-color: #11D411; }
.file-name { flex: 1; font-size: 14px; color: #444; font-weight: 500; }
.download-text { font-size: 12px; color: #11D411; font-weight: 600; }

/* 텍스트 영역 커스텀 */
.reason-textarea {
  width: 100%; min-height: 100px; padding: 15px; border: 1px solid #ddd; border-radius: 12px;
  font-size: 14px; outline: none; transition: 0.2s; resize: none; box-sizing: border-box;
}
.reason-textarea:focus { border-color: #11D411; box-shadow: 0 0 0 3px rgba(17, 212, 17, 0.05); }

/* 푸터 버튼 스타일 */
.modal-footer { padding: 0 25px 25px; display: flex; gap: 12px; }
.modal-footer button { flex: 1; padding: 15px; border-radius: 12px; font-weight: 700; cursor: pointer; border: none; font-size: 15px; transition: 0.2s; }

.approve-btn { background: #11D411; color: #fff; }
.approve-btn:hover { background: #0fb80f; }

.reject-btn { background: #f1f3f5; color: #666; }
.reject-btn:hover { background: #e9ecef; }

/* 스크롤바 */
.modal-body::-webkit-scrollbar { width: 6px; }
.modal-body::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
</style>