<template>
  <div class="login-container">
    <div class="image-section">
      <div class="top-brand">Golden Harvest</div>

      <div class="image-placeholder">
        <div ref="lottieContainer" class="lottie-ani"></div>
      </div>

      <div class="overlay">
        <div class="content-box fade-in-up">
          <div class="logo-wrapper pulse">
            <div class="leaf-icon"></div>
          </div>
          <h1 class="title">Empowering Sustainable<br />Harvest Trading</h1>
          <p class="subtitle">Connect directly with premium agricultural and fishery producers through our secure B2B portal.</p>
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-wrapper fade-in-up delay-1">
        <h2 class="form-title">파트너 로그인</h2>
        <p class="form-desc">
          다시 오신 것을 환영합니다. <br />
          비즈니스의 성장을 돕는 Golden Harvest와 함께하세요.
        </p>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="input-group">
            <label>이메일</label>
            <input
                v-model="loginForm.email"
                type="email"
                placeholder="이메일을 입력하세요"
                required
                class="interactive-input"
            />
          </div>

          <div class="input-group">
            <label>비밀번호</label>
            <input
                v-model="loginForm.password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                required
                class="interactive-input"
            />
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="loginForm.rememberMe" />
              <span>로그인 유지</span>
            </label>
            <router-link to="/password" class="find-link">비밀번호 찾기</router-link>
          </div>

          <button type="submit" class="login-submit-btn">
            <span class="btn-text">로그인</span>
            <div class="btn-glow"></div>
          </button>
        </form>

        <div class="simple-line"></div>

        <div class="form-footer">
          <p>아직 파트너가 아니신가요? <router-link to="/signup" class="signup-link">회원가입</router-link></p>
          <p class="support-text">Need help? Call B2B Support: 070-1234-5678</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
import authApi from '@/api/AuthApI.js';
import Swal from 'sweetalert2';
import lottie from 'lottie-web';
import harvestAni from '@/assets/lottie/harvest.json';

const router = useRouter();
const lottieContainer = ref(null);
const loginForm = reactive({ email: '', password: '', rememberMe: false });

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

const handleLogin = async () => {
  try {
    const res = await authApi.login(loginForm);
    const { accessToken, refreshToken } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    const decoded = jwtDecode(accessToken);

    if (decoded.role === 'ROLE_ADMIN') {
      await Swal.fire({
        title: '관리자 인증 성공',
        text: '관리자 전용 페이지로 이동합니다.',
        icon: 'success',
        confirmButtonColor: '#11D411',
        borderRadius: '16px'
      });
      router.push('/admin');
    } else {
      await Swal.fire({
        title: '로그인 성공',
        text: '오늘도 즐거운 하루 되세요!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        borderRadius: '16px'
      });
      router.push('/');
    }
  } catch (error) {
    Swal.fire({
      title: '로그인 실패',
      text: error.response?.data?.message || "이메일 또는 비밀번호를 확인하세요.",
      icon: 'error',
      confirmButtonColor: '#ef4444',
      borderRadius: '16px'
    });
  }
};
</script>

<style scoped>
/* 1. 기본 레이아웃 - 원본 유지 */
.login-container { display: flex; width: 100vw; height: 100vh; overflow: hidden; background-color: #F6F8F6; }

/* 2. 왼쪽 이미지 섹션 - 원본 구조 유지하되 lottie 전용 스타일만 추가 */
.image-section { position: relative; width: 38%; height: 100%; background-color: #0A2310; overflow: hidden; }
.top-brand { position: absolute; top: 40px; left: 50px; z-index: 20; color: white; font-size: 1.8rem; font-weight: 800; letter-spacing: -0.5px; }

/* 애니메이션을 기존 img와 동일한 위치에 배치 */
.image-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.lottie-ani { width: 130%; height: auto; opacity: 0.7; }

.overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10, 35, 16, 0.9) 10%, transparent 60%); display: flex; flex-direction: column; justify-content: flex-end; padding: 60px 50px; z-index: 10; }

