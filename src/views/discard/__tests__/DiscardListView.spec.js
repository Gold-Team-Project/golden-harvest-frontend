import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DiscardListView from '@/views/discard/DiscardListView.vue';
import * as DiscardApi from '@/api/DiscardApi.js';
import DiscardItemView from '@/views/discard/DiscardItemView.vue';

// 1. API 모의 처리
vi.mock('@/api/DiscardApi.js');

// 2. 테스트 데이터
const mockDiscardList = {
  success: true,
  data: [
    { discardId: 1, discardedAt: '2023-11-01T12:00:00Z', lotNo: 'L001', itemName: '사과', quantity: '10kg', discardRate: 5, discardStatus: 'DAMAGED', approvedEmailId: 'admin1' },
    { discardId: 2, discardedAt: '2023-11-02T12:00:00Z', lotNo: 'L002', itemName: '바나나', quantity: '5kg', discardRate: 2, discardStatus: 'EXPIRED', approvedEmailId: 'admin2' },
  ]
};
const mockVolume = { success: true, data: { currentMonthVolume: 150, lastMonthVolume: 100 } };
const mockLoss = { success: true, data: { currentTotalValue: 500000, lastMonthTotalValue: 400000 } };
const mockRatio = { success: true, data: [{ itemName: '사과', totalQuantity: 50 }, { itemName: '바나나', totalQuantity: 30 }] };


describe('DiscardListView.vue', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    // 각 API에 대한 기본 모의 응답 설정
    DiscardApi.getDiscardList.mockResolvedValue(mockDiscardList);
    DiscardApi.getDiscardVolume.mockResolvedValue(mockVolume);
    DiscardApi.getDiscardLoss.mockResolvedValue(mockLoss);
    DiscardApi.getDiscardRatioByItem.mockResolvedValue(mockRatio);
  });

  // 컴포넌트 마운트 헬퍼
  const mountComponent = () => {
    return mount(DiscardListView, {
      global: {
        // 자식 컴포넌트를 스텁 처리하여 테스트를 단순화
        stubs: {
          BaseButton: true,
          Pagination: true,
          StatusBadge: true,
          DiscardItemView: {
            template: '<div class="discard-item-view-stub"></div>',
            props: ['isOpen', 'modalData'],
          },
        }
      }
    });
  };

  describe('데이터 로딩 및 렌더링', () => {
    it('마운트 시 모든 요약 및 리스트 API를 호출한다', async () => {
      mountComponent();
      await flushPromises();

      expect(DiscardApi.getDiscardList).toHaveBeenCalledTimes(1);
      expect(DiscardApi.getDiscardVolume).toHaveBeenCalledTimes(1);
      expect(DiscardApi.getDiscardLoss).toHaveBeenCalledTimes(1);
      expect(DiscardApi.getDiscardRatioByItem).toHaveBeenCalledTimes(1);
    });

    it('요약 카드 데이터를 올바르게 렌더링한다', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const cardValues = wrapper.findAll('.card-value').map(w => w.text());
      expect(cardValues[0]).toContain(mockVolume.data.currentMonthVolume.toLocaleString());
      expect(cardValues[1]).toContain(mockLoss.data.currentTotalValue.toLocaleString());
    });

    it('폐기 목록 테이블을 올바르게 렌더링한다', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      
      const rows = wrapper.findAll('tbody tr');
      expect(rows.length).toBe(mockDiscardList.data.length);
      
      const firstRowText = rows[0].text();
      expect(firstRowText).toContain(mockDiscardList.data[0].lotNo);
      expect(firstRowText).toContain(mockDiscardList.data[0].itemName);
    });
  });

  describe('필터링 및 상호작용', () => {
    it('검색 버튼 클릭 시 올바른 필터와 함께 getDiscardList를 다시 호출한다', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(DiscardApi.getDiscardList).toHaveBeenCalledTimes(1);

      // 필터 값 입력
      const itemNameInput = wrapper.find('input[placeholder="품목명"]');
      await itemNameInput.setValue('사과');
      
      // 검색 버튼 클릭
      await wrapper.find('.btn-search').trigger('click');
      
      expect(DiscardApi.getDiscardList).toHaveBeenCalledTimes(3);
      
      // 마지막 호출의 인자 확인
      const lastCallArgs = DiscardApi.getDiscardList.mock.calls.pop()[0];
      expect(lastCallArgs).toEqual(expect.objectContaining({
        itemName: '사과',
        page: 1, // 검색 시 페이지는 1로 초기화될 것을 가정
      }));
    });

    it('목록의 "확인" 버튼 클릭 시 상세 모달을 연다', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      // 초기 상태: 모달 닫혀있음
      const modalStub = wrapper.findComponent(DiscardItemView);
      expect(modalStub.props('isOpen')).toBe(false);

      // 첫 번째 행의 '확인' 버튼 클릭
      await wrapper.find('tbody .btn-soft').trigger('click');
      
      // 모달이 열리고 올바른 데이터가 전달되었는지 확인
      expect(modalStub.props('isOpen')).toBe(true);
      expect(modalStub.props('modalData')).toEqual(mockDiscardList.data[0]);
    });
  });
});
