<template>
  <div class="login-container">
    <div class="image-section">
      <div class="top-brand">Golden Harvest</div>
      <div class="image-placeholder">
        <img src="@/assets/login.svg" alt="Background" class="bg-image" />
      </div>
      <div class="overlay">
        <div class="content-box">
          <div class="logo-wrapper"><div class="leaf-icon"></div></div>
          <h1 class="title">Join Our Sustainable<br />Harvest Network</h1>
          <p class="subtitle">Register as a partner to connect directly with premium agricultural producers.</p>
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-wrapper">
        <h2 class="form-title">새로운 파트너</h2>
        <p class="form-desc">비즈니스 세부 정보를 입력하여 새 파트너 계정을 만드세요.</p>

        <form @submit.prevent="handleSignup" class="signup-form"><div class="input-group">
          <label>이메일</label>
          <div class="input-with-button">
            <input v-model="form.email" type="email" placeholder="이메일을 입력하세요" required />
            <button type="button" class="verify-btn" @click="handleSendVerification">인증</button>
          </div>
        </div>

          <div class="input-group">
            <label>인증번호</label>
            <div class="input-with-button">
              <input v-model="form.verifyCode" type="text" placeholder="인증번호를 입력하세요" />
              <button type="button" class="verify-btn" @click="handleVerifyCode" :disabled="!form.verifyCode">확인</button>
            </div>
          </div>

          <div class="input-group">
            <label>상호명</label>
            <input v-model="form.businessName" type="text" placeholder="상호명을 입력하세요" />
          </div>

          <div class="row-group">
            <div class="input-column">
              <label>담당자 이름</label>
              <input v-model="form.managerName" type="text" placeholder="이름" />
            </div>
            <div class="input-column">
              <label>핸드폰 번호</label>
              <input v-model="form.phone" type="tel" placeholder="번호 입력" />
            </div>
          </div>

          <div class="input-group">
            <label>사업자 등록증 첨부</label>
            <div class="file-upload-container">
              <div class="file-info-box">
                <label for="file-input-id" class="file-select-label">파일 선택</label>
                <span class="file-name-text">{{ fileName || '선택된 파일 없음' }}</span>
                <input type="file" id="file-input-id" @change="handleFileUpload" hidden />
              </div>
              <button type="button" class="upload-btn" @click="$refs.fileInput.click()">업로드</button>
            </div>
          </div>

          <div class="input-group">
            <label>첨부 파일 정보</label>
            <input :value="fileName" type="text" readonly placeholder="파일을 업로드해주세요" />
            <input type="file" ref="fileInput" @change="handleFileUpload" hidden />
          </div>

          <div class="row-group">
            <div class="input-column">
              <label>비밀번호</label>
              <input v-model="form.password" type="password" placeholder="비밀번호" />
            </div>
            <div class="input-column">
              <label>비밀번호 확인</label>
              <input v-model="form.passwordConfirm" type="password" placeholder="비밀번호 확인" />
            </div>
          </div>

          <button type="submit" class="signup-submit-btn">회원가입</button>
        </form>

        <div class="simple-line"></div>
        <div class="form-footer">
          <p>이미 파트너입니까? <router-link to="/login" class="login-link">로그인</router-link></p>
          <p class="support-text">Need help? Call B2B Support: 070-1234-5678</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import authApi from '@/api/AuthApI.js';

const form = reactive({
  email: '',
  verifyCode: '',
  businessName: '',
  managerName: '',
  phone: '',
  password: '',
  passwordConfirm: ''
});

const fileName = ref('');
const selectedFile = ref(null);

// 1. 파일 선택 핸들러
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    fileName.value = file.name;
    selectedFile.value = file; // 파일 객체 저장
  }
};

// 2. 이메일 인증번호 발송
const handleSendVerification = async () => {
  if (!form.email) {
    alert("이메일을 먼저 입력해주세요.");
    return;
  }
  try {
    const res = await authApi.sendEmail({
      email: form.email,
      type: 'signup'
    });
    alert(res.message || "인증번호가 발송되었습니다.");
  } catch (error) {
    console.error("인증번호 발송 실패:", error);
    alert(error.response?.data?.message || "발송 실패");
  }
};

// 3. 이메일 인증번호 확인
const handleVerifyCode = async () => {
  try {
    const res = await authApi.verifyEmail(form.email, form.verifyCode);
    alert("이메일 인증에 성공하였습니다.");
  } catch (error) {
    alert("인증번호가 일치하지 않습니다.");
  }
};

