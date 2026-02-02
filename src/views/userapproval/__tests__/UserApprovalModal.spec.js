import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserApprovalModal from '@/views/userapproval/modal/UserApprovalModal.vue';
import * as AdminApi from '@/api/AdminApi.js';
import Swal from 'sweetalert2';

// 1. 의존성 모의
vi.mock('@/api/AdminApi.js');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
    showLoading: vi.fn(),
  }
}));

window.alert = vi.fn();
window.confirm = vi.fn();

// 2. 기본 테스트 데이터
const baseUserData = {
  userEmail: 'test@example.com',
  userName: '테스트유저',
  userStatus: 'PENDING',
  role: 'ROLE_USER',
  fileUrl: 'http://example.com/license.jpg',
  isMe: false,
};

describe('UserApprovalModal.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm.mockReturnValue(true); // 기본적으로 '예'를 선택
  });

  // 컴포넌트 마운트 헬퍼
  const mountComponent = (props) => {
    return mount(UserApprovalModal, {
      props: {
        userData: { ...baseUserData, ...props.userData },
        mode: props.mode || 'join',
      }
    });
  };

  describe('mode: "join"', () => {
    it('올바른 제목과 버튼들을 렌더링한다', () => {
      const wrapper = mountComponent({ mode: 'join' });
      expect(wrapper.find('h3').text()).toBe('신규 가입 검토');
      expect(wrapper.find('.approve-btn').text()).toBe('가입 승인');
      expect(wrapper.find('.reject-btn').text()).toBe('가입 거절');
    });

    it('"가입 승인" 버튼 클릭 시 approveUser API를 호출하고 이벤트를 발생시킨다', async () => {
      AdminApi.approveUser.mockResolvedValue({});
      const wrapper = mountComponent({ mode: 'join' });
      
      await wrapper.find('.approve-btn').trigger('click');
      
      expect(window.confirm).toHaveBeenCalledWith('가입을 승인하시겠습니까?');
      expect(AdminApi.approveUser).toHaveBeenCalledWith(baseUserData.userEmail, 'ACTIVE');
      expect(window.alert).toHaveBeenCalledWith('성공적으로 승인되었습니다.');
      
      expect(wrapper.emitted('update')).toBeTruthy();
      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });

  describe('mode: "update"', () => {
    const updateUserData = { id: 99, requestFileUrl: 'http://example.com/new_license.jpg' };

    it('올바른 제목과 버튼들을 렌더링한다', () => {
      const wrapper = mountComponent({ mode: 'update', userData: updateUserData });
      expect(wrapper.find('h3').text()).toBe('정보 수정 승인');
      expect(wrapper.find('.approve-btn').text()).toBe('수정 승인');
      expect(wrapper.find('.reject-btn').text()).toBe('수정 반려');
    });

    it('"수정 승인" 버튼 클릭 시 approveProfileUpdate API를 호출한다', async () => {
      AdminApi.approveProfileUpdate.mockResolvedValue({});
      const wrapper = mountComponent({ mode: 'update', userData: updateUserData });

      await wrapper.find('.approve-btn').trigger('click');

      expect(window.confirm).toHaveBeenCalledWith('정보 수정을 승인하시겠습니까?');
      expect(AdminApi.approveProfileUpdate).toHaveBeenCalledWith(updateUserData.id);
      expect(window.alert).toHaveBeenCalledWith('정보 수정 승인이 완료되었습니다.');
      
      expect(wrapper.emitted('update')).toBeTruthy();
      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });

  describe('mode: "all"', () => {
    it('올바른 제목과 버튼, 상태/권한 select를 렌더링한다', () => {
      const wrapper = mountComponent({ mode: 'all' });
      expect(wrapper.find('h3').text()).toBe('회원 상세 설정');
      expect(wrapper.find('.save-btn').text()).toBe('설정 저장');
      expect(wrapper.find('.status-select').exists()).toBe(true);
      expect(wrapper.find('.basic-select').exists()).toBe(true); // 권한 select
    });

    it('"설정 저장" 버튼 클릭 시 상태 및 권한 변경 API를 호출한다', async () => {
      AdminApi.updateUserStatus.mockResolvedValue({});
      AdminApi.updateUserRole.mockResolvedValue({});
      const wrapper = mountComponent({ mode: 'all' });

      // 값 변경
      await wrapper.find('.status-select').setValue('ACTIVE');
      await wrapper.find('.basic-select').setValue('ROLE_ADMIN');

      await wrapper.find('.save-btn').trigger('click');

      expect(window.confirm).toHaveBeenCalledWith('회원 정보를 변경하시겠습니까?');
      expect(AdminApi.updateUserStatus).toHaveBeenCalledWith(baseUserData.userEmail, 'ACTIVE');
      expect(AdminApi.updateUserRole).toHaveBeenCalledWith(baseUserData.userEmail, 'ROLE_ADMIN');
      expect(window.alert).toHaveBeenCalledWith('회원 설정이 모두 저장되었습니다.');
      
      expect(wrapper.emitted('update')).toBeTruthy();
    });
  });

  describe('본인 계정 (isMe: true) 처리', () => {
    it('"본인 계정" 태그를 표시하고 select 및 저장 버튼을 비활성화한다', () => {
      const wrapper = mountComponent({ mode: 'all', userData: { isMe: true } });
      
      expect(wrapper.find('.me-tag').exists()).toBe(true);
      expect(wrapper.find('.me-tag').text()).toBe('본인 계정');
      
      // select 요소들이 비활성화되었는지 확인
      expect(wrapper.find('.status-select').element.disabled).toBe(true);
      expect(wrapper.find('.basic-select').element.disabled).toBe(true);
      
      // 저장 버튼이 비활성화되었는지 확인
      expect(wrapper.find('.save-btn').element.disabled).toBe(true);
    });

    it('"설정 저장" 버튼을 클릭해도 API가 호출되지 않는다', async () => {
        const wrapper = mountComponent({ mode: 'all', userData: { isMe: true } });
        await wrapper.find('.save-btn').trigger('click');
        
        expect(window.confirm).not.toHaveBeenCalled();
        expect(AdminApi.updateUserStatus).not.toHaveBeenCalled();
        expect(AdminApi.updateUserRole).not.toHaveBeenCalled();
    });
  });
});
