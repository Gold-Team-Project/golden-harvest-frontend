<template>
  <div class="edit-info-container">
    <p class="top-guide-text">회사명, 사업자 등록번호 수정 시 '수정 요청' 버튼을 눌러주세요.</p>

    <div class="settings-card">
      <div class="scroll-area">

        <div class="settings-section">
          <h3 class="section-title">
            <img src="@/assets/company.svg" alt="Company" class="title-icon" /> 사업자 정보
          </h3>

          <div class="business-info-list">
            <div class="input-group full-width">
              <label>회사명</label>
              <div class="input-with-btn">
                <input type="text" v-model="info.company" placeholder="회사명을 입력하세요" />
                <button type="button" class="request-btn" @click="handleBusinessUpdateReq">수정 요청</button>
              </div>
            </div>

            <div class="input-group full-width">
              <label>사업자 등록번호</label>
              <div class="input-with-btn">
                <input type="text" v-model="info.businessNumber" placeholder="000-00-00000" />
                <button type="button" class="request-btn" @click="handleBusinessUpdateReq">수정 요청</button>
              </div>
            </div>

            <div class="input-group full-width">
              <label>사업자 등록증 (필수 첨부)</label>
              <div class="file-upload-wrapper">
                <input type="file" @change="onFileChange" accept="image/*, .pdf" id="biz-file" class="hidden-file-input" />
                <label for="biz-file" class="file-custom-btn">
                  {{ selectedFileName || '파일 선택 (변경 시 필수)' }}
                </label>
                <p v-if="info.fileId && !selectedFileName" class="side-info">현재 등록된 파일이 있습니다.</p>
              </div>
            </div>

            <div class="input-group full-width">
              <label>이메일 (ID/세금계산서 수신용)</label>
              <input type="email" v-model="info.email" disabled class="disabled-input" />
              <p class="side-info">* 이메일은 변경이 불가능한 아이디 정보입니다.</p>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="settings-section">
          <h3 class="section-title">
            <img src="@/assets/address.svg" alt="Address" class="title-icon" /> 담당자 및 주소 정보
          </h3>

          <div class="personal-grid">
            <div class="input-group">
              <label>담당자 이름</label>
              <input type="text" v-model="info.name" placeholder="이름을 입력하세요" />
            </div>
            <div class="input-group">
              <label>전화번호</label>
              <input type="text" v-model="info.phoneNumber" placeholder="010-0000-0000" />
            </div>
            <div class="input-group">
              <label>우편번호</label>
              <input type="text" v-model="info.postalCode" placeholder="우편번호" />
            </div>
            <div class="input-group">
              <label>도로명 주소</label>
              <input type="text" v-model="info.addressLine1" placeholder="기본 주소" />
            </div>
            <div class="input-group full-width">
              <label>상세 주소</label>
              <input type="text" v-model="info.addressLine2" placeholder="상세 주소를 입력하세요" />
            </div>
          </div>
        </div>

        <div class="password-bg-area">
          <div class="settings-section">
            <h3 class="section-title">
              <img src="@/assets/password.svg" alt="Password" class="title-icon" /> 비밀번호 변경
            </h3>
            <div class="password-grid">
              <div class="input-group full-width">
                <label>기존 비밀번호</label>
                <input type="password" v-model="pass.oldPassword" placeholder="현재 비밀번호를 입력하세요" />
              </div>
              <div class="input-group">
                <label>새 비밀번호</label>
                <input type="password" v-model="pass.newPassword" placeholder="변경할 비밀번호(8자 이상)" />
              </div>
              <div class="input-group">
                <label>비밀번호 확인</label>
                <input type="password" v-model="pass.confirm" placeholder="새 비밀번호를 다시 입력하세요" />
              </div>
            </div>
            <button type="button" class="pw-action-btn" @click="handleChangePassword">비밀번호 변경 적용</button>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <button class="submit-btn" @click="handleUpdateProfile">일반 정보 수정 저장</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authApi from '@/api/AuthApI';
