import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Mypage from '@/views/mypage/Mypage.vue';
import authApi from '@/api/AuthApI.js';

// 1. 의존성 모의(Mocking)
vi.mock('@/api/AuthApI.js');

const pushMock = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

// window 객체의 alert, confirm, localStorage 모의 처리
window.alert = vi.fn();
window.confirm = vi.fn();

const localStorageMock = (() => {
  let store = {};
  return {
    clear: vi.fn(() => { store = {}; }),
    // 테스트에 필요한 다른 메서드들도 추가할 수 있음
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 테스트용 사용자 데이터
const mockUserData = {
  email: 'test@example.com',
  company: '테스트 컴퍼니',
  businessNumber: '123-45-67890',
  name: '테스트',
  phoneNumber: '010-1234-5678',
  addressLine1: '서울시 강남구',
  addressLine2: '테헤란로',
  postalCode: '12345',
  fileId: 1,
};


describe('Mypage.vue', () => {
  beforeEach(() => {
    // 각 테스트 실행 전에 모든 모의(mock) 함수를 초기화
    vi.clearAllMocks();
    // getMyInfo는 대부분의 테스트에서 기본적으로 호출되므로 미리 모의 설정
    authApi.getMyInfo.mockResolvedValue({ data: { data: mockUserData } });
  });

  const mountComponent = () => mount(Mypage);

  describe('컴포넌트 마운트', () => {
    it('마운트 시 사용자 정보를 가져와 폼을 채운다', async () => {
      const wrapper = mountComponent();
      await flushPromises(); // onMounted의 비동기 API 호출 대기

      expect(authApi.getMyInfo).toHaveBeenCalledTimes(1);

      // 폼의 각 필드 값이 모의 데이터와 일치하는지 확인
      expect(wrapper.find('input[type="email"]').element.value).toBe(mockUserData.email);
      expect(wrapper.find('input[placeholder="회사명을 입력하세요"]').element.value).toBe(mockUserData.company);
      expect(wrapper.find('input[placeholder="이름을 입력하세요"]').element.value).toBe(mockUserData.name);
    });

    it('사용자 정보 로드 실패 시 에러 알림을 표시한다', async () => {
      authApi.getMyInfo.mockRejectedValue(new Error('Failed to fetch'));
      mountComponent();
      await flushPromises();

      expect(window.alert).toHaveBeenCalledWith('정보를 불러오는데 실패했습니다.');
    });
  });

  describe('사용자 액션', () => {
    it('일반 정보 수정 성공 시 성공 알림을 표시한다', async () => {
      authApi.updateProfile.mockResolvedValue({});
      const wrapper = mountComponent();
      await flushPromises();

      const newName = '김수정';
      await wrapper.find('input[placeholder="이름을 입력하세요"]').setValue(newName);
      await wrapper.find('button.submit-btn').trigger('click');
      await flushPromises();

      expect(authApi.updateProfile).toHaveBeenCalledWith(expect.objectContaining({ name: newName }));
      expect(window.alert).toHaveBeenCalledWith('개인 정보가 성공적으로 수정되었습니다.');
    });

    it('비밀번호 변경 성공 시 사용자를 로그아웃 시키고 로그인 페이지로 리디렉션한다', async () => {
      authApi.changePassword.mockResolvedValue({});
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper.find('input[placeholder="현재 비밀번호를 입력하세요"]').setValue('oldPass');
      await wrapper.find('input[placeholder="변경할 비밀번호(8자 이상)"]').setValue('newPass');
      await wrapper.find('input[placeholder="새 비밀번호를 다시 입력하세요"]').setValue('newPass');

      await wrapper.find('button.pw-action-btn').trigger('click');
      await flushPromises();

      expect(authApi.changePassword).toHaveBeenCalledWith({ oldPassword: 'oldPass', newPassword: 'newPass' });
      expect(window.alert).toHaveBeenCalledWith('비밀번호가 변경되었습니다. 보안을 위해 다시 로그인해주세요.');
      expect(localStorage.clear).toHaveBeenCalledTimes(1);
      expect(pushMock).toHaveBeenCalledWith('/login');
    });

    it('새 비밀번호와 확인이 일치하지 않으면 에러 알림을 표시한다', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper.find('input[placeholder="현재 비밀번호를 입력하세요"]').setValue('oldPass');
      await wrapper.find('input[placeholder="변경할 비밀번호(8자 이상)"]').setValue('newPass');
      await wrapper.find('input[placeholder="새 비밀번호를 다시 입력하세요"]').setValue('wrongPass');
      await wrapper.find('button.pw-action-btn').trigger('click');

      expect(authApi.changePassword).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('새 비밀번호 확인이 일치하지 않습니다.');
    });

    it('파일과 함께 사업자 정보 수정 요청을 보낸다', async () => {
      window.confirm.mockReturnValue(true); // confirm 창에서 '확인'을 눌렀다고 가정
      authApi.requestBusinessUpdate.mockResolvedValue({});
      const wrapper = mountComponent();
      await flushPromises();

      // 1. 파일 시뮬레이션
      const file = new File(['dummy content'], 'business-license.pdf', { type: 'application/pdf' });
      const fileInput = wrapper.find('input[type="file"]');
      
      // Vitest 환경에서 Object.defineProperty를 사용해 files 속성을 모의 처리
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false // 실제 DOM처럼 읽기 전용으로 설정
      });
      await fileInput.trigger('change');
      
      // 2. 회사명 변경
      const newCompany = '새로운 컴퍼니';
      await wrapper.find('input[placeholder="회사명을 입력하세요"]').setValue(newCompany);
      
      // 3. 수정 요청 버튼 클릭
      await wrapper.find('button.request-btn').trigger('click');
      await flushPromises();
      
      expect(window.confirm).toHaveBeenCalledWith('수정 요청을 보내시겠습니까?');
      expect(authApi.requestBusinessUpdate).toHaveBeenCalledTimes(1);

      // API 호출 시 전달된 인자 확인
      const [updateData, sentFile] = authApi.requestBusinessUpdate.mock.calls[0];
      expect(updateData).toEqual({ requestCompany: newCompany, requestBusinessNumber: mockUserData.businessNumber });
      expect(sentFile.name).toBe('business-license.pdf');

      expect(window.alert).toHaveBeenCalledWith('수정 요청이 전송되었습니다.');
    });

    it('파일 없이 사업자 정보 수정 요청 시 에러 알림을 표시한다', async () => {
      window.confirm.mockReturnValue(true);
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper.find('button.request-btn').trigger('click');

      expect(authApi.requestBusinessUpdate).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('사업자 등록증 파일을 선택해주세요.');
    });
  });
});
