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
        <h2 class="form-title">비밀번호 찾기</h2>
        <p class="form-desc">가입하신 이메일을 통해 본인 인증 후 비밀번호를 재설정하세요.</p>

        <form @submit.prevent="handleResetPassword" class="find-form">
          <div class="input-group">
            <label>이메일 주소</label>
            <div class="input-with-button">
              <input v-model="form.email" type="email" placeholder="이메일을 입력하세요" required />
              <button type="button" class="verify-btn">인증</button>
            </div>
          </div>

          <div class="input-group">
            <label>인증번호</label>
            <input v-model="form.verifyCode" type="text" placeholder="인증번호를 입력하세요" />
          </div>

          <div class="input-group">
            <label>새로운 비밀번호</label>
            <input v-model="form.newPassword" type="password" placeholder="새로운 비밀번호를 입력하세요" />
          </div>

          <div class="input-group">
            <label>비밀번호 확인</label>
            <input v-model="form.passwordConfirm" type="password" placeholder="비밀번호를 다시 입력하세요" />
          </div>

          <button type="submit" class="reset-submit-btn">
            비밀번호 재설정 &nbsp; →
          </button>
        </form>

        <div class="simple-line"></div>
        <div class="form-footer">
          <router-link to="/login" class="back-link">
            <span>←</span> 로그인 페이지로 돌아가기
          </router-link>
          <p class="support-text">Need help? Call B2B Support: 070-1234-5678</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const form = reactive({
  email: '',
  verifyCode: '',
  newPassword: '',
  passwordConfirm: ''
});

const handleResetPassword = () => {
  console.log('Password reset attempt:', form);
};
</script>

<style scoped>
/* 1. 공통 레이아웃 (Signup/Login과 100% 동일) */
.login-container { display: flex; width: 100vw; height: 100vh; overflow: hidden; }

/* 2. 왼쪽 이미지 섹션 */
.image-section { position: relative; width: 38%; height: 100%; background-color: #0A2310; }
.top-brand { position: absolute; top: 40px; left: 50px; z-index: 20; color: white; font-size: 1.8rem; font-weight: 800; }
.bg-image { width: 100%; height: 100%; object-fit: cover; opacity: 0.7; }
.overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10, 35, 16, 0.9) 15%, transparent 50%); display: flex; flex-direction: column; justify-content: flex-end; padding: 60px 50px; }
.logo-wrapper { width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
.leaf-icon { width: 24px; height: 24px; background-color: #11D411; border-radius: 0 12px 0 12px; }
.title { color: white; font-size: 2.2rem; font-weight: 800; margin-bottom: 12px; line-height: 1.2; }
.subtitle { color: #ccc; font-size: 1rem; line-height: 1.5; }

/* 3. 오른쪽 폼 섹션 (800px 광폭 비율 이식) */
.form-section { width: 62%; background: #F6F8F6; display: flex; align-items: center; justify-content: center; }
.form-wrapper {
  width: 100%;
  max-width: 800px;
  padding: 0 60px;
  box-sizing: border-box;
}

.form-title { font-size: 2.4rem; font-weight: 700; margin-bottom: 4px; color: #1a1a1a; }
.form-desc { color: #777; margin-bottom: 30px; font-size: 1.05rem; }

/* 4. 입력창 및 Focus 효과 */
.input-group { margin-bottom: 16px; width: 100%; }
label { display: block; font-weight: 600; margin-bottom: 8px; font-size: 14px; color: #333; }
input {
  width: 100%; padding: 13px 20px;
  border: 1px solid #C8E4C8; border-radius: 10px;
  font-size: 14px; outline: none; transition: all 0.2s; background: white; box-sizing: border-box;
}
input:focus {
  border-color: #11D411 !important;
  box-shadow: 0 0 0 3px rgba(17, 212, 17, 0.05);
}

/* 인증 버튼 */
.input-with-button { display: flex; gap: 12px; }
.input-with-button input { flex: 1; }
.verify-btn { width: 100px; background-color: #11D411; color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 14px; }

/* 5. 재설정 버튼 (Signup 스타일) */
.reset-submit-btn {
  width: 100%; background-color: #11D411; color: white; padding: 16px;
  border: none; border-radius: 12px; font-weight: 700; font-size: 17px; cursor: pointer; margin-top: 10px;
}
.reset-submit-btn:hover { background-color: #0fb80f; }
.reset-submit-btn:active { transform: scale(0.98); }

/* 6. 하단 푸터 및 링크 */
.simple-line { width: 100%; height: 1px; background-color: #C9E5C9; margin: 30px 0 20px 0; }
.form-footer { text-align: center; }
.back-link {
  color: #555; font-weight: 600; text-decoration: none; font-size: 15px;
  display: inline-flex; align-items: center; gap: 8px; transition: color 0.2s;
}
.back-link:hover { color: #11D411; }
.support-text { margin-top: 20px; color: #bbb; font-size: 12px; }

/* 반응형 대비 */
@media (max-height: 850px) {
  .form-section { overflow-y: auto; align-items: flex-start; padding: 50px 0; }
}
</style>