// 4. 회원가입 제출
const handleSignup = async () => {
  if (form.password !== form.passwordConfirm) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }
  if (!selectedFile.value) {
    alert("사업자 등록증 파일을 업로드해주세요.");
    return;
  }

  try {
    // 백엔드 DTO 필드명(SignUpRequest)에 맞춰 데이터 구성
    const signUpData = {
      email: form.email,
      password: form.password,
      company: form.businessName,
      businessNumber: '1234567890', // 예시 (패턴 @Pattern(regexp = "^\\d{10}$") 준수 필요)
      name: form.managerName,
      phoneNumber: form.phone
    };

    const res = await authApi.signup(signUpData, selectedFile.value);
    alert(res.message || "회원가입 신청이 완료되었습니다.");
  } catch (error) {
    console.error("회원가입 실패:", error);
    alert(error.response?.data?.message || "회원가입 중 에러가 발생했습니다.");
  }
};
</script>

<style scoped>
.login-container { display: flex; width: 100vw; height: 100vh; overflow: hidden; }

/* 왼쪽 이미지 섹션 */
.image-section { position: relative; width: 38%; height: 100%; background-color: #0A2310; }
.top-brand { position: absolute; top: 40px; left: 50px; z-index: 20; color: white; font-size: 1.8rem; font-weight: 800; }
.bg-image { width: 100%; height: 100%; object-fit: cover; opacity: 0.7; }
.overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10, 35, 16, 0.9) 15%, transparent 50%); display: flex; flex-direction: column; justify-content: flex-end; padding: 60px 50px; }
.logo-wrapper { width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
.leaf-icon { width: 24px; height: 24px; background-color: #11D411; border-radius: 0 12px 0 12px; }
.title { color: white; font-size: 2.2rem; font-weight: 800; margin-bottom: 12px; line-height: 1.2; }
.subtitle { color: #ccc; font-size: 1rem; line-height: 1.5; }

/* 오른쪽 폼 섹션 - 높이 미세 조정 */
.form-section { width: 62%; background: #F6F8F6; display: flex; align-items: center; justify-content: center; }
.form-wrapper {
  width: 100%;
  max-width: 800px;
  padding: 0 60px;
  box-sizing: border-box;
}

.form-title { font-size: 2.4rem; font-weight: 700; margin-bottom: 4px; color: #1a1a1a; }
.form-desc { color: #777; margin-bottom: 22px; font-size: 1.05rem; }

/* 인풋 디자인 복구 (여유 있게) */
.input-group, .input-column { margin-bottom: 14px; width: 100%; }
label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; color: #333; }
input {
  width: 100%; padding: 13px 20px;
  border: 1px solid #C8E4C8; border-radius: 10px;
  font-size: 14px; outline: none; transition: all 0.2s; background: white; box-sizing: border-box;
}
input:focus { border-color: #11D411 !important; box-shadow: 0 0 0 3px rgba(17, 212, 17, 0.05); }

.input-with-button { display: flex; gap: 12px; }
.verify-btn { width: 100px; background-color: #11D411; color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 14px; }
.verify-btn:hover { background-color: #0fb80f; }
.verify-btn:active { transform: scale(0.98); }
.row-group { display: flex; gap: 20px; margin-bottom: 14px; width: 100%; }
.input-column { flex: 1; min-width: 0; }

.file-upload-container { display: flex; gap: 12px; width: 100%; }
.file-info-box { flex: 1; display: flex; align-items: center; background: white; border: 1px solid #C8E4C8; border-radius: 10px; padding: 0 15px; height: 48px; box-sizing: border-box; }
.file-select-label { background: #E2E8F0; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; color: #444; font-weight: 700; margin-right: 12px; margin-bottom: 0; }
.upload-btn { width: 100px; background-color: #11D411; color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 14px; }
.upload-btn:hover { background-color: #0fb80f; }
.upload-btn:active { transform: scale(0.98); }

/* 하단 영역 미세 압축 */
.signup-submit-btn {
  width: 100%; background-color: #11D411; color: white; padding: 16px;
  border: none; border-radius: 12px; font-weight: 700; font-size: 17px; cursor: pointer; margin-top: 5px;
}
.simple-line { width: 100%; height: 1px; background-color: #C9E5C9; margin: 25px 0 15px 0; }
.form-footer { text-align: center; }
.support-text { margin-top: 15px; color: #bbb; font-size: 12px; }
.signup-submit-btn:hover { background-color: #0fb80f; }
.signup-submit-btn:active { transform: scale(0.98); }

/* 반응형 대비 */
@media (max-height: 880px) {
  .form-section { overflow-y: auto; align-items: flex-start; padding: 40px 0; }
}
</style>