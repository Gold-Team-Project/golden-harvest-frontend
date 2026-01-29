import { defineStore } from 'pinia'
import api from '@/api/axios.js' // axios 인스턴스

export const useUserStore = defineStore('user', {
    state: () => ({
        isLogin: false,
        user: null,        // UserResponse 그대로 저장
        accessToken: null, // 지금은 안 써도 둔다
    }),

    getters: {
        userName: (state) => state.user?.name ?? '',
        isAdmin: (state) => state.user?.role === 'ADMIN',
    },

    actions: {
        // 🔹 핵심: /me 호출
        async fetchMe() {
            try {
                const res = await api.get('/auth/me')
                // ApiResponse.success 형태면 res.data.data 일 수도 있음
                this.user = res.data.data ?? res.data
                this.isLogin = true
            } catch (e) {
                this.user = null
                this.isLogin = false
            }
        },

        // 🔹 나중에 로그인 붙일 때 사용
        login(user, token) {
            this.user = user
            this.accessToken = token
            this.isLogin = true
        },

        logout() {
            this.user = null
            this.accessToken = null
            this.isLogin = false
        },
    },
})
