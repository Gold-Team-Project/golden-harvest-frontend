<template>
  <div class="fixed-widget">
    <Transition name="fade">
      <div v-if="!isOpen" class="chat-tooltip">
        AI 챗봇에게 물어보세요!
      </div>
    </Transition>

    <Transition name="slide-fade">
      <div v-if="isOpen" class="chat-card">
        <div class="chat-header">
          <div class="icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 21C12 21 17 18 19 13C21 8 19 3 19 3C19 3 14 1 9 3C4 8 7 15 7 15"/>
              <path d="M7 15C7 15 12 10 12 6"/>
            </svg>
          </div>
          <div class="header-text">
            <h3>AI 어시스턴트</h3>
            <p>그린 서비스 도우미</p>
          </div>
          <button @click="toggleChat" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="chat-body" ref="chatBody">
          <div
              v-for="(msg, index) in messages"
              :key="index"
              class="message-row"
              :class="{ 'user-row': msg.isUser, 'ai-row': !msg.isUser }"
          >
            <div v-if="!msg.isUser" class="profile-icon">✨</div>

            <div class="bubble-container">
              <div class="bubble">{{ msg.text }}</div>
              <span class="timestamp">{{ msg.time }}</span>

              <a
                  v-if="msg.downloadUrl"
                  href="#"
                  class="download-link"
                  @click.prevent="goDownload(msg.downloadUrl)"
              >
                📂 파일 다운로드
              </a>
            </div>
          </div>
        </div>

        <div class="chat-footer">
          <div class="input-container">
            <input
                v-model="userInput"
                @keyup.enter="sendMessage"
                type="text"
                placeholder="메시지를 입력하세요..."
                :disabled="isLoading"
            />
            <button @click="sendMessage" class="send-btn" :disabled="isLoading">
              <svg v-if="!isLoading" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
                <path d="M22 2L11 13" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span v-else class="loading-dots">...</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <button @click="toggleChat" class="floating-btn" :class="{ 'btn-active': isOpen }">
      <svg v-if="!isOpen" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 21C12 21 17 18 19 13C21 8 19 3 19 3C19 3 14 1 9 3C4 8 7 15 7 15"/>
        <path d="M7 15C7 15 12 10 12 6"/>
      </svg>
      <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
import { sendChatMessage } from '@/api/ChatApi.js'; // [핵심] 분리한 API 파일 import

const STORAGE_KEY = 'green-ai-chat-messages';
const SESSION_KEY = 'green-ai-chat-session-id';

const isOpen = ref(false);
const userInput = ref('');
const chatBody = ref(null);
const isLoading = ref(false); // 로딩 상태

