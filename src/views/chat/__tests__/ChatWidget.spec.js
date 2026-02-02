import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ChatWidget from '@/views/chat/ChatWidget.vue';

// 1. localStorage 모의 처리
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 2. fetch 모의 처리
// `vi.stubGlobal`을 사용하여 전역 fetch 함수를 모의
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);


describe('ChatWidget.vue', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // fetch 기본 응답 설정
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'AI 응답입니다.' }),
    });
  });

  const mountComponent = () => mount(ChatWidget);

  describe('초기 상태 및 렌더링', () => {
    it('localStorage에 메시지가 없으면 기본 환영 메시지를 표시한다', async () => {
      const wrapper = mountComponent();
      await wrapper.find('.floating-btn').trigger('click');
      expect(wrapper.find('.bubble').text()).toContain('안녕하세요! 그린 AI 어시스턴트입니다.');
    });

    it('localStorage에 메시지가 있으면 해당 메시지를 불러온다', async () => {
      const mockMessages = [{ text: '저장된 메시지', time: '오후 2:30', isUser: false }];
      localStorage.setItem('green-ai-chat-messages', JSON.stringify(mockMessages));
      
      const wrapper = mountComponent();
      await wrapper.find('.floating-btn').trigger('click');
      expect(wrapper.find('.bubble').text()).toContain('저장된 메시지');
    });

    it('초기에는 채팅창이 닫혀있다', () => {
      const wrapper = mountComponent();
      expect(wrapper.find('.chat-card').exists()).toBe(false);
    });
  });

  describe('UI 상호작용', () => {
    it('플로팅 버튼 클릭 시 채팅창이 열린다', async () => {
      const wrapper = mountComponent();
      await wrapper.find('.floating-btn').trigger('click');
      expect(wrapper.find('.chat-card').exists()).toBe(true);
    });

    it('채팅창이 열린 상태에서 닫기 버튼 클릭 시 채팅창이 닫힌다', async () => {
      const wrapper = mountComponent();
      // 채팅창 열기
      await wrapper.find('.floating-btn').trigger('click');
      expect(wrapper.find('.chat-card').exists()).toBe(true);
      
      // 닫기 버튼 클릭
      await wrapper.find('.close-btn').trigger('click');
      expect(wrapper.find('.chat-card').exists()).toBe(false);
    });
  });

  describe('메시지 전송 흐름', () => {
    it('사용자가 메시지를 보내면 즉시 표시되고, AI 응답을 받아 표시한다', async () => {
      const wrapper = mountComponent();
      await wrapper.find('.floating-btn').trigger('click'); // 채팅창 열기

      // 사용자 메시지 입력 및 전송
      await wrapper.find('input[type="text"]').setValue('테스트 메시지');
      await wrapper.find('.send-btn').trigger('click');

      // 1. 사용자 메시지가 즉시 표시되었는지 확인 (동기)
      let messageRows = wrapper.findAll('.message-row');
      expect(messageRows.length).toBe(2); // 초기 메시지(1) + 사용자 메시지(1)
      expect(messageRows[1].classes()).toContain('user-row');
      expect(messageRows[1].text()).toContain('테스트 메시지');
      
      // 2. fetch가 올바르게 호출되었는지 확인
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/chat', expect.any(Object));
      const fetchOptions = mockFetch.mock.calls[0][1];
      expect(fetchOptions.method).toBe('POST');
      expect(JSON.parse(fetchOptions.body)).toEqual({ message: '테스트 메시지' });
      
      // 3. 비동기 작업(fetch)을 처리하고 AI 응답을 확인
      await flushPromises();
      
      const finalMessageRows = wrapper.findAll('.message-row');
      expect(finalMessageRows.length).toBe(3); // 초기 메시지(1) + 사용자 메시지(1) + AI 메시지(1)
      const lastMessage = finalMessageRows[finalMessageRows.length - 1];
      expect(lastMessage.classes()).toContain('ai-row');
      expect(lastMessage.text()).toContain('AI 응답입니다.');
    });

    it('fetch 에러 발생 시 에러 메시지를 표시한다', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const wrapper = mountComponent();
      await wrapper.find('.floating-btn').trigger('click');

      await wrapper.find('input[type="text"]').setValue('에러 유발 메시지');
      await wrapper.find('.send-btn').trigger('click');
      await flushPromises();
      
      const lastMessage = wrapper.findAll('.message-row').at(-1);
      expect(lastMessage.text()).toContain('오류가 발생했습니다.');
    });

    it('응답에 download_url이 포함된 경우 다운로드 링크를 표시한다', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: '파일을 확인하세요.', download_url: '/some/file.pdf' }),
      });
      const wrapper = mountComponent();
      await wrapper.find('.floating-btn').trigger('click');
      
      await wrapper.find('input[type="text"]').setValue('파일 요청');
      await wrapper.find('.send-btn').trigger('click');
      await flushPromises();

      const lastMessage = wrapper.findAll('.message-row').at(-1);
      const downloadLink = lastMessage.find('.download-link');
      expect(downloadLink.exists()).toBe(true);
      expect(downloadLink.text()).toContain('파일 다운로드');
    });
  });
});
