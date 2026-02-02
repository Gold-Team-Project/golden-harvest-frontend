import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminNotificationListView from '@/views/notification/admin/AdminNotificationListView.vue';
import http from '@/api/axios'; // axios 인스턴스 모의 처리
import Pagination from '@/components/pagination/Pagination.vue'; // Pagination 컴포넌트 임포트

// 1. http (axios) 모의 처리
vi.mock('@/api/axios');

// 2. window 객체 모의 처리
window.alert = vi.fn();
window.confirm = vi.fn();

// 3. 테스트 데이터
const mockNotifications = {
  success: true,
  data: {
    notifications: [
      { userNotificationId: 1, notificationTemplate: { type: 'SIGNUP_PENDING', title: '가입 대기', body: '새로운 사용자가 가입을 요청했습니다.' }, receivedAt: '2023-01-01T10:00:00Z', read: false },
      { userNotificationId: 2, notificationTemplate: { type: 'DEFAULT', title: '일반 알림', body: '시스템 업데이트 예정입니다.' }, receivedAt: '2023-01-02T11:00:00Z', read: true },
    ],
    pagination: {
      currentPage: 1,
      totalPages: 2,
      totalElements: 20,
      pageSize: 10,
    }
  }
};

describe('AdminNotificationListView.vue', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    // http.get 기본 응답 설정
    http.get.mockResolvedValue({ data: mockNotifications });
    // http.patch, http.delete 기본 응답 설정 (성공)
    http.patch.mockResolvedValue({ success: true });
    http.delete.mockResolvedValue({ success: true });
    window.confirm.mockReturnValue(true); // 모든 confirm 창에서 '예'를 누른다고 가정
  });

  // 컴포넌트 마운트 헬퍼
  const mountComponent = () => {
    return mount(AdminNotificationListView, {
      global: {
        stubs: {
          BaseButton: true,
          Pagination: true, // Pagination 컴포넌트 스텁 처리
        },
      },
    });
  };

  describe('데이터 로딩 및 렌더링', () => {
    it('마운트 시 알림 목록 API를 호출한다', async () => {
      mountComponent();
      await flushPromises();

      expect(http.get).toHaveBeenCalledTimes(1);
      expect(http.get).toHaveBeenCalledWith('/notifications', {
        params: { userEmail: 'admin@teamgold.com', page: 1, size: 10 },
      });
    });

    it('알림 목록을 올바르게 렌더링한다', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const rows = wrapper.findAll('tbody tr');
      expect(rows.length).toBe(mockNotifications.data.notifications.length); 

      // 첫 번째 알림 내용 확인
      const firstNotification = mockNotifications.data.notifications[0];
      const firstRow = rows[0];
      expect(firstRow.find('.td-summary').text()).toContain(firstNotification.notificationTemplate.title);
      expect(firstRow.find('.pill').text()).toContain('가입 승인 대기'); // typeLabel 확인
      expect(firstRow.find('.pill-read').text()).toContain('안읽음'); // isRead 확인
    });

    it('"알림이 없습니다." 메시지를 표시한다', async () => {
      http.get.mockResolvedValue({ success: true, data: { notifications: [], pagination: {} } }); // 빈 배열 반환 모의
      const wrapper = mountComponent();
      await flushPromises();

      const rows = wrapper.findAll('tbody tr');
      expect(rows.length).toBe(1); // "알림이 없습니다." 행 1개
      expect(rows[0].find('td.empty').exists()).toBe(true);
      expect(rows[0].text()).toContain('알림이 없습니다.');
    });
  });

  describe('페이지네이션', () => {
    it('페이지네이션 컴포넌트에서 페이지 변경 시 알림 목록을 다시 호출한다', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(http.get).toHaveBeenCalledTimes(1); // 초기 호출

      // Pagination 컴포넌트에서 update:current 이벤트를 에뮬레이트
      wrapper.findComponent(Pagination).vm.$emit('update:current', 2);
      await flushPromises();

      expect(http.get).toHaveBeenCalledTimes(2); // 초기 + 페이지 변경 호출
      expect(http.get).toHaveBeenCalledWith('/notifications', expect.objectContaining({
        params: expect.objectContaining({ page: 2, size: 10 }),
      }));
    });
  });

  describe('액션', () => {
    it('확인 버튼 클릭 시 알림을 읽음 처리하고 API를 호출한다', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const firstRow = wrapper.findAll('tbody tr')[0]; // 첫 번째 알림 (read: false)
      expect(firstRow.find('.pill-read').text()).toContain('안읽음');

      await firstRow.find('.btn-confirm').trigger('click');
      
      expect(firstRow.find('.pill-read').text()).toContain('읽음'); // 낙관적 업데이트 확인
      expect(http.patch).toHaveBeenCalledWith(`/notifications/${mockNotifications.data.notifications[0].userNotificationId}`);
      expect(window.alert).not.toHaveBeenCalled(); // 성공 시 alert 없음
    });

    it('단일 삭제 버튼 클릭 시 알림을 삭제하고 목록을 리프레시한다', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      
      const firstRow = wrapper.findAll('tbody tr')[0];
      await firstRow.find('.btn-delete').trigger('click');

      expect(window.confirm).toHaveBeenCalledWith('해당 알림을 삭제할까요?');
      expect(http.delete).toHaveBeenCalledWith(`/notifications/${mockNotifications.data.notifications[0].userNotificationId}`, expect.any(Object));
      expect(http.get).toHaveBeenCalledTimes(2); // 삭제 후 목록 리프레시를 위해 다시 호출
    });

    it('전체 삭제 버튼 클릭 시 모든 알림을 삭제하고 목록을 리프레시한다', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      
      await wrapper.find('.btn-delete-all').trigger('click');

      expect(window.confirm).toHaveBeenCalledWith('알림을 전체 삭제할까요?');
      expect(http.delete).toHaveBeenCalledWith('/notifications/deleteAll', expect.any(Object));
      expect(http.get).toHaveBeenCalledTimes(2); // 전체 삭제 후 목록 리프레시
    });
  });
});