/* 로고 맥박 효과 및 기타 텍스트 스타일 - 원본 유지 */
.logo-wrapper { width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
.pulse { animation: pulse-green 2s infinite; }
@keyframes pulse-green {
  0% { box-shadow: 0 0 0 0 rgba(17, 212, 17, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(17, 212, 17, 0); }
  100% { box-shadow: 0 0 0 0 rgba(17, 212, 17, 0); }
}
.leaf-icon { width: 24px; height: 24px; background-color: #11D411; border-radius: 0 12px 0 12px; }
.title { color: white; font-size: 2.2rem; font-weight: 800; margin-bottom: 12px; line-height: 1.2; }
.subtitle { color: rgba(255, 255, 255, 0.7); font-size: 1rem; line-height: 1.5; }

/* 3. 오른쪽 폼 섹션 - 사용자가 제공한 원본 스타일 100% 동일 */
.form-section {
  width: 62%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: radial-gradient(#e0ece0 0.5px, transparent 0.5px);
  background-size: 30px 30px;
}
.form-wrapper { width: 100%; max-width: 500px; padding: 0 40px; }

.fade-in-up { opacity: 0; transform: translateY(20px); animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.delay-1 { animation-delay: 0.15s; }

@keyframes fadeInUp {
  to { opacity: 1; transform: translateY(0); }
}

.form-title { font-size: 2.4rem; font-weight: 700; margin-bottom: 8px; color: #1a1a1a; letter-spacing: -1px; }
.form-desc { color: #666; margin-bottom: 35px; font-size: 1.05rem; line-height: 1.5; }

.input-group { margin-bottom: 22px; }
label { display: block; font-weight: 600; margin-bottom: 8px; font-size: 14px; color: #444; }
.interactive-input {
  width: 100%; padding: 14px 20px;
  border: 1px solid #D1E5D1; border-radius: 12px;
  font-size: 15px; outline: none; transition: all 0.3s ease; background: white; box-sizing: border-box;
}
.interactive-input:focus {
  border-color: #11D411;
  box-shadow: 0 0 0 4px rgba(17, 212, 17, 0.1);
  transform: translateY(-2px);
}

.form-options { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; font-size: 14px; }
.checkbox-label { display: flex; align-items: center; gap: 8px; color: #555; cursor: pointer; transition: color 0.2s; }
.checkbox-label:hover { color: #11D411; }
.checkbox-label input { width: 18px; height: 18px; cursor: pointer; accent-color: #11D411; }
.find-link { color: #11D411; font-weight: 700; text-decoration: none; transition: 0.2s; }
.find-link:hover { text-decoration: underline; opacity: 0.8; }

.login-submit-btn {
  position: relative; width: 100%; background-color: #11D411; color: white; padding: 16px;
  border: none; border-radius: 14px; font-weight: 700; font-size: 18px; cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden; box-shadow: 0 4px 12px rgba(17, 212, 17, 0.2);
}
.login-submit-btn:hover {
  background-color: #0fb80f;
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 10px 20px rgba(17, 212, 17, 0.3);
}

.btn-glow {
  position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  opacity: 0; transition: opacity 0.3s; pointer-events: none;
}
.login-submit-btn:hover .btn-glow { opacity: 1; }

.simple-line { width: 100%; height: 1px; background-color: #E0EBE0; margin: 35px 0 25px 0; }
.form-footer { text-align: center; }
.signup-link { color: #11D411; font-weight: 800; text-decoration: none; margin-left: 6px; padding: 2px 4px; border-radius: 4px; transition: 0.2s; }
.signup-link:hover { background: rgba(17, 212, 17, 0.1); }
.support-text { margin-top: 25px; color: #aaa; font-size: 12px; }

@media (max-width: 1024px) {
  .image-section { display: none; }
  .form-section { width: 100%; }
}
</style>