// --- Session ID 관리 ---
const getOrCreateSessionId = () => {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `sid_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
};
const sessionId = ref(getOrCreateSessionId());

// --- 시간 포맷 ---
const getCurrentTime = () => {
  const now = new Date();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const hours = now.getHours();
  const ampm = hours >= 12 ? '오후' : '오전';
  return `${ampm} ${hours % 12 || 12}:${minutes}`;
};

// --- 메시지 로드 ---
const savedMessages = localStorage.getItem(STORAGE_KEY);
const messages = ref(
    savedMessages
        ? JSON.parse(savedMessages)
        : [
          {
            text: "안녕하세요! 그린 AI 어시스턴트입니다.\n궁금한 점을 편하게 물어보세요!",
            time: getCurrentTime(),
            isUser: false
          }
        ]
);

watch(
    messages,
    (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
    },
    { deep: true }
);

// --- UI 액션 ---
const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) nextTick(scrollToBottom);
};

const scrollToBottom = () => {
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight;
  }
};

const goDownload = (targetUrl) => {
  if (!targetUrl) return;
  // 원래 axios를 쓰더라도 응답에 들어있는 URL은 백엔드가 준 그대로이므로
  // 필요하다면 여기서 도메인을 붙이는 로직을 추가할 수 있습니다.
  window.location.href = targetUrl;
};

// --- 메시지 전송 (Axios 사용) ---
const sendMessage = async () => {
  const trimmed = userInput.value.trim();
  if (!trimmed || isLoading.value) return;

  const currentMsg = trimmed;
  userInput.value = '';
  isLoading.value = true;

  // 1. 유저 메시지 화면 표시
  messages.value.push({
    text: currentMsg,
    time: getCurrentTime(),
    isUser: true
  });

  await nextTick();
  scrollToBottom();

  try {
    // 2. API 호출 (원래 axios 사용)
    // axios.js의 인터셉터가 자동으로 작동합니다.
    const response = await sendChatMessage({
      session_id: sessionId.value,
      message: currentMsg
    });

    // 3. 응답 처리 (response.data에 실제 데이터가 있음)
    const data = response.data;
    const aiText = data?.message ?? '응답을 받아오지 못했습니다.';
    const downloadUrl = data?.download_url || data?.downloadUrl;

    messages.value.push({
      text: aiText,
      time: getCurrentTime(),
      isUser: false,
      downloadUrl: downloadUrl
    });

  } catch (error) {
    console.error('⚠️ 채팅 API 오류:', error);

    // 4. 에러 메시지 추출 (Axios 에러 객체 구조 활용)
    let errorMessage = '일시적인 오류가 발생했습니다.';

    if (error.response && error.response.data) {
      // 백엔드가 { success: false, detail: "..." } 형태로 줄 경우
      const detail = error.response.data.detail || error.response.data.message;
      if (detail) {
        errorMessage = typeof detail === 'object' ? JSON.stringify(detail) : detail;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    messages.value.push({
      text: `[오류] ${errorMessage}`,
      time: getCurrentTime(),
      isUser: false
    });
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
};
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

/* 스타일은 기존과 동일합니다 */
.fixed-widget {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-family: 'Pretendard', sans-serif;
  gap: 15px;
}

.chat-tooltip {
  position: relative;
  background-color: #4CD964;
  color: white;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  animation: bounce-slow 2s infinite;
  margin-bottom: 5px;
}

.chat-tooltip::after {
  content: "";
  position: absolute;
  bottom: -6px;
  right: 22px;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 7px solid #4CD964;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(20px); opacity: 0; }

.floating-btn {
  width: 60px;
  height: 60px;
  background-color: #4CD964;
  border-radius: 50%;
  border: none;
  box-shadow: 0 4px 12px rgba(76, 217, 100, 0.4);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s, background-color 0.2s;
}
.floating-btn:hover { transform: scale(1.05); background-color: #42bd56; }
.floating-btn:active { transform: scale(0.95); }
.btn-active { background-color: #333; }

.chat-card {
  width: 360px;
  height: 550px;
  background-color: #F2F4F5;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background-color: #4CD964;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
}
.icon-box {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.header-text h3 { margin: 0; font-size: 16px; font-weight: 600; }
.header-text p { margin: 0; font-size: 12px; opacity: 0.9; }
.close-btn { background: none; border: none; cursor: pointer; margin-left: auto; opacity: 0.8; }
.close-btn:hover { opacity: 1; }

.chat-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-row { display: flex; gap: 8px; align-items: flex-start; }
.ai-row { justify-content: flex-start; }
.user-row { justify-content: flex-end; }

.profile-icon {
  width: 32px;
  height: 32px;
  background: #4CD964;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  flex-shrink: 0;
}

.bubble {
  background: white;
  padding: 10px 14px;
  border-radius: 0 16px 16px 16px;
  font-size: 14px;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  max-width: 220px;
  line-height: 1.5;
  white-space: pre-line;
  word-break: break-all;
}
.user-row .bubble {
  background: #4CD964;
  color: white;
  border-radius: 16px 0 16px 16px;
}

.timestamp {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  margin-left: 2px;
}
.user-row .timestamp { text-align: right; }

.download-link {
  display: inline-block;
  margin-top: 8px;
  font-size: 12px;
  color: #4CD964;
  border: 1px solid #4CD964;
  padding: 4px 8px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
}
.download-link:hover { background: #4CD964; color: white; }

.chat-footer {
  background: white;
  padding: 15px;
  border-top: 1px solid #eee;
}
.input-container {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  padding: 5px 10px 5px 15px;
}
.input-container input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 8px 0;
}
.input-container input:disabled { background: transparent; cursor: not-allowed; }
.send-btn { background: none; border: none; cursor: pointer; padding: 5px; }
.send-btn:disabled { cursor: not-allowed; opacity: 0.5; }
.loading-dots { font-weight: bold; color: #999; letter-spacing: 2px; }
</style>