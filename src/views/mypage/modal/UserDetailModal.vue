<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-container">
      <header class="modal-header">
        <h3>회원 관리 상세</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </header>

      <div class="modal-body">
        <div class="field">
          <label>사업자 등록증 확인</label>
          <div class="file-download-box">
            <div class="file-info">
              <img src="@/assets/file-icon.svg" alt="file" />
              <span>{{ userData.businessLicenseName || '사업자등록증.jpg' }}</span>
            </div>
            <button class="download-btn" @click="downloadFile">
              <img src="@/assets/download.svg" alt="download" />
            </button>
          </div>
        </div>

        <div class="grid-fields">
          <div class="field">
            <label>회원 상태</label>
            <select v-model="localData.status" :class="['status-select', localData.status]">
              <option value="pending">승인 대기</option>
              <option value="active">활성화 (승인)</option>
              <option value="inactive">비활성화</option>
            </select>
          </div>

          <div class="field">
            <label>회원 권한</label>
            <select v-model="localData.role" class="role-select">
              <option value="user">일반 사용자</option>
              <option value="manager">관리자</option>
            </select>
          </div>
        </div>
      </div>

      <footer class="modal-footer">
        <button class="save-btn" @click="handleUpdate">변경 사항 저장</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-container { width: 500px; border-radius: 16px; background: #fff; }
.modal-body { padding: 30px; }

/* 파일 박스 디자인 (이미지 7번 참고) */
.file-download-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 2px solid #333;
  border-radius: 12px;
  margin-bottom: 20px;
}

.status-select.active { color: #11D411; border-color: #11D411; }
.status-select.pending { color: #ffbb00; border-color: #ffbb00; }
.status-select.inactive { color: #ff4d4d; border-color: #ff4d4d; }

.save-btn {
  width: 100%;
  background: #11D411;
  color: #fff;
  padding: 15px;
  border-radius: 8px;
  font-weight: bold;
}
</style>