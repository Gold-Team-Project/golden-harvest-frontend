import axios from 'axios'
import router from '@/router'

const http = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 5000,
});

// 요청 인터셉터: 매 요청마다 액세스 토큰을 헤더에 삽입
http.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 응답 인터셉터: 401 에러 발생 시 RTR(재발급) 실행
http.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 401 에러가 났고, 재시도하지 않은 요청일 때만 실행
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // [수정] 경고가 발생하지 않도록 변수명을 명확히 사용
                const currentRefreshToken = localStorage.getItem('refreshToken');

                if (!currentRefreshToken) {
                    throw new Error('리프레시 토큰이 없습니다.');
                }

                // 백엔드 재발급 API 호출
                const res = await axios.post('http://localhost:8088/api/auth/reissue', {
                    refreshToken: currentRefreshToken
                });

                // 백엔드 응답 success 여부 확인
                if (res.data && res.data.success) {
                    // 백엔드 응답 구조(res.data.data)에 맞춰 토큰 추출
                    const { accessToken, refreshToken: newRefreshToken } = res.data.data;

                    // 1. 새로운 토큰 쌍 저장 (RTR 방식)
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    // 2. 실패했던 원래 요청의 헤더를 새 토큰으로 교체
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                    // 3. 원래 요청 재시도 (axios 인스턴스가 아닌 원본 axios 사용 권장)
                    return axios(originalRequest);
                }
            } catch (reissueError) {
                // 재발급 실패 시 (리프레시 토큰 만료 등) 로그아웃 처리
                console.error("토큰 재발급 실패:", reissueError);

                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                router.push('/login');

                return Promise.reject(reissueError);
            }
        }
        return Promise.reject(error);
    }
);

export default http;