<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <header class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <button class="close-x" @click="$emit('close')">✕</button>
      </header>

      <div class="modal-body">
        <div class="doc-section">
          <label>사업자 등록증 확인</label>
          <div class="file-preview" @click="zoomImage">
            <img
                :src="userData.bizDocUrl || 'https://placehold.jp/24/11d411/ffffff/300x400.png?text=사업자등록증%20미리보기'"
                alt="사업자등록증"
            />
            <div class="zoom-overlay">🔍 클릭하여 크게 보기</div>
          </div>
        </div>

        <div v-if="mode === 'all'" class="info-grid">
          <div class="info-row">
            <div class="info-item">
              <label>회원 상태</label>
              <select v-model="localData.userStatus" :class="['status-select', localData.userStatus]">
                <option value="ACTIVE">활성화</option>
                <option value="PENDING">대기</option>
                <option value="INACTIVE">비활성화</option>
              </select>
            </div>
            <div class="info-item">
              <label>권한 설정</label>
              <select v-model="localData.role" class="basic-select">
                <option value="고객">고객</option>
                <option value="관리자">관리자</option>
              </select>
            </div>
          </div>
          <div class="info-item full">
            <label>관리자 메모</label>
            <textarea v-model="localData.adminMemo" placeholder="특이사항을 입력하세요" class="basic-textarea"></textarea>
          </div>
        </div>

        <div v-if="mode === 'join'" class="join-info">
          <div class="info-summary">
            <p><strong>사업자명:</strong> {{ userData.company }}</p>
            <p><strong>대표자:</strong> {{ userData.ceo }}</p>
            <p><strong>사업자번호:</strong> {{ userData.bizNum }}</p>
          </div>
        </div>

        <div v-if="mode === 'update'" class="update-compare">
          <div class="compare-header">
            <span>기존 정보</span>
            <span class="arrow">→</span>
            <span>변경 요청</span>
          </div>
          <div class="compare-row">
            <div class="field-label-tag">{{ userData.updateField }}</div>
            <div class="compare-box">
              <div class="old">{{ userData.oldValue }}</div>
              <div class="new">{{ userData.newValue }}</div>
            </div>
          </div>
        </div>
      </div>

      <footer class="modal-footer">
        <template v-if="mode === 'join'">
          <button class="reject-btn" @click="handleAction('REJECT')">가입 거절</button>
          <button class="approve-btn" @click="handleAction('APPROVE')">가입 승인</button>
        </template>
        <template v-else-if="mode === 'update'">
          <button class="reject-btn" @click="handleAction('REJECT')">수정 반려</button>
          <button class="approve-btn" @click="handleAction('APPROVE')">수정 승인</button>
        </template>
        <template v-else>
          <button class="reject-btn" @click="$emit('close')">취소</button>
          <button class="save-btn" @click="handleAction('SAVE')">설정 저장</button>
        </template>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { approveUser, approveProfileUpdate } from '@/api/AdminApi.js';

const props = defineProps(['userData', 'mode']);
const emit = defineEmits(['close', 'update']);

// 관리자 설정용 로컬 상태 (설정 저장 탭에서 사용)
const localData = reactive({
  ...props.userData,
  adminMemo: '',
  userStatus: props.userData.status || 'PENDING'
});

const modalTitle = computed(() => {
  if (props.mode === 'join') return '신규 가입 검토';
  if (props.mode === 'update') return '정보 수정 승인';
  return '회원 상세 설정';
});

