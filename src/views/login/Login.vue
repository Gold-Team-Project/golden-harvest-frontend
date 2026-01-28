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
          <h1 class="title">Empowering Sustainable<br />Harvest Trading</h1>
          <p class="subtitle">Connect directly with premium agricultural and fishery producers through our secure B2B portal.</p>
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-wrapper">
        <h2 class="form-title">파트너 로그인</h2>
        <p class="form-desc">
          다시 오신 것을 환영합니다. <br /> 액세스하려면 비즈니스 세부 정보를 입력하세요.
        </p>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="input-group">
            <label>이메일</label>
            <input v-model="loginForm.email" type="email" placeholder="이메일을 입력하세요" required />
          </div>

          <div class="input-group">
            <label>비밀번호</label>
            <input v-model="loginForm.password" type="password" placeholder="비밀번호를 입력하세요" required />
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="loginForm.rememberMe" />
              <span>로그인 유지</span>
            </label>
            <router-link to="/find-password" class="find-link">비밀번호 찾기</router-link>
          </div>

          <button type="submit" class="login-submit-btn">로그인</button>
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
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode'; // ✅ 추가
import authApi from '@/api/AuthApI.js';

const router = useRouter();
const loginForm = reactive({ email: '', password: '' });

const handleLogin = async () => {
  try {
    const res = await authApi.login(loginForm);

    // 1. 토큰 저장
    const { accessToken, refreshToken } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // 2. 토큰 해독하여 권한 확인
    const decoded = jwtDecode(accessToken);
    console.log('디코딩된 토큰:', decoded); // 👈 여기서 role 필드명을 확인하세요 (예: role, auth, roles 등)

    // 3. 권한에 따른 라우팅 (백엔드 Role 이름과 대조하세요)
    if (decoded.role === 'ROLE_ADMIN') {
      alert("관리자 페이지로 이동합니다.");
      router.push('/admin'); // 관리자 전용 경로
    } else {
      alert("로그인에 성공했습니다!");
      router.push('/'); // 일반 유저 메인
    }

  } catch (error) {
    console.error("로그인 실패:", error);
    alert(error.response?.data?.message || "이메일 또는 비밀번호를 확인하세요.");
  }
};
</script>

<style scoped>
/* 1. 전체 레이아웃 (Signup과 동일) */
.login-container { display: flex; width: 100vw; height: 100vh; overflow: hidden; }

/* 2. 왼쪽 이미지 섹션 (Signup과 동일) */
.image-section { position: relative; width: 38%; height: 100%; background-color: #0A2310; }
.top-brand { position: absolute; top: 40px; left: 50px; z-index: 20; color: white; font-size: 1.8rem; font-weight: 800; }
.bg-image { width: 100%; height: 100%; object-fit: cover; opacity: 0.7; }
.overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10, 35, 16, 0.9) 15%, transparent 50%); display: flex; flex-direction: column; justify-content: flex-end; padding: 60px 50px; }
.logo-wrapper { width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
.leaf-icon { width: 24px; height: 24px; background-color: #11D411; border-radius: 0 12px 0 12px; }
.title { color: white; font-size: 2.2rem; font-weight: 800; margin-bottom: 12px; line-height: 1.2; }
.subtitle { color: #ccc; font-size: 1rem; line-height: 1.5; }

/* 3. 오른쪽 폼 섹션 (Signup의 800px 비율 이식) */
.form-section { width: 62%; background: #F6F8F6; display: flex; align-items: center; justify-content: center; }
.form-wrapper {
  width: 100%;
  max-width: 800px; /* Signup과 동일하게 확장 */
  padding: 0 60px;
  box-sizing: border-box;
}

.form-title { font-size: 2.4rem; font-weight: 700; margin-bottom: 4px; color: #1a1a1a; }
.form-desc { color: #777; margin-bottom: 30px; font-size: 1.05rem; line-height: 1.4; }

/* 4. 입력창 및 Focus 효과 (Signup과 동일) */
.input-group { margin-bottom: 20px; width: 100%; }
label { display: block; font-weight: 600; margin-bottom: 8px; font-size: 14px; color: #333; }
input[type="email"], input[type="password"] {
  width: 100%; padding: 13px 20px;
  border: 1px solid #C8E4C8; border-radius: 10px;
  font-size: 14px; outline: none; transition: all 0.2s; background: white; box-sizing: border-box;
}
input:focus {
  border-color: #11D411 !important;
  box-shadow: 0 0 0 3px rgba(17, 212, 17, 0.05);
}

/* 5. 로그인 전용 옵션 (체크박스 및 링크) */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  font-size: 14px;
}
.checkbox-label { display: flex; align-items: center; gap: 8px; color: #555; cursor: pointer; }
.checkbox-label input { width: 16px; height: 16px; cursor: pointer; accent-color: #11D411; }
.find-link { color: #11D411; font-weight: 700; text-decoration: none; }
.find-link:hover { text-decoration: underline; }

/* 6. 로그인 버튼 (Signup 버튼 스타일과 통일) */
.login-submit-btn {
  width: 100%; background-color: #11D411; color: white; padding: 16px;
  border: none; border-radius: 12px; font-weight: 700; font-size: 17px; cursor: pointer; margin-top: 5px;
}
.login-submit-btn:hover { background-color: #0fb80f; }
.login-submit-btn:active { transform: scale(0.98); }

/* 7. 하단 푸터 (Signup과 동일한 간격) */
.simple-line { width: 100%; height: 1px; background-color: #C9E5C9; margin: 35px 0 20px 0; }
.form-footer { text-align: center; }
.signup-link { color: #11D411; font-weight: 700; text-decoration: none; margin-left: 5px; }
.signup-link:hover { text-decoration: underline; }
.support-text { margin-top: 20px; color: #bbb; font-size: 12px; }

/* 반응형 대비 */
@media (max-height: 800px) {
  .form-section { overflow-y: auto; align-items: flex-start; padding: 50px 0; }
}
</style>