<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <header class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <span v-if="isMe" class="me-tag">본인 계정</span>
        <button class="close-x" @click="$emit('close')">✕</button>
      </header>

      <div class="modal-body">
        <div class="doc-section">
          <label>사업자 등록증 확인</label>
          <div class="file-preview" @click="zoomImage">
            <img :src="imageUrl" alt="사업자등록증" />
            <div class="zoom-overlay">클릭하여 크게 보기</div>
          </div>
        </div>

        <div v-if="mode === 'all'" class="info-grid">
          <div class="info-row">
            <div class="info-item">
              <label>회원 상태</label>
              <select
                  v-model="localData.userStatus"
                  :class="['status-select', localData.userStatus]"
                  :disabled="isMe"
              >
                <option value="ACTIVE">활성화</option>
                <option value="PENDING">대기</option>
                <option value="INACTIVE">비활성화</option>
              </select>
            </div>

            <div class="info-item">
              <label>회원 권한</label>
              <select v-model="localData.role" class="basic-select" :disabled="isMe">
                <option value="ROLE_USER">일반 사용자 (B2B)</option>
                <option value="ROLE_ADMIN">관리자 (Staff)</option>
              </select>
            </div>
          </div>
          <p v-if="isMe" class="helper-text center">관리자 본인의 상태 및 권한은 수정할 수 없습니다.</p>
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
          <button
              class="save-btn"
              :disabled="isMe"
              @click="handleAction('SAVE')"
          >
            설정 저장
          </button>
        </template>
      </footer>
    </div>
  </div>
</template>

<script setup>
import {reactive, computed, watch} from 'vue';
import { approveUser, approveProfileUpdate, updateUserStatus, updateUserRole } from '@/api/AdminApi.js';
import Swal from 'sweetalert2';

const props = defineProps(['userData', 'mode']);
const emit = defineEmits(['close', 'update']);

const isMe = computed(() => props.userData.isMe);

const getInitialRole = (data) => {
  // 1. 데이터 자체가 없으면 기본값 반환
  if (!data || !data.role) return 'ROLE_USER';

  // 2. role이 객체인 경우 (가장 흔한 원인) -> { id: 'ROLE_USER' }
  if (typeof data.role === 'object') {
    return data.role.id || data.role.roleName || 'ROLE_USER';
  }

  // 3. role이 이미 문자열인 경우 ("ROLE_USER")
  return String(data.role);
};

const localData = reactive({
  ...props.userData,
  userStatus: props.userData.userStatus || 'PENDING',
  // 추출 함수를 사용하여 안전하게 할당
  role: getInitialRole(props.userData)
});

// 부모 데이터가 바뀔 때를 대비한 감시 로직 추가
watch(() => props.userData, (newVal) => {
  if (newVal) {
    localData.role = getInitialRole(newVal);
    localData.userStatus = newVal.userStatus || 'PENDING';
  }
}, { deep: true });

const modalTitle = computed(() => {
  if (props.mode === 'join') return '신규 가입 검토';
  if (props.mode === 'update') return '정보 수정 승인';
  return '회원 상세 설정';
});

const imageUrl = computed(() => {
  if (props.mode === 'update') {
    return props.userData.requestFileUrl || props.userData.fileUrl || 'https://placehold.jp/24/11d411/ffffff/300x400.png?text=미리보기';
  }
  return props.userData.fileUrl || 'https://placehold.jp/24/11d411/ffffff/300x400.png?text=미리보기';
});

