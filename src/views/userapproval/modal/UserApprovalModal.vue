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
  if (!data || !data.role) return 'ROLE_USER';
  if (typeof data.role === 'object') {
    return data.role.id || data.role.roleName || 'ROLE_USER';
  }
  return String(data.role);
};

const localData = reactive({
  ...props.userData,
  userStatus: props.userData.userStatus || 'PENDING',
  role: getInitialRole(props.userData)
});

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
  const targetEmail = props.userData.userEmail || props.userData.email;

  // 1. 확인창 메시지 설정
  let confirmTitle = "";
  let confirmText = "";
  let confirmBtnColor = "#11D411";

  if (type === 'REJECT') {
    confirmTitle = props.mode === 'join' ? "가입을 거절하시겠습니까?" : "수정을 반려하시겠습니까?";
    confirmText = "이 작업은 취소할 수 없습니다.";
    confirmBtnColor = "#ef4444";
  } else if (type === 'APPROVE') {
    confirmTitle = props.mode === 'join' ? "가입을 승인하시겠습니까?" : "정보 수정을 승인하시겠습니까?";
    confirmText = "승인 후 즉시 반영됩니다.";
  } else if (type === 'SAVE') {
    if (isMe.value) return;
    confirmTitle = "설정을 저장하시겠습니까?";
    confirmText = "회원의 상태 및 권한이 업데이트됩니다.";
  }

  // 2. 실행 전 확인 (didOpen으로 z-index 강제 조정)
  if (type !== 'CLOSE') {
    const result = await Swal.fire({
      title: confirmTitle,
      text: confirmText,
      icon: type === 'REJECT' ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: confirmBtnColor,
      cancelButtonColor: '#9ca3af',
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      borderRadius: '16px',
      // 모달(3000)보다 위에 뜨도록 설정
      didOpen: () => {
        Swal.getContainer().style.zIndex = "4000";
      }
    });
    if (!result.isConfirmed) return;
  }

  // 3. API 호출 로직
  try {
    Swal.fire({
      title: '처리 중...',
      didOpen: () => {
        Swal.showLoading();
        Swal.getContainer().style.zIndex = "4000";
      }
    });

    if (props.mode === 'join' && type === 'APPROVE') {
      await approveUser(targetEmail, 'ACTIVE');
    }
    else if (props.mode === 'update' && type === 'APPROVE') {
      await approveProfileUpdate(props.userData.id);
    }
    else if (type === 'SAVE') {
      await updateUserStatus(targetEmail, localData.userStatus);
      if (updateUserRole) await updateUserRole(targetEmail, localData.role);
    }

    await Swal.fire({
      icon: 'success',
      title: '완료되었습니다',
      timer: 1500,
      showConfirmButton: false,
      borderRadius: '16px',
      didOpen: () => {
        Swal.getContainer().style.zIndex = "4000";
      }
    });

    emit('update');
    emit('close');
  } catch (error) {
    console.error("처리 중 에러 발생:", error);
    Swal.fire({
      icon: 'error',
      title: '오류 발생',
      text: error.response?.data?.message || "처리에 실패했습니다.",
      confirmButtonColor: '#ef4444',
      didOpen: () => {
        Swal.getContainer().style.zIndex = "4000";
      }
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