import Swal from 'sweetalert2'; // 1. Swal 추가

const router = useRouter();

const selectedFileName = ref('');
const selectedFile = ref(null);

// 파일 선택 시 실행
const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    selectedFileName.value = file.name;
  }
};

// 유저 정보 상태
const info = reactive({
  email: '',
  company: '',
  businessNumber: '',
  name: '',
  phoneNumber: '',
  addressLine1: '',
  addressLine2: '',
  postalCode: '',
  fileId: null
});

// 비밀번호 변경 상태
const pass = reactive({
  oldPassword: '',
  newPassword: '',
  confirm: ''
});

// 1. 데이터 로드
onMounted(async () => {
  try {
    const response = await authApi.getMyInfo();
    const userData = response.data?.data || response.data;

    if (!userData) return;

    info.email = userData.email || '';
    info.company = userData.company || '';
    info.businessNumber = userData.businessNumber || '';
    info.name = userData.name || '';
    info.phoneNumber = userData.phoneNumber || '';
    info.addressLine1 = userData.addressLine1 || '';
    info.addressLine2 = userData.addressLine2 || '';
    info.postalCode = userData.postalCode || '';
    info.fileId = userData.fileId || userData.file_id || userData.businessFileId || null;

  } catch (error) {
    console.error("데이터 로드 에러:", error);
    Swal.fire({
      title: '로드 실패',
      text: '정보를 불러오는데 실패했습니다.',
      icon: 'error',
      confirmButtonColor: '#ef4444',
      borderRadius: '16px'
    });
  }
});

// 2. 중요 정보 수정 요청 (사업자 정보)
const handleBusinessUpdateReq = async () => {
  try {
    if (!selectedFile.value) {
      return Swal.fire({
        title: '파일 미첨부',
        text: '사업자 등록증 파일을 선택해주세요.',
        icon: 'warning',
        confirmButtonColor: '#11D411',
        borderRadius: '16px'
      });
    }

    const confirmResult = await Swal.fire({
      title: '수정 요청을 보내시겠습니까?',
      text: '관리자 승인 후 정보가 반영됩니다.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#11D411',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: '요청하기',
      cancelButtonText: '취소',
      reverseButtons: true,
      borderRadius: '16px'
    });

    if (!confirmResult.isConfirmed) return;

    const updateData = {
      requestCompany: info.company,
      requestBusinessNumber: info.businessNumber
    };

    await authApi.requestBusinessUpdate(updateData, selectedFile.value);

    Swal.fire({
      title: '요청 완료',
      text: '수정 요청이 관리자에게 전송되었습니다.',
      icon: 'success',
      confirmButtonColor: '#11D411',
      borderRadius: '16px'
    });
  } catch (error) {
    console.error("에러 발생:", error);
    Swal.fire({
      title: '요청 실패',
      text: '요청 처리 중 오류가 발생했습니다.',
      icon: 'error',
      confirmButtonColor: '#ef4444',
      borderRadius: '16px'
    });
  }
};

// 3. 일반 프로필 수정 저장
const handleUpdateProfile = async () => {
  try {
    await authApi.updateProfile({
      name: info.name,
      phoneNumber: info.phoneNumber,
      addressLine1: info.addressLine1,
      addressLine2: info.addressLine2,
      postalCode: info.postalCode
    });

    Swal.fire({
      title: '저장 완료',
      text: '개인 정보가 성공적으로 수정되었습니다.',
      icon: 'success',
      confirmButtonColor: '#11D411',
      timer: 1500,
      showConfirmButton: false,
      borderRadius: '16px'
    });
  } catch (error) {
    Swal.fire({
      title: '저장 실패',
      text: error.response?.data?.message || "정보 수정에 실패했습니다.",
      icon: 'error',
      confirmButtonColor: '#ef4444',
      borderRadius: '16px'
    });
  }
};

