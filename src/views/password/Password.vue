<template>
  <div class="login-container">
    <div class="image-section">
      <div class="top-brand">Golden Harvest</div>

      <div class="image-placeholder">
        <div ref="lottieContainer" class="lottie-ani"></div>
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
              <input v-model="form.email" type="email" placeholder="이메일을 입력하세요" :disabled="isVerified" required />
              <button type="button" class="verify-btn" @click="handleSendCode" :disabled="isVerified">
                {{ isCodeSent ? '재발송' : '인증' }}
              </button>
            </div>
          </div>

          <div class="input-group" v-if="isCodeSent">
            <label>인증번호</label>
            <div class="input-with-button">
              <input v-model="form.verifyCode" type="text" placeholder="인증번호 6자리를 입력하세요" :disabled="isVerified" />
              <button type="button" class="verify-btn check-btn" @click="handleVerifyCode" v-if="!isVerified">확인</button>
              <button type="button" class="verify-btn success-btn" v-else disabled>완료</button>
            </div>
          </div>

          <div v-if="isVerified">
            <div class="input-group">
              <label>새로운 비밀번호</label>
              <input v-model="form.newPassword" type="password" placeholder="8~20자 사이로 입력하세요" required />
            </div>

            <div class="input-group">
              <label>비밀번호 확인</label>
              <input v-model="form.passwordConfirm" type="password" placeholder="비밀번호를 다시 입력하세요" required />
            </div>

            <button type="submit" class="reset-submit-btn">
              비밀번호 재설정 &nbsp; →
            </button>
          </div>
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
import { reactive, ref, onMounted } from 'vue'; // onMounted 추가
import { useRouter } from 'vue-router';
import authApi from '@/api/AuthApI';
import Swal from 'sweetalert2';
import lottie from 'lottie-web'; // lottie 추가
import harvestAni from '@/assets/lottie/harvest.json'; // 애니메이션 파일

const router = useRouter();
const isCodeSent = ref(false);
const isVerified = ref(false);
const lottieContainer = ref(null); // 로티 ref 추가

const form = reactive({
  email: '',
  verifyCode: '',
  newPassword: '',
  passwordConfirm: ''
});

// 로티 애니메이션 로드
onMounted(() => {
  if (lottieContainer.value) {
    lottie.loadAnimation({
      container: lottieContainer.value,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: harvestAni
    });
  }
});

// 1. 인증번호 발송 함수
const handleSendCode = async () => {
  if (!form.email) {
    return Swal.fire({
      title: '이메일 미입력',
      text: '인증번호를 받을 이메일을 입력해주세요.',
      icon: 'warning',
      confirmButtonColor: '#11D411',
      borderRadius: '16px'
    });
  }

  try {
    await authApi.sendEmail({ email: form.email, type: 'PASSWORD_RESET' });
    isCodeSent.value = true;

    Swal.fire({
      title: '발송 완료',
      text: '인증번호가 발송되었습니다. 메일을 확인해주세요.',
      icon: 'success',
      confirmButtonColor: '#11D411',
      borderRadius: '16px'
    });
  } catch (error) {
    Swal.fire({
      title: '발송 실패',
      text: error.response?.data?.message || "인증번호 발송에 실패했습니다.",
      icon: 'error',
      confirmButtonColor: '#ef4444',
      borderRadius: '16px'
    });
  }
};

// 2. 인증번호 확인 함수
const handleVerifyCode = async () => {
  if (!form.verifyCode) {
    return Swal.fire({
      title: '번호 미입력',
      text: '인증번호 6자리를 입력해주세요.',
      icon: 'warning',
      confirmButtonColor: '#11D411',
      borderRadius: '16px'
    });
  }

  try {
    await authApi.verifyEmail(form.email, form.verifyCode);
    isVerified.value = true;

    Swal.fire({
      title: '인증 성공',
      text: '이메일 인증이 완료되었습니다. 새 비밀번호를 설정해주세요.',
      icon: 'success',
      confirmButtonColor: '#11D411',
      borderRadius: '16px'
    });
  } catch (error) {
    Swal.fire({
      title: '인증 실패',
      text: error.response?.data?.message || "인증번호가 일치하지 않습니다.",
      icon: 'error',
      confirmButtonColor: '#ef4444',
      borderRadius: '16px'
    });
  }
};

