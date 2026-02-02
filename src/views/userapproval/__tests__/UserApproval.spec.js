import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserApproval from '@/views/userapproval/UserApproval.vue';
import * as AdminApi from '@/api/AdminApi.js';

// 1. API 모의 처리
vi.mock('@/api/AdminApi.js');

// 2. window 객체 모의 처리
window.alert = vi.fn();
window.confirm = vi.fn();

// 3. 테스트 데이터
const mockUsers = [
  { userEmail: 'pending@test.com', userName: '김대기', status: 'PENDING', createdAt: '2023-01-01T10:00:00Z', fileUrl: 'url1', role: 'ROLE_USER' },
  { userEmail: 'active@test.com', userName: '이활성', status: 'ACTIVE', createdAt: '2023-01-02T10:00:00Z', fileUrl: 'url2', role: 'ROLE_USER' },
];
const mockUpdateRequests = [
  { id: 1, userEmail: 'active@test.com', requestCompany: '새로운 회사', createdAt: '2023-01-03T10:00:00Z' },
];

describe('UserApproval.vue', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    // 기본 API 응답 설정
    AdminApi.fetchAllUsers.mockResolvedValue({ success: true, data: mockUsers });
    AdminApi.fetchPendingUpdateRequests.mockResolvedValue({ success: true, data: mockUpdateRequests });
    window.confirm.mockReturnValue(true); // 모든 confirm 창에서 '예'를 누른다고 가정
  });

  const mountComponent = () => mount(UserApproval, {
    // shallow: true로 하면 자식 컴포넌트(모달)가 렌더링되지 않으므로, 여기서는 full mount를 사용
  });

  describe('데이터 로딩 및 탭 기능', () => {
    it('마운트 시 사용자 및 수정 요청 목록을 가져온다', async () => {
      mountComponent();
      await flushPromises();
      expect(AdminApi.fetchAllUsers).toHaveBeenCalledTimes(1);
      expect(AdminApi.fetchPendingUpdateRequests).toHaveBeenCalledTimes(1);
    });

    it('탭 상단의 카운트 배지가 정확하게 표시된다', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      
      const joinCountBadge = wrapper.findAll('.tab-btn').find(btn => btn.text().includes('가입 승인'));
      const updateCountBadge = wrapper.findAll('.tab-btn').find(btn => btn.text().includes('수정 요청'));

      expect(joinCountBadge.find('.count').text()).toBe(mockUsers.filter(u => u.status === 'PENDING').length.toString());
      expect(updateCountBadge.find('.count').text()).toBe(mockUpdateRequests.length.toString());
    });

    it('"가입 승인" 탭 클릭 시 PENDING 상태의 유저만 표시한다', async () => {
        const wrapper = mountComponent();
        await flushPromises();

        // '가입 승인' 탭 클릭
        await wrapper.findAll('.tab-btn').find(btn => btn.text().includes('가입 승인')).trigger('click');

        const tableRows = wrapper.findAll('tbody tr');
        expect(tableRows.length).toBe(1);
        expect(tableRows[0].text()).toContain('김대기'); // PENDING 상태인 유저
    });
  });

  describe('모달 상호작용 및 액션', () => {
    it('"가입 승인" 탭에서 상세보기를 누르면 올바른 모달이 열린다', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      await wrapper.findAll('.tab-btn').find(btn => btn.text().includes('가입 승인')).trigger('click');

      // '상세보기' 버튼 클릭
      await wrapper.find('tbody .detail-btn').trigger('click');
      await flushPromises();

      const modal = wrapper.findComponent({ name: 'UserApprovalModal' });
      expect(modal.exists()).toBe(true);
      expect(modal.props('mode')).toBe('join');
      expect(modal.props('userData').userName).toBe('김대기');
      expect(modal.find('h3').text()).toBe('신규 가입 검토');
    });

    it('모달에서 가입 승인 시 approveUser API가 호출되고 데이터가 리프레시된다', async () => {
      AdminApi.approveUser.mockResolvedValue({});
      const wrapper = mountComponent();
      await flushPromises();
      await wrapper.findAll('.tab-btn').find(btn => btn.text().includes('가입 승인')).trigger('click');
      await wrapper.find('tbody .detail-btn').trigger('click');
      await flushPromises();

      // 모달 내부의 '가입 승인' 버튼 클릭
      const modal = wrapper.findComponent({ name: 'UserApprovalModal' });
      await modal.find('.approve-btn').trigger('click');

      expect(window.confirm).toHaveBeenCalledWith('가입을 승인하시겠습니까?');
      expect(AdminApi.approveUser).toHaveBeenCalledWith('pending@test.com', 'ACTIVE');
      expect(window.alert).toHaveBeenCalledWith('성공적으로 승인되었습니다.');
      
      await flushPromises();

      // @update 이벤트가 발생하여 fetchData가 다시 호출되었는지 확인
      expect(AdminApi.fetchAllUsers).toHaveBeenCalledTimes(2);
    });

    it('모달에서 정보 수정 승인 시 approveProfileUpdate API가 호출된다', async () => {
      AdminApi.approveProfileUpdate.mockResolvedValue({});
      const wrapper = mountComponent();
      await flushPromises();
      await wrapper.findAll('.tab-btn').find(btn => btn.text().includes('수정 요청')).trigger('click');
      await wrapper.find('tbody .detail-btn').trigger('click');
      await flushPromises();

      const modal = wrapper.findComponent({ name: 'UserApprovalModal' });
      await modal.find('.approve-btn').trigger('click');

      expect(window.confirm).toHaveBeenCalledWith('정보 수정을 승인하시겠습니까?');
      expect(AdminApi.approveProfileUpdate).toHaveBeenCalledWith(mockUpdateRequests[0].id);
      expect(window.alert).toHaveBeenCalledWith('정보 수정 승인이 완료되었습니다.');
    });

    it('"전체 회원" 탭 모달에서 상태 변경 후 저장 시 API가 호출된다', async () => {
      AdminApi.updateUserStatus.mockResolvedValue({});
      AdminApi.updateUserRole.mockResolvedValue({});
      const wrapper = mountComponent();
      await flushPromises();
      
      // '전체 회원' 탭의 첫 번째 유저(김대기) 클릭
      await wrapper.find('tbody .detail-btn').trigger('click');
      await flushPromises();

      const modal = wrapper.findComponent({ name: 'UserApprovalModal' });
      expect(modal.exists()).toBe(true);

      // 모달 내부의 상태를 'INACTIVE'로 변경
      await modal.find('select.status-select').setValue('INACTIVE');
      
      // 저장 버튼 클릭
      await modal.find('.save-btn').trigger('click');
      
      expect(window.confirm).toHaveBeenCalledWith('회원 정보를 변경하시겠습니까?');
      expect(AdminApi.updateUserStatus).toHaveBeenCalledWith('pending@test.com', 'INACTIVE');
      // 역할은 변경하지 않았으므로 기존 역할로 호출
      expect(AdminApi.updateUserRole).toHaveBeenCalledWith('pending@test.com', 'ROLE_USER');
    });
  });
});
