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
    sendEmail: async (emailData) => {
        // emailData는 { email: '...', type: 'PASSWORD_RESET' } 형태여야 함
        return await http.post('/auth/email/send', emailData);
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
    },
    getMyInfo: async () => {
        return await http.get('/user/me');
    },

    // 프로필 정보 수정 (이름, 전화번호, 주소 등)
    updateProfile: async (profileData) => {
        return await http.patch('/user/profile', profileData);
    },

    // 마이페이지 내 비밀번호 변경
    changePassword: async (passwordData) => {
        return await http.patch('/user/password', passwordData);
    },

    // 중요 정보(사업자 정보, 회사명) 수정 요청
    requestBusinessUpdate: async (updateData, file) => {
        const formData = new FormData();

        // 1. JSON 데이터
        formData.append("data", new Blob([JSON.stringify(updateData)], {
            type: "application/json"
        }));

        // 2. 파일
        formData.append("file", file);

        // 💡 /user/business-update 경로로 POST 전송
        return await http.post('/user/business-update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};

export default authApi;