// 4. 비밀번호 변경 로직
const handleChangePassword = async () => {
  if (!pass.oldPassword || !pass.newPassword) {
    return Swal.fire({
      title: '입력 오류',
      text: '비밀번호를 입력해주세요.',
      icon: 'warning',
      confirmButtonColor: '#11D411',
      borderRadius: '16px'
    });
  }

  if (pass.newPassword !== pass.confirm) {
    return Swal.fire({
      title: '일치 확인',
      text: '새 비밀번호 확인이 일치하지 않습니다.',
      icon: 'warning',
      confirmButtonColor: '#11D411',
      borderRadius: '16px'
    });
  }

  try {
    await authApi.changePassword({
      oldPassword: pass.oldPassword,
      newPassword: pass.newPassword
    });

    await Swal.fire({
      title: '변경 완료',
      text: '보안을 위해 다시 로그인해주세요.',
      icon: 'success',
      confirmButtonColor: '#11D411',
      borderRadius: '16px'
    });

    localStorage.clear();
    router.push('/login');
  } catch (error) {
    Swal.fire({
      title: '변경 실패',
      text: error.response?.data?.message || "비밀번호 변경에 실패했습니다.",
      icon: 'error',
      confirmButtonColor: '#ef4444',
      borderRadius: '16px'
    });
  }
};
</script>

<style scoped>
.edit-info-container { padding: 0 30px 20px; max-width: 1300px; margin: 0 auto; }
.top-guide-text { font-size: 13px; color: #a0a0a0; margin: 10px 0 15px; }

.settings-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px); /* 화면 크기에 맞게 자동 조절 */
  overflow: hidden;
}

.scroll-area { flex: 1; overflow-y: auto; padding-bottom: 20px; }
.settings-section { padding: 30px 40px; }
.divider { height: 1px; background: #eee; margin: 10px 40px; }

.section-title { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; margin-bottom: 25px; color: #1a1a1a; }
.title-icon { width: 22px; height: 22px; }

.business-info-list { display: flex; flex-direction: column; gap: 20px; }
.personal-grid, .password-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 40px; }
.full-width { grid-column: span 2; }

.input-group label { display: block; font-size: 14px; font-weight: 700; margin-bottom: 8px; color: #333; }
.input-group input {
  width: 100%; height: 48px; padding: 0 15px;
  border: 1px solid #ddd; border-radius: 8px;
  font-size: 15px; outline: none; transition: 0.2s;
}
.input-group input:focus { border-color: #11D411; box-shadow: 0 0 0 4px rgba(17, 212, 17, 0.1); }
.disabled-input { background-color: #f9f9f9; color: #999; cursor: not-allowed; }

.input-with-btn { display: flex; gap: 10px; }
.request-btn {
  white-space: nowrap; background: #11D411; color: #fff; border: none;
  padding: 0 20px; border-radius: 8px; font-weight: 700; cursor: pointer;
}

.password-bg-area { background-color: #fcfcfc; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; margin: 20px 0; }
.pw-action-btn {
  margin-top: 20px; background: #374151; color: white; border: none;
  padding: 12px 25px; border-radius: 8px; font-weight: 600; cursor: pointer;
}

.card-footer {
  padding: 20px 40px; display: flex; justify-content: flex-end;
  background: #fff; border-top: 1px solid #eee;
}
.submit-btn {
  background: #11D411; color: #fff; border: none; padding: 14px 60px;
  border-radius: 8px; font-size: 16px; font-weight: 700; cursor: pointer;
}

.side-info { font-size: 12px; color: #999; margin-top: 5px; }

/* 스크롤바 커스텀 */
.scroll-area::-webkit-scrollbar { width: 6px; }
.scroll-area::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }

.hidden-file-input { display: none; }
.file-custom-btn {
  display: inline-block;
  padding: 12px 20px;
  background: #f1f3f5;
  border: 1px dashed #adb5bd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
}
.file-custom-btn:hover { background: #e9ecef; }
.file-upload-wrapper { margin-top: 5px; }
</style>