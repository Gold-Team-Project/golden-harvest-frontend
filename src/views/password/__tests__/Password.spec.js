import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Password from '@/views/password/Password.vue';
import authApi from '@/api/AuthApI.js';

// 1. 의존성 모의(Mocking)
vi.mock('@/api/AuthApI.js');

const pushMock = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
  // <router-link> 스텁
  RouterLink: { template: '<a><slot /></a>' },
}));

window.alert = vi.fn();

describe('Password.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 상태 초기화
  });

  const mountComponent = () => mount(Password);

  it('초기 렌더링 시 이메일 필드와 인증 버튼만 보인다', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('button.verify-btn').text()).toContain('인증');
    expect(wrapper.find('input[placeholder*="인증번호"]').exists()).toBe(false);
    expect(wrapper.find('input[placeholder*="새로운 비밀번호"]').exists()).toBe(false);
  });

  describe('1단계: 인증번호 발송', () => {
    it('이메일 입력 없이 "인증" 클릭 시 경고를 표시한다', async () => {
      const wrapper = mountComponent();
      await wrapper.find('button.verify-btn').trigger('click');
      expect(window.alert).toHaveBeenCalledWith('이메일을 입력해주세요.');
      expect(authApi.sendEmail).not.toHaveBeenCalled();
    });

    it('인증번호 발송 성공 시 인증코드 입력창을 표시한다', async () => {
      authApi.sendEmail.mockResolvedValue({});
      const wrapper = mountComponent();

      await wrapper.find('input[type="email"]').setValue('test@email.com');
      await wrapper.find('button.verify-btn').trigger('click');
      await flushPromises();

      expect(authApi.sendEmail).toHaveBeenCalledWith({ email: 'test@email.com', type: 'PASSWORD_RESET' });
      expect(window.alert).toHaveBeenCalledWith('인증번호가 발송되었습니다. 메일을 확인해주세요.');
      expect(wrapper.find('input[placeholder*="인증번호"]').exists()).toBe(true);
      expect(wrapper.find('button.verify-btn').text()).toContain('재발송');
    });

    it('인증번호 발송 실패 시 에러 알림을 표시한다', async () => {
      authApi.sendEmail.mockRejectedValue({ response: { data: { message: '발송 실패' } } });
      const wrapper = mountComponent();
      
      await wrapper.find('input[type="email"]').setValue('test@email.com');
      await wrapper.find('button.verify-btn').trigger('click');
      await flushPromises();

      expect(window.alert).toHaveBeenCalledWith('발송 실패');
      expect(wrapper.find('input[placeholder*="인증번호"]').exists()).toBe(false);
    });
  });

  // 헬퍼 함수를 상위 스코프로 이동
  async function setupForVerificationStep() {
    authApi.sendEmail.mockResolvedValue({});
    const wrapper = mountComponent();
    await wrapper.find('input[type="email"]').setValue('test@email.com');
    await wrapper.find('button.verify-btn').trigger('click');
    await flushPromises();
    return wrapper;
  }

  describe('2단계: 인증번호 확인', () => {
    it('인증 성공 시 비밀번호 재설정 필드를 표시한다', async () => {
      authApi.verifyEmail.mockResolvedValue({});
      const wrapper = await setupForVerificationStep();

      await wrapper.find('input[placeholder*="인증번호"]').setValue('123456');
      await wrapper.find('button.check-btn').trigger('click');
      await flushPromises();
      
      expect(authApi.verifyEmail).toHaveBeenCalledWith('test@email.com', '123456');
      expect(window.alert).toHaveBeenCalledWith('이메일 인증에 성공하였습니다.');
      
      // 잘못된 선택자 수정
      expect(wrapper.find('input[placeholder="8~20자 사이로 입력하세요"]').exists()).toBe(true);
      expect(wrapper.find('input[placeholder="비밀번호를 다시 입력하세요"]').exists()).toBe(true);

      // 이전 필드들이 비활성화되는지 확인
      expect(wrapper.find('input[type="email"]').element.disabled).toBe(true);
      expect(wrapper.find('input[placeholder*="인증번호"]').element.disabled).toBe(true);
    });

    it('인증 실패 시 에러 알림을 표시한다', async () => {
      authApi.verifyEmail.mockRejectedValue({ response: { data: { message: '인증 실패' } } });
      const wrapper = await setupForVerificationStep();

      await wrapper.find('input[placeholder*="인증번호"]').setValue('wrong-code');
      await wrapper.find('button.check-btn').trigger('click');
      await flushPromises();

      expect(window.alert).toHaveBeenCalledWith('인증 실패');
      expect(wrapper.find('input[placeholder="8~20자 사이로 입력하세요"]').exists()).toBe(false);
    });
  });

  describe('3단계: 비밀번호 재설정', () => {
    // 3단계 테스트를 위한 사전 준비 함수
    async function setupForResetStep() {
      const wrapper = await setupForVerificationStep(); // 1단계 (이제 접근 가능)
      authApi.verifyEmail.mockResolvedValue({}); // 2단계 성공 모의
      await wrapper.find('input[placeholder*="인증번호"]').setValue('123456');
      await wrapper.find('button.check-btn').trigger('click');
      await flushPromises();
      return wrapper;
    }
    
    it('비밀번호가 일치하지 않으면 경고를 표시한다', async () => {
        const wrapper = await setupForResetStep();
  
        // 잘못된 선택자 수정
        await wrapper.find('input[placeholder="8~20자 사이로 입력하세요"]').setValue('new-pass');
        await wrapper.find('input[placeholder="비밀번호를 다시 입력하세요"]').setValue('wrong-pass');
        await wrapper.find('form').trigger('submit.prevent');
  
        expect(window.alert).toHaveBeenCalledWith('비밀번호가 일치하지 않습니다.');
        expect(authApi.resetPassword).not.toHaveBeenCalled();
    });

    it('재설정 성공 시 로그인 페이지로 리디렉션한다', async () => {
      authApi.resetPassword.mockResolvedValue({});
      const wrapper = await setupForResetStep();

      // 잘못된 선택자 수정
      await wrapper.find('input[placeholder="8~20자 사이로 입력하세요"]').setValue('new-password-123');
      await wrapper.find('input[placeholder="비밀번호를 다시 입력하세요"]').setValue('new-password-123');
      await wrapper.find('form').trigger('submit.prevent');
      await flushPromises();

      expect(authApi.resetPassword).toHaveBeenCalledWith({ email: 'test@email.com', newPassword: 'new-password-123' });
      expect(window.alert).toHaveBeenCalledWith('비밀번호가 성공적으로 재설정 되었습니다. 다시 로그인해 주세요.');
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
  });
});
