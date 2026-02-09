// src/api/ChatApi.js
import http from '@/api/axios.js'; // 작성하신 axios.js 파일의 경로 (경로 확인 필요)

// 채팅 메시지 전송 API
export const sendChatMessage = (data) => {
    // axios.js에 baseURL이 '/api'로 설정되어 있으므로
    // 실제 호출 URL: /api/ai/chat
    return http.post('/ai/chat', data);
};