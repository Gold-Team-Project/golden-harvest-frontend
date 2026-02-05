<template>
  <div class="fixed-widget">
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
            />
            <button @click="sendMessage" class="send-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
                <path d="M22 2L11 13" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
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

const BACKEND_URL = 'http://localhost:8080';
const CHAT_PATH = '/api/ai/chat';

const STORAGE_KEY = 'green-ai-chat-messages';
const SESSION_KEY = 'green-ai-chat-session-id';

const isOpen = ref(false);
const userInput = ref('');
const chatBody = ref(null);

// --- session_id 생성/저장 ---
const getOrCreateSessionId = () => {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `sid_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
};
const sessionId = ref(getOrCreateSessionId());

const getCurrentTime = () => {
  const now = new Date();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const hours = now.getHours();
  const ampm = hours >= 12 ? '오후' : '오전';
  return `${ampm} ${hours % 12 || 12}:${minutes}`;
};

const savedMessages = localStorage.getItem(STORAGE_KEY);
const messages = ref(
    savedMessages
        ? JSON.parse(savedMessages)
        : [
          {
            text: "안녕하세요! 그린 AI 어시스턴트입니다. 무엇을 도와드릴까요?",
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

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) nextTick(scrollToBottom);
};

// ✅ 다운로드 URL이 상대경로면 BACKEND_URL 붙여서 이동
const goDownload = (targetUrl) => {
  if (!targetUrl) return;

  const fullUrl =
      targetUrl.startsWith('http://') || targetUrl.startsWith('https://')
          ? targetUrl
          : `${BACKEND_URL}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;

  window.location.href = fullUrl;
};

const scrollToBottom = () => {
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight;
  }
};

// ✅ FastAPI 에러(detail)가 dict/list/string 어느 형태든 보기 좋게
const normalizeErrorDetail = (errJson) => {
  if (!errJson) return '알 수 없는 오류';
  const d = errJson.detail ?? errJson;
  if (typeof d === 'string') return d;
  try {
    return JSON.stringify(d);
  } catch (_) {
    return String(d);
  }
};

const sendMessage = async () => {
  const trimmed = userInput.value.trim();
  if (!trimmed) return;

  const currentMsg = trimmed;

  messages.value.push({
    text: currentMsg,
    time: getCurrentTime(),
    isUser: true
  });

  userInput.value = '';
  await nextTick();
  scrollToBottom();

  try {
    // ✅ 반드시 POST + session_id + message
    const response = await fetch(`${BACKEND_URL}${CHAT_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId.value,
        message: currentMsg
      })
    });

    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const err = await response.json();
        detail = normalizeErrorDetail(err);
      } catch (_) {}
      throw new Error(detail);
    }

    const data = await response.json();

    // ✅ 너 FastAPI 응답은 { type, message, download_url ... } 형태
    const aiText = data?.message ?? '응답 메시지가 없습니다.';
    const downloadUrl = data?.download_url || data?.downloadUrl || data?.download_url;

    messages.value.push({
      text: aiText,
      time: getCurrentTime(),
      isUser: false,
      downloadUrl: downloadUrl
    });

  } catch (e) {
    console.error('⚠️ 채팅 오류:', e);
    messages.value.push({
      text: `오류가 발생했습니다: ${e?.message || e}`,
      time: getCurrentTime(),
      isUser: false
    });
  } finally {
    await nextTick();
    scrollToBottom();
  }
};
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

/* 1. 위젯 컨테이너 (우측 하단 고정) */
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

/* 2. 둥둥 버튼 (Floating Button) */
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

.floating-btn:hover {
  transform: scale(1.05);
  background-color: #42bd56;
}

.floating-btn:active {
  transform: scale(0.95);
}

.btn-active {
  background-color: #333;
}

/* 3. 채팅창 (Card) */
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

/* --- 기존 내부 스타일 --- */
.chat-header {
  background-color: #4CD964;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: auto;
  opacity: 0.8;
}

.close-btn:hover {
  opacity: 1;
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

.header-text h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.header-text p {
  margin: 0;
  font-size: 12px;
  opacity: 0.9;
}

.chat-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.ai-row {
  justify-content: flex-start;
}

.user-row {
  justify-content: flex-end;
}

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

.user-row .timestamp {
  text-align: right;
}

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

.download-link:hover {
  background: #4CD964;
  color: white;
}

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

.send-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

/* --- 애니메이션 --- */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
