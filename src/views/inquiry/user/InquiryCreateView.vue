<template>
  <section class="inquiry-page">
    <!-- 헤더 -->
    <div class="page-header">
      <div>
        <h2>문의 등록</h2>
        <p class="desc">
          궁금하신 점이나 불편사항을 남겨주시면 빠르게 답변드리겠습니다.
        </p>
      </div>
    </div>

    <!-- 카드 -->
    <div class="card">
      <div class="field">
        <label>제목</label>
        <input
            v-model="title"
            placeholder="제목을 입력해주세요"
        />
      </div>

      <div class="field">
        <label>문의 내용</label>
        <textarea
            v-model="body"
            placeholder="문의하실 내용을 상세히 작성해주세요"
        />
      </div>

      <div class="field">
        <label>파일 첨부</label>
        <input type="file" @change="onFileChange" />
      </div>

      <div class="actions">
        <BaseButton class="btn-primary" @click="submit">
          작성 완료
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/api/axios'
import BaseButton from '@/components/button/BaseButton.vue'

const router = useRouter()

const title = ref('')
const body = ref('')
const file = ref<File | null>(null)

/* 백엔드용 더미 salesOrderId */
const SALES_ORDER_ID = 1

const onFileChange = (e: Event) => {
  file.value = (e.target as HTMLInputElement).files?.[0] ?? null
}

const submit = async () => {
  const requestPayload = {
    title: title.value,
    body: body.value,
    salesOrderId: SALES_ORDER_ID, // 여기서 내부적으로만 세팅
  }

  const formData = new FormData()
  formData.append(
      'request',
      new Blob(
          [JSON.stringify(requestPayload)],
          { type: 'application/json' }
      )
  )

  if (file.value) {
    formData.append('file', file.value)
  }

  await http.post('/inquiries', formData)

  router.push('/inquiries')
}
</script>

<style scoped>
/* list.vue와 동일 톤 */

.inquiry-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.desc {
  font-size: 13px;
  color: #6b7280;
}

.card {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
}

.field {
  margin-bottom: 18px;
}

.field label {
  display: block;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

input,
textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}

textarea {
  min-height: 140px;
  resize: none;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

/* 버튼 */
.btn-primary {
  background: #22c55e;
  color: #ffffff;
}
</style>
