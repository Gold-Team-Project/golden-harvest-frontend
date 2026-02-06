<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { jwtDecode } from 'jwt-decode'
import Swal from 'sweetalert2' // SweetAlert2 임포트

const userStore = useUserStore()
const router = useRouter()
let checkInterval = null

// 토큰 만료 체크 함수
const checkTokenExpiration = () => {
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) {
    try {
      const decoded = jwtDecode(accessToken)
      const currentTime = Math.floor(Date.now() / 1000)

      // 만료되었으면 즉시 로그아웃 처리
      if (decoded.exp < currentTime) {
        handleAutoLogout()
      }
    } catch (e) {
      handleAutoLogout()
    }
  }
}

// 자동 로그아웃 처리
const handleAutoLogout = async () => {
  if (checkInterval) clearInterval(checkInterval)

  // [수정] SweetAlert2 적용
  await Swal.fire({
    title: '세션 만료',
    text: '보안을 위해 자동으로 로그아웃되었습니다. 다시 로그인해주세요.',
    icon: 'warning',
    confirmButtonColor: '#22c55e', // GoldenHarvest 포인트 컬러
    confirmButtonText: '확인',
    allowOutsideClick: false // 외부 클릭으로 닫히지 않게 설정
  })

  // 알림창 확인 버튼을 누른 후 실행됨
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')

  // 유저 스토어 초기화
  if (userStore.logout) {
    userStore.logout()
  }

  router.push('/login')
}

onMounted(() => {
  // 1. 기존 유저 정보 가져오기
  userStore.fetchMe()

  // 2. 30초마다 토큰 만료 여부 감시 시작
  checkTokenExpiration()
  checkInterval = setInterval(checkTokenExpiration, 30000)
})

onUnmounted(() => {
  if (checkInterval) clearInterval(checkInterval)
})
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
/* SweetAlert2 전역 폰트 및 스타일 미세 조정 */
.swal2-popup {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif !important;
  border-radius: 16px !important;
}

html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>