const handleAction = async (type) => {
  try {
    const targetEmail = props.userData.userEmail || props.userData.email;

    if (props.mode === 'join' && type === 'APPROVE') {
      if (!confirm("가입을 승인하시겠습니까?")) return;
      await approveUser(targetEmail, 'ACTIVE');
      alert("성공적으로 승인되었습니다.");
    }
    else if (props.mode === 'update' && type === 'APPROVE') {
      if (!confirm("정보 수정을 승인하시겠습니까?")) return;
      await approveProfileUpdate(props.userData.id);
      alert("정보 수정 승인이 완료되었습니다.");
    }
    // 핵심 수정 부분: 'SAVE' 시 상태와 권한을 모두 업데이트
    else if (type === 'SAVE') {
      if (isMe.value) return;
      if (!confirm(`회원 정보를 변경하시겠습니까?`)) return;

      // 1. 상태(Status) 변경 API 호출
      await updateUserStatus(targetEmail, localData.userStatus);

      // 2. 권한(Role) 변경 API 호출 (추가됨)
      if (updateUserRole) {
        await updateUserRole(targetEmail, localData.role);
      }

      alert("회원 설정이 모두 저장되었습니다.");
    }

    emit('update');
    emit('close');
  } catch (error) {
    console.error("처리 중 에러 발생:", error);
    const errorMsg = error.response?.data?.message || "처리에 실패했습니다.";
    alert("오류: " + errorMsg);
  }
};
// 권한 변경 저장 함수
const handleSaveRole = async () => {
  try {
    // 로딩 표시 (선택 사항)
    Swal.fire({
      title: '처리 중...',
      didOpen: () => { Swal.showLoading(); }
    });

    // API 호출 (targetEmail과 선택된 localData.role 전송)
    await updateUserRole(localData.userEmail, localData.role);

    // 성공 토스트 메시지
    Swal.fire({
      icon: 'success',
      title: '권한 변경 완료',
      text: `${localData.name}님의 권한이 성공적으로 변경되었습니다.`,
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end' // 우측 상단에 작게 표시
    });

    emit('update'); // 부모 컴포넌트 리스트 갱신 요청
  } catch (error) {
    console.error('권한 변경 실패:', error);

    // 실패 메시지
    Swal.fire({
      icon: 'error',
      title: '변경 실패',
      text: error.response?.data?.message || '권한을 변경하는 중 오류가 발생했습니다.',
    });
  }
};


const zoomImage = () => { window.open(imageUrl.value, '_blank'); };
</script>

<style scoped>
/* 기존 스타일 유지 + 권한 선택창 관련 미세 조정 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 3000; }
.modal-box { background: #fff; width: 520px; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 50px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; padding: 20px 25px; border-bottom: 1px solid #eee; }
.modal-header h3 { font-size: 18px; font-weight: 700; color: #333; }
.close-x { background: none; border: none; font-size: 20px; cursor: pointer; color: #999; }
.modal-body { padding: 25px; max-height: 75vh; overflow-y: auto; }
.doc-section { margin-bottom: 25px; }
.file-preview { position: relative; border: 1px solid #e0e4e0; border-radius: 12px; overflow: hidden; cursor: pointer; background: #f9f9f9; height: 180px; display: flex; align-items: center; justify-content: center; }
.file-preview img { max-width: 100%; max-height: 100%; object-fit: contain; }
.zoom-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); color: #fff; display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s; font-size: 13px; }
.file-preview:hover .zoom-overlay { opacity: 1; }
label { display: block; font-size: 13px; font-weight: 700; color: #666; margin-bottom: 8px; }
.info-row { display: flex; gap: 15px; margin-bottom: 15px; }
.info-item { flex: 1; }
.basic-select, .status-select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 10px; outline: none; font-size: 14px; box-sizing: border-box; }
.status-select.ACTIVE { border-color: #11D411; color: #11D411; font-weight: 700; }
.status-select.PENDING { border-color: #f39c12; color: #f39c12; font-weight: 700; }
.status-select.INACTIVE { border-color: #ff4d4d; color: #ff4d4d; font-weight: 700; }
.modal-footer { padding: 0 25px 25px; display: flex; gap: 10px; }
.modal-footer button { flex: 1; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; border: none; font-size: 15px; transition: 0.2s; }
.approve-btn, .save-btn { background: #11D411; color: #fff; }
.reject-btn { background: #f1f3f5; color: #666; }
.me-tag { background: #f1f3f5; color: #666; font-size: 12px; padding: 2px 8px; border-radius: 4px; margin-left: 10px; }
.helper-text { font-size: 11px; color: #ff4d4d; margin-top: 5px; }
.helper-text.center { text-align: center; margin-top: 10px; }
button:disabled { background: #ccc !important; cursor: not-allowed; }
</style>