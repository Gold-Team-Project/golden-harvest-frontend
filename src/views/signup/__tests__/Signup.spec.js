import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Signup from '@/views/signup/Signup.vue';
import authApi from '@/api/AuthApI.js';

// 1. 의존성 모의(Mocking)
vi.mock('@/api/AuthApI.js');

const pushMock = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
  RouterLink: { template: '<a><slot /></a>' },
}));

window.alert = vi.fn();

describe('Signup.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountComponent = () => mount(Signup);

  it('초기 렌더링 시 모든 입력 필드가 표시된다', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[placeholder="인증번호를 입력하세요"]').exists()).toBe(true);
    expect(wrapper.find('input[placeholder="상호명을 입력하세요"]').exists()).toBe(true);
    expect(wrapper.find('input[placeholder="이름"]').exists()).toBe(true);
    expect(wrapper.find('input[type="tel"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"][placeholder="비밀번호"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"][placeholder="비밀번호 확인"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('회원가입');
  });

  describe('이메일 인증', () => {
    it('인증번호 발송에 성공하면 알림을 표시한다', async () => {
      authApi.sendEmail.mockResolvedValue({ message: '인증번호가 발송되었습니다.' });
      const wrapper = mountComponent();
      
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('button.verify-btn').trigger('click');
      await flushPromises();

      expect(authApi.sendEmail).toHaveBeenCalledWith({ email: 'test@example.com', type: 'signup' });
      expect(window.alert).toHaveBeenCalledWith('인증번호가 발송되었습니다.');
    });

    it('인증번호 확인에 성공하면 알림을 표시한다', async () => {
      authApi.verifyEmail.mockResolvedValue({});
      const wrapper = mountComponent();
      
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[placeholder="인증번호를 입력하세요"]').setValue('123456');
      // 인증번호 '확인' 버튼을 특정
      const verifyButton = wrapper.findAll('button.verify-btn').find(btn => btn.text() === '확인');
      await verifyButton.trigger('click');
      await flushPromises();

      expect(authApi.verifyEmail).toHaveBeenCalledWith('test@example.com', '123456');
      expect(window.alert).toHaveBeenCalledWith('이메일 인증에 성공하였습니다.');
    });
  });

  describe('회원가입 제출', () => {
    // 공통 폼 데이터 채우기 헬퍼
    async function fillOutForm(wrapper) {
        await wrapper.find('input[type="email"]').setValue('test@example.com');
        await wrapper.find('input[placeholder="상호명을 입력하세요"]').setValue('테스트상호');
        await wrapper.find('input[placeholder="이름"]').setValue('테스트담당자');
        await wrapper.find('input[type="tel"]').setValue('010-1111-2222');
        await wrapper.find('input[type="password"][placeholder="비밀번호"]').setValue('password123');
        await wrapper.find('input[type="password"][placeholder="비밀번호 확인"]').setValue('password123');
    }

    // 파일 업로드 시뮬레이션 헬퍼
    async function simulateFileUpload(wrapper) {
        const file = new File(['dummy'], 'license.pdf', { type: 'application/pdf' });
        const fileInput = wrapper.find('#file-input-id');
        Object.defineProperty(fileInput.element, 'files', {
            value: [file],
            writable: false
        });
        await fileInput.trigger('change');
        return file;
    }

    it('비밀번호가 일치하지 않으면 경고를 표시하고 API를 호출하지 않는다', async () => {
      const wrapper = mountComponent();
      await fillOutForm(wrapper);
      await wrapper.find('input[type="password"][placeholder="비밀번호 확인"]').setValue('wrong-password');
      
      await wrapper.find('form').trigger('submit.prevent');
      
      expect(window.alert).toHaveBeenCalledWith('비밀번호가 일치하지 않습니다.');
      expect(authApi.signup).not.toHaveBeenCalled();
    });

    it('파일이 없으면 경고를 표시하고 API를 호출하지 않는다', async () => {
      const wrapper = mountComponent();
      await fillOutForm(wrapper);
      
      await wrapper.find('form').trigger('submit.prevent');
      
      expect(window.alert).toHaveBeenCalledWith('사업자 등록증 파일을 업로드해주세요.');
      expect(authApi.signup).not.toHaveBeenCalled();
    });

    it('모든 정보가 올바르면 signup API를 호출한다', async () => {
      authApi.signup.mockResolvedValue({ message: '회원가입 신청이 완료되었습니다.' });
      const wrapper = mountComponent();
      
      await fillOutForm(wrapper);
      const file = await simulateFileUpload(wrapper);
      
      await wrapper.find('form').trigger('submit.prevent');
      await flushPromises();

      const expectedSignUpData = {
        email: 'test@example.com',
        password: 'password123',
        company: '테스트상호',
        businessNumber: '1234567890', // 컴포넌트 내 하드코딩된 값
        name: '테스트담당자',
        phoneNumber: '010-1111-2222'
      };
      
      expect(authApi.signup).toHaveBeenCalledWith(expectedSignUpData, file);
      expect(window.alert).toHaveBeenCalledWith('회원가입 신청이 완료되었습니다.');
    });

    it('API 호출 실패 시 에러 알림을 표시한다', async () => {
        authApi.signup.mockRejectedValue({ response: { data: { message: '가입 실패' } } });
        const wrapper = mountComponent();
        
        await fillOutForm(wrapper);
        await simulateFileUpload(wrapper);
        
        await wrapper.find('form').trigger('submit.prevent');
        await flushPromises();

        expect(authApi.signup).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('가입 실패');
    });
  });
});
