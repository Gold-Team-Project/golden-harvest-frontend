import http from './axios.js';

export const authApi = {
    // 1. 회원가입 (파일 업로드 포함)
    signup: async (signUpData, file) => {
        const formData = new FormData();

        // @RequestPart("data")에 대응하는 JSON 블롭
        formData.append("data", new Blob([JSON.stringify(signUpData)], {
            type: "application/json"
        }));

        // @RequestPart("file")에 대응하는 파일
        formData.append("file", file);

        const response = await http.post('/auth/signup', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // 2. 로그인
    login: async (loginData) => {
        const response = await http.post('/auth/login', loginData);
        return response.data; // TokenResponse (accessToken, refreshToken) 반환
    },

    // 3. 이메일 인증번호 발송 (type: 'SIGNUP' 또는 'PASSWORD_RESET')
    sendEmail: async (email, type) => {
        const response = await http.post('/auth/email/send', { email, type });
        return response.data;
    },

    // 4. 이메일 인증번호 검증
    verifyEmail: async (email, code) => {
        const response = await http.post('/auth/email/verify', { email, code });
        return response.data;
    },

    // 5. 비밀번호 재설정
    resetPassword: async (resetData) => {
        // resetData: { email, newPassword }
        const response = await http.post('/auth/password/reset', resetData);
        return response.data;
    },

    // 6. 로그아웃
    logout: async () => {
        // 헤더에 토큰을 실어 보내는 것은 인터셉터에서 처리한다고 가정
        const response = await http.post('/auth/logout');
        return response.data;
    }
};

export default authApi;