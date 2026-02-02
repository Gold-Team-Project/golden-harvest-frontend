import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LotListView from '@/views/lot/LotListView.vue';
import * as ItemApi from '@/api/ItemApi.js';
import Pagination from '@/components/pagination/Pagination.vue';

// 1. API 모의 처리
vi.mock('@/api/ItemApi.js');

// 2. 테스트 데이터
const mockLots = {
  success: true,
  data: [
    { lotNo: 'LOT001', itemName: '사과', quantity: 100, status: 'AVAILABLE', createdAt: '2023-01-01' },
    { lotNo: 'LOT002', itemName: '바나나', quantity: 50, status: 'ALLOCATED', createdAt: '2023-01-05' },
    { lotNo: 'LOT003', itemName: '오렌지', quantity: 70, status: 'AVAILABLE', createdAt: '2023-01-10' },
    { lotNo: 'LOT004', itemName: '포도', quantity: 120, status: 'DEPLETED', createdAt: '2023-01-15' },
    { lotNo: 'LOT005', itemName: '수박', quantity: 30, status: 'AVAILABLE', createdAt: '2023-01-20' },
    { lotNo: 'LOT006', itemName: '딸기', quantity: 90, status: 'ALLOCATED', createdAt: '2023-01-25' },
    { lotNo: 'LOT007', itemName: '참외', quantity: 60, status: 'AVAILABLE', createdAt: '2023-02-01' },
    { lotNo: 'LOT008', itemName: '멜론', quantity: 40, status: 'DEPLETED', createdAt: '2023-02-05' },
    { lotNo: 'LOT009', itemName: '복숭아', quantity: 80, status: 'AVAILABLE', createdAt: '2023-02-10' },
    { lotNo: 'LOT010', itemName: '키위', quantity: 20, status: 'ALLOCATED', createdAt: '2023-02-15' },
    { lotNo: 'LOT011', itemName: '망고', quantity: 110, status: 'AVAILABLE', createdAt: '2023-02-20' },
  ],
};

describe('LotListView.vue', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    // 기본 API 응답 설정
    ItemApi.getLots.mockResolvedValue(mockLots);
  });

  // 컴포넌트 마운트 헬퍼
  const mountComponent = () => {
    return mount(LotListView, {
      global: {
        stubs: {
          BaseButton: true,
          Pagination: true, // Pagination 컴포넌트 스텁 처리
          StatusBadge: { template: '<span><slot /></span>' },
        },
      },
    });
  };

  describe('데이터 로딩 및 렌더링', () => {
    it('마운트 시 getLots API를 기본 파라미터와 함께 호출한다', async () => {
      mountComponent();
      await flushPromises();

      expect(ItemApi.getLots).toHaveBeenCalledTimes(1);
      expect(ItemApi.getLots).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        lotNo: null,
        itemName: null,
        status: null,
      });
    });

    it('로트 목록을 올바르게 렌더링한다', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const rows = wrapper.findAll('tbody tr');
      expect(rows.length).toBe(mockLots.data.length); // mockLots.data의 갯수만큼 행이 있어야 함

      // 첫 번째 행의 내용 확인
      const firstRowText = rows[0].text();
      expect(firstRowText).toContain(mockLots.data[0].lotNo);
      expect(firstRowText).toContain(mockLots.data[0].itemName);
      expect(firstRowText).toContain(mockLots.data[0].quantity);
      expect(firstRowText).toContain('입고'); // StatusBadge 텍스트 확인 (getStatusText 함수 로직에 따라)
    });

    it('"LOT 데이터가 없습니다." 메시지를 표시한다', async () => {
      ItemApi.getLots.mockResolvedValue({ success: true, data: [] }); // 빈 배열 반환 모의
      const wrapper = mountComponent();
      await flushPromises();

      const rows = wrapper.findAll('tbody tr');
      expect(rows.length).toBe(1); // "LOT 데이터가 없습니다." 행 1개
      expect(rows[0].text()).toContain('LOT 데이터가 없습니다.');
    });
  });

  describe('필터링 및 검색', () => {
    it('검색 버튼 클릭 시 필터 파라미터와 함께 getLots를 다시 호출한다', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(ItemApi.getLots).toHaveBeenCalledTimes(1); // 초기 호출

      // 필터 값 입력
      const lotNoInput = wrapper.find('input[placeholder="LOT 번호"]');
      await lotNoInput.setValue('LOT001');
      
      const itemNameInput = wrapper.find('input[placeholder="품목명"]');
      await itemNameInput.setValue('사과');

      // 검색 버튼 클릭
      await wrapper.find('.btn-search').trigger('click');
      await flushPromises();

      expect(ItemApi.getLots).toHaveBeenCalledTimes(2); // 초기 + 검색 호출
      expect(ItemApi.getLots).toHaveBeenCalledWith({
        page: 1, // 검색 시 페이지는 1로 초기화
        size: 10,
        lotNo: 'LOT001',
        itemName: '사과',
        status: null, // 선택 안 했으므로 null
      });
    });
  });

  describe('페이지네이션', () => {
    it('페이지네이션 컴포넌트에서 페이지 변경 시 getLots를 다시 호출한다', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(ItemApi.getLots).toHaveBeenCalledTimes(1); // 초기 호출

      // Pagination 컴포넌트에서 update:current 이벤트를 에뮬레이트
      wrapper.findComponent(Pagination).vm.$emit('update:current', 2);
      await flushPromises();

      expect(ItemApi.getLots).toHaveBeenCalledTimes(2); // 초기 + 페이지 변경 호출
      expect(ItemApi.getLots).toHaveBeenCalledWith(expect.objectContaining({
        page: 2,
        size: 10,
      }));
    });
  });
});