// 3. 비밀번호 재설정 최종 제출
const handleResetPassword = async () => {
  if (!isVerified.value) {
    return Swal.fire({
      title: '인증 필요',
      text: '이메일 인증을 먼저 완료해주세요.',
      icon: 'warning',
      confirmButtonColor: '#11D411',
      borderRadius: '16px'
    });
  }

  if (form.newPassword !== form.passwordConfirm) {
    return Swal.fire({
      title: '비밀번호 불일치',
      text: '입력하신 두 비밀번호가 서로 다릅니다.',
      icon: 'error',
      confirmButtonColor: '#ef4444',
      borderRadius: '16px'
    });
  }

  try {
    await authApi.resetPassword({
      email: form.email,
      newPassword: form.newPassword
    });

    await Swal.fire({
      title: '재설정 완료',
      text: '비밀번호가 성공적으로 변경되었습니다. 다시 로그인해 주세요.',
      icon: 'success',
      confirmButtonColor: '#11D411',
      borderRadius: '16px'
    });

    router.push('/login');
  } catch (error) {
    Swal.fire({
      title: '재설정 실패',
      text: error.response?.data?.message || "비밀번호 재설정 중 오류가 발생했습니다.",
      icon: 'error',
      confirmButtonColor: '#ef4444',
      borderRadius: '16px'
    });
  }
};
</script>

<style scoped>
/* 공통 레이아웃 */
.login-container { display: flex; width: 100vw; height: 100vh; overflow: hidden; }

/* 왼쪽 섹션 - 로티 배치 */
.image-section { position: relative; width: 38%; height: 100%; background-color: #0A2310; overflow: hidden; }
.top-brand { position: absolute; top: 40px; left: 50px; z-index: 20; color: white; font-size: 1.8rem; font-weight: 800; }

.image-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.lottie-ani { width: 130%; height: auto; opacity: 0.7; }

.overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10, 35, 16, 0.9) 15%, transparent 50%); display: flex; flex-direction: column; justify-content: flex-end; padding: 60px 50px; z-index: 10; }
.logo-wrapper { width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
.leaf-icon { width: 24px; height: 24px; background-color: #11D411; border-radius: 0 12px 0 12px; }
.title { color: white; font-size: 2.2rem; font-weight: 800; margin-bottom: 12px; line-height: 1.2; }
.subtitle { color: #ccc; font-size: 1rem; line-height: 1.5; }

/* 오른쪽 폼 섹션 - 원본 스타일 유지 */
.form-section { width: 62%; background: #F6F8F6; display: flex; align-items: center; justify-content: center; }
.form-wrapper { width: 100%; max-width: 800px; padding: 0 60px; box-sizing: border-box; }
.form-title { font-size: 2.4rem; font-weight: 700; margin-bottom: 4px; color: #1a1a1a; }
.form-desc { color: #777; margin-bottom: 30px; font-size: 1.05rem; }

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

.input-with-button { display: flex; gap: 12px; }
.input-with-button input { flex: 1; }
.verify-btn { width: 100px; background-color: #11D411; color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 14px; }
.verify-btn:hover { background-color: #0fb80f; }
.verify-btn:active { transform: scale(0.98); }

.reset-submit-btn {
  width: 100%; background-color: #11D411; color: white; padding: 16px;
  border: none; border-radius: 12px; font-weight: 700; font-size: 17px; cursor: pointer; margin-top: 10px;
}
.reset-submit-btn:hover { background-color: #0fb80f; }
.reset-submit-btn:active { transform: scale(0.98); }

.simple-line { width: 100%; height: 1px; background-color: #C9E5C9; margin: 30px 0 20px 0; }
.form-footer { text-align: center; }
.back-link {
  color: #555; font-weight: 600; text-decoration: none; font-size: 15px;
  display: inline-flex; align-items: center; gap: 8px; transition: color 0.2s;
}
.back-link:hover { color: #11D411; }
.support-text { margin-top: 20px; color: #bbb; font-size: 12px; }

@media (max-height: 850px) {
  .form-section { overflow-y: auto; align-items: flex-start; padding: 50px 0; }
}
</style>