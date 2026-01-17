<template>
  <div class="modal-backdrop">
    <div class="modal">
      <!-- 헤더 -->
      <header class="modal-header">
        <h3>문의 확인</h3>
        <button class="close" @click="$emit('close')">✕</button>
      </header>

      <!-- 본문 -->
      <div v-if="detail" class="modal-body">
        <div class="field">
          <label>제목</label>
          <div class="box">{{ detail.title }}</div>
        </div>

        <div class="field">
          <label>문의 내용</label>
          <div class="box multiline">{{ detail.body }}</div>
        </div>

        <div class="field">
          <label>답변</label>
          <div class="box multiline">
            {{ detail.comment ?? '답변 대기 중입니다.' }}
          </div>
        </div>

        <div v-if="detail.fileName" class="field">
          <label>첨부파일</label>
          <div class="file-box">
            {{ detail.fileName }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/api/axios'

const props = defineProps<{ inquiryNo: string }>()
const detail = ref<any>(null)

onMounted(async () => {
  const res = await http.get(`/inquiries/${props.inquiryNo}`)
  detail.value = res.data.data
})
</script>

<style scoped>
/* 🔹 배경 오버레이 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 🔹 모달 본체 */
.modal {
  width: 640px;                /* Figma 비율 */
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
}

/* 🔹 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background: #f9fafb;         /* Figma 느낌 */
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
}

.close {
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
}

/* 🔹 바디 */
.modal-body {
  padding: 24px;
}

/* 🔹 필드 */
.field {
  margin-bottom: 22px;
}

.field label {
  display: block;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

/* 🔹 내용 박스 */
.box {
  background: #f9fafb;
  padding: 14px 16px;
  border-radius: 10px;
  font-size: 14px;
  color: #111827;
  line-height: 1.6;
}

.box.multiline {
  min-height: 96px;
}

/* 🔹 첨부파일 */
.file-box {
  background: #f3f4f6;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  color: #374151;
}
</style>