// 백엔드 API 호출 핸들러
const handleAction = async (type) => {
  try {
    // 1. 신규 가입 승인 로직
    if (props.mode === 'join' && type === 'APPROVE') {
      if (!confirm("가입을 승인하시겠습니까?")) return;

      // userData.email 혹은 userData.userEmail 등 백엔드 전달용 이메일 필드 확인
      const targetEmail = props.userData.userEmail || props.userData.email;

      // 두 번째 인자로 객체가 아닌 'ACTIVE' 문자열만 보냄
      await approveUser(targetEmail, 'ACTIVE');

      alert("성공적으로 승인되었습니다.");
      emit('update');
      emit('close');
    }

    // 2. 정보 수정 승인 로직
    else if (props.mode === 'update' && type === 'APPROVE') {
      if (!confirm("정보 수정을 승인하시겠습니까?\n실제 회원 정보가 변경됩니다.")) return;

      // 백엔드: @PathVariable Long requestId
      await approveProfileUpdate(props.userData.id);
      alert("정보 수정 승인이 완료되었습니다.");
    }

    // 3. 일반 설정 저장 (mode === 'all')
    else if (type === 'SAVE') {
      // 필요 시 별도의 설정 저장 API 호출 로직 추가
      console.log("설정 저장:", localData);
      alert("설정이 저장되었습니다.");
    }

    // 성공 시 공통 처리
    emit('update'); // 부모 컴포넌트(UserApproval.vue)의 목록 새로고침
    emit('close');  // 모달 닫기

  } catch (error) {
    console.error("처리 중 에러 발생:", error);
    // 백엔드 BusinessException 메시지 처리
    const errorMsg = error.response?.data?.message || "처리에 실패했습니다.";
    alert("오류: " + errorMsg);
  }
};

const zoomImage = () => {
  // 실제 파일 다운로드/조회 API 경로가 있다면 props.userData.requestFileId 활용 가능
  window.open(props.userData.bizDocUrl || 'https://placehold.jp/300x400.png', '_blank');
};
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 3000; }
.modal-box { background: #fff; width: 520px; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 50px rgba(0,0,0,0.2); }

.modal-header { display: flex; justify-content: space-between; padding: 20px 25px; border-bottom: 1px solid #eee; }
.modal-header h3 { font-size: 18px; font-weight: 700; color: #333; }
.close-x { background: none; border: none; font-size: 20px; cursor: pointer; color: #999; }

.modal-body { padding: 25px; max-height: 75vh; overflow-y: auto; }

/* 🔹 사업자 등록증 섹션 (공통) */
.doc-section { margin-bottom: 25px; }
.file-preview {
  position: relative; border: 1px solid #e0e4e0; border-radius: 12px; overflow: hidden; cursor: pointer;
  background: #f9f9f9; height: 180px; display: flex; align-items: center; justify-content: center;
}
.file-preview img { max-width: 100%; max-height: 100%; object-fit: contain; }
.zoom-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); color: #fff; display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s; font-size: 13px; }
.file-preview:hover .zoom-overlay { opacity: 1; }

/* 🔹 정보 입력창 디자인 */
label { display: block; font-size: 13px; font-weight: 700; color: #666; margin-bottom: 8px; }
.info-row { display: flex; gap: 15px; margin-bottom: 15px; }
.info-item { flex: 1; }
.basic-select, .status-select, .basic-textarea {
  width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 10px; outline: none; font-size: 14px; box-sizing: border-box;
}
.basic-textarea { height: 100px; resize: none; }

/* 상태 셀렉트 색상 강조 */
.status-select.ACTIVE { border-color: #11D411; color: #11D411; font-weight: 700; }
.status-select.PENDING { border-color: #f39c12; color: #f39c12; font-weight: 700; }

/* 🔹 가입/수정 전용 디자인 */
.info-summary { background: #f8f9fb; padding: 15px; border-radius: 10px; font-size: 14px; line-height: 1.8; }
.compare-header { display: flex; justify-content: space-between; font-weight: 700; font-size: 13px; color: #888; margin-bottom: 10px; }
.compare-header span { flex: 1; text-align: center; }
.compare-box { display: flex; gap: 10px; }
.old, .new { flex: 1; padding: 12px; border-radius: 10px; font-size: 13px; text-align: center; }
.old { background: #fff0f0; color: #ff4d4d; text-decoration: line-through; border: 1px solid #ffcccc; }
.new { background: #eefdee; color: #11D411; font-weight: 700; border: 1px solid #c8e4c8; }
.field-label-tag { background: #eee; padding: 4px 10px; border-radius: 5px; font-size: 12px; display: inline-block; margin-bottom: 8px; font-weight: 600; }

/* 🔹 푸터 버튼 */
.modal-footer { padding: 0 25px 25px; display: flex; gap: 10px; }
.modal-footer button { flex: 1; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; border: none; font-size: 15px; transition: 0.2s; }
.approve-btn, .save-btn { background: #11D411; color: #fff; }
.reject-btn { background: #f1f3f5; color: #666; }
.save-btn:hover, .approve-btn:hover { background: #0fb80f; }
</style>