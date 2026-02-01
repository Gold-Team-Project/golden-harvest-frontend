import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '@/views/login/Login.vue';
import authApi from '@/api/AuthApI.js';
import { jwtDecode } from 'jwt-decode';

// 1. Mock dependencies
vi.mock('@/api/AuthApI.js', () => ({
  default: {
    login: vi.fn(),
  },
}));

const pushMock = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  // <router-link>를 스텁(stub) 처리하기 위함
  RouterLink: {
    template: '<a><slot /></a>',
  },
}));

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

// window.alert Mock
window.alert = vi.fn();

// localStorage Mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


describe('Login.vue', () => {

  // 각 테스트 전에 모든 mock을 초기화
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const mountComponent = () => {
    return mount(Login, {
      global: {
        stubs: {
          RouterLink: true, // router-link 렌더링을 단순화
        }
      }
    });
  }

  it('일반 사용자로 로그인 시 토큰을 저장하고 메인 페이지로 이동한다.', async () => {
    // API 응답 모의
    const mockAccessToken = 'user.access.token';
    const mockRefreshToken = 'user.refresh.token';
    authApi.login.mockResolvedValue({
      data: {
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      },
    });

    // JWT 디코딩 모의 (일반 사용자)
    jwtDecode.mockReturnValue({ role: 'ROLE_USER' });

    const wrapper = mountComponent();

    // 입력 필드에 값 설정
    await wrapper.find('input[type="email"]').setValue('user@test.com');
    await wrapper.find('input[type="password"]').setValue('password123');

    // 폼 제출
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises(); // 비동기 작업(API 호출 등)이 완료될 때까지 기다림

    // 검증
    expect(authApi.login).toHaveBeenCalledTimes(1);
    expect(authApi.login).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'password123',
    });

    expect(localStorage.getItem('accessToken')).toBe(mockAccessToken);
    expect(localStorage.getItem('refreshToken')).toBe(mockRefreshToken);

    expect(jwtDecode).toHaveBeenCalledWith(mockAccessToken);

    expect(window.alert).toHaveBeenCalledWith('로그인에 성공했습니다!');
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('관리자로 로그인 시 토큰을 저장하고 어드민 페이지로 이동한다.', async () => {
    // API 응답 모의
    const mockAdminAccessToken = 'admin.access.token';
    const mockAdminRefreshToken = 'admin.refresh.token';
    authApi.login.mockResolvedValue({
      data: {
        accessToken: mockAdminAccessToken,
        refreshToken: mockAdminRefreshToken,
      },
    });

    // JWT 디코딩 모의 (관리자)
    jwtDecode.mockReturnValue({ role: 'ROLE_ADMIN' });

    const wrapper = mountComponent();

    await wrapper.find('input[type="email"]').setValue('admin@test.com');
    await wrapper.find('input[type="password"]').setValue('adminpass');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    // 검증
    expect(authApi.login).toHaveBeenCalledWith({
      email: 'admin@test.com',
      password: 'adminpass',
    });
    expect(localStorage.getItem('accessToken')).toBe(mockAdminAccessToken);
    expect(jwtDecode).toHaveBeenCalledWith(mockAdminAccessToken);

    expect(window.alert).toHaveBeenCalledWith('관리자 페이지로 이동합니다.');
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('/admin');
  });

  it('로그인 실패 시 에러 메시지를 표시하고 페이지를 이동하지 않는다.', async () => {
    // API 응답 모의 (실패)
    const errorMessage = '이메일 또는 비밀번호를 확인하세요.';
    authApi.login.mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    const wrapper = mountComponent();

    await wrapper.find('input[type="email"]').setValue('wrong@test.com');
    await wrapper.find('input[type="password"]').setValue('wrongpass');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    // 검증
    expect(authApi.login).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('accessToken')).toBeNull(); // 토큰이 저장되지 않았는지
    expect(window.alert).toHaveBeenCalledWith(errorMessage);
    expect(pushMock).not.toHaveBeenCalled(); // 페이지 이동이 없는지
  });

  it('컴포넌트가 올바르게 렌더링된다.', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('h2.form-title').text()).toBe('파트너 로그인');
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('로그인');
  });
});
