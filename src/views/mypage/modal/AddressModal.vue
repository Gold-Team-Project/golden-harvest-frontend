<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-container">
      <header class="modal-header">
        <h3>배송지 수정 및 등록</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </header>

      <div class="modal-body">
        <div class="field">
          <label>수령인</label>
          <input type="text" v-model="localAddr.name" placeholder="이름을 입력하세요" class="input-box" />
        </div>

        <div class="field">
          <label>주소</label>
          <input type="text" v-model="localAddr.base" placeholder="주소를 입력하세요" class="input-box" />
        </div>

        <div class="field">
          <label>상세주소</label>
          <input type="text" v-model="localAddr.detail" placeholder="상세 주소를 입력하세요" class="input-box" />
        </div>

        <div class="field">
          <label>연락처</label>
          <input type="text" v-model="localAddr.phone" placeholder="010-0000-0000" class="input-box" />
        </div>

        <div class="field">
          <label>우선 배송지 선정</label>
          <div class="select-container">
            <select v-model="localAddr.isDefault" class="select-box">
              <option :value="true">기본 배송지</option>
              <option :value="false">일반 배송지</option>
            </select>
            <span class="arrow-icon">▼</span>
          </div>
        </div>
      </div>

      <footer class="modal-footer">
        <button class="register-btn" @click="$emit('save', localAddr)">등록</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const props = defineProps<{ addrData?: any }>()
const emit = defineEmits(['close', 'save'])

const localAddr = reactive({
  name: props.addrData?.name || '',
  base: props.addrData?.base || '',
  detail: props.addrData?.detail || '',
  phone: props.addrData?.phone || '',
  isDefault: props.addrData?.isDefault ?? false
})
</script>

<style scoped>
/* 🔹 배경 및 모달 컨테이너 크기 */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}

.modal-container {
  width: 700px;        /* 640px에서 700px로 더 키웠습니다 */
  max-width: 95vw;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

/* 🔹 헤더 스타일 */
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 { font-size: 18px; font-weight: 700; color: #111; }
.close-btn { border: none; background: none; font-size: 20px; cursor: pointer; color: #999; }

/* 🔹 바디 패딩 및 필드 간격 */
.modal-body { padding: 32px 40px; }
.field { margin-bottom: 24px; }
.field label {
  display: block; font-size: 14px; font-weight: 700; color: #333; margin-bottom: 10px;
}

/* 🔹 인풋박스 스타일 (높이 및 라운드 조정) */
.input-box {
  width: 100%;             /* 부모 너비를 꽉 채움 */
  box-sizing: border-box;  /* 패딩 때문에 인풋이 삐져나가거나 쏠리는 것 방지 */
  height: 52px;
  padding: 0 18px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  outline: none;
}
.input-box:focus { border-color: #11D411; }

/* 🔹 셀렉트 박스 (너비 축소 및 디자인 최적화) */
.select-container {
  position: relative;
  width: 120px; /* 너무 크지 않게 고정 너비 지정 */
}

.select-box {
  width: 100%;
  height: 48px;
  padding: 0 15px;
  border: 1px solid #11D411; /* 초록색 테두리 */
  border-radius: 10px;
  background-color: #f1fef1; /* 연한 초록 배경 */
  color: #11D411;
  font-weight: 700;
  font-size: 15px;
  appearance: none; /* 기본 화살표 제거 */
  cursor: pointer;
  outline: none;
}

.arrow-icon {
  position: absolute;
  right: 15px; top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #11D411;
  pointer-events: none;
}

/* 🔹 푸터 등록 버튼 */
.modal-footer {
  padding: 0 40px 40px;
  display: flex; justify-content: flex-end;
}

.register-btn {
  background: #11D411;
  color: #fff;
  border: none;
  padding: 14px 50px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
.register-btn:hover { background: #0fb80f; }
.register-btn:active { transform: scale(0.98); }
</style>