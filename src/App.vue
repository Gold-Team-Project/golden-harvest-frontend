<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { jwtDecode } from 'jwt-decode'

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
const handleAutoLogout = () => {
  if (checkInterval) clearInterval(checkInterval)
  alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.')

  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')

  // 스토어 상태 초기화 (필요시)
  // userStore.$reset()

  router.push('/login')
}

onMounted(() => {
  // 1. 기존 유저 정보 가져오기
  userStore.fetchMe()

  // 2. 30초마다 토큰 만료 여부 감시 시작
  checkTokenExpiration() // 진입 시 즉시 실행
  checkInterval = setInterval(checkTokenExpiration, 30000)
})

onUnmounted(() => {
  // 컴포넌트 언마운트 시 인터벌 제거
  if (checkInterval) clearInterval(checkInterval)
})
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
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