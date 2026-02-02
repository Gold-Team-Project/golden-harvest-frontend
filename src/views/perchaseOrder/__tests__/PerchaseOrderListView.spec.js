import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PerchaseOrderListView from '@/views/perchaseOrder/PerchaseOrderListView.vue';
import http from '@/api/axios'; // axios 인스턴스 모의 처리

// 1. http (axios) 모의 처리
vi.mock('@/api/axios');

// 2. window.alert 모의 처리
window.alert = vi.fn();

// 3. 테스트 데이터
const mockMasterSkus = {
  success: true,
  data: [
    { itemCode: 'ITEM001', itemName: '사과', skuNo: 'SKU001', gradeName: '상', varietyName: '부사', status: true },
    { itemCode: 'ITEM001', itemName: '사과', skuNo: 'SKU002', gradeName: '중', varietyName: '홍옥', status: true },
    { itemCode: 'ITEM002', itemName: '바나나', skuNo: 'SKU003', gradeName: '최상', varietyName: '몽키', status: true },
  ],
};

const mockSkuDetailResponse = {
  success: true,
  data: {
    skuNo: 'SKU001',
    originPrices: [{ originPrice: 1000, unit: '10g' }],
    baseUnit: 'g',
    fileUrl: 'http://example.com/apple.jpg',
  },
};

describe('PerchaseOrderListView.vue', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockImplementation((url) => {
      if (url === '/master-data/items') {
        return Promise.resolve({ data: mockMasterSkus });
      } else if (url.startsWith('/master-data/items/SKU')) {
        return Promise.resolve({ data: mockSkuDetailResponse }); // Use the new mockSkuDetailResponse
      }
      return Promise.reject(new Error(`Unknown GET request: ${url}`));
    });
    http.post.mockResolvedValue({ data: { success: true } });
  });

  const mountComponent = () => {
    return mount(PerchaseOrderListView);
  };

  describe('초기 데이터 가져오기 및 렌더링', () => {
    it('마운트 시 fetchMasterSkus를 호출한다', async () => {
      mountComponent();
      await flushPromises();
      expect(http.get).toHaveBeenCalledWith('/master-data/items', expect.any(Object));
    });

    it('제품 카드와 SKU 선택기가 올바르게 렌더링된다', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const productCards = wrapper.findAll('.product-grid .card');
      expect(productCards.length).toBe(2); // ITEM001, ITEM002 2개

      // 첫 번째 제품 카드 (사과) 확인
      const appleCard = productCards[0];
      expect(appleCard.find('.name').text()).toBe('사과');
      expect(appleCard.find('.sku-select').exists()).toBe(true);
      expect(appleCard.find('.sku-select').element.value).toBe('SKU001'); // 첫 번째 활성 SKU 선택

      // SKU 선택 시 fetchPriceDetail이 호출되었는지 확인
      expect(http.get).toHaveBeenCalledWith(`/master-data/items/${mockMasterSkus.data[0].skuNo}`);
    });

    it('로딩 및 에러 상태를 올바르게 표시한다', async () => {
      let rejectFetchMasterSkus;
      // http.get 첫 호출 (fetchMasterSkus)을 수동으로 제어할 수 있는 Promise로 모의
      http.get.mockImplementationOnce(() => new Promise((resolve, reject) => {
        rejectFetchMasterSkus = reject;
      }));
      
      const wrapper = mountComponent();
      await wrapper.vm.$nextTick(); // loading.value = true 후 DOM 업데이트 대기
      expect(wrapper.find('.state').text()).toContain('불러오는 중...');

      // Promise를 거부하여 에러 상태를 시뮬레이션
      rejectFetchMasterSkus({ response: { data: { message: 'API 에러' } } });
      await flushPromises(); // 거부 처리가 완료되기를 기다림
      expect(wrapper.find('.state.error').text()).toContain('데이터 로딩 실패');
    });
  });

  describe('필터링', () => {
    it('필터 적용 버튼 클릭 시 키워드로 제품을 검색한다', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      http.get.mockClear(); // 초기 호출 클리어

      const keywordInput = wrapper.find('.search-box input');
      await keywordInput.setValue('사과');
      await wrapper.find('.apply-btn').trigger('click');
      await flushPromises();

      expect(http.get).toHaveBeenCalledWith('/master-data/items', { params: { itemName: '사과' } });
      
      // visibleItems 필터링 확인 (mockMasterSkus에 따라 사과만 남아야 함)
      expect(wrapper.findAll('.product-grid .card').length).toBe(1);
      expect(wrapper.find('.product-grid .card .name').text()).toBe('사과');
    });
  });

  describe('수량 조절', () => {
    it('수량 증감 버튼 클릭 시 수량이 올바르게 변경된다', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const appleCard = wrapper.findAll('.product-grid .card')[0]; // 사과 카드
      const initialQty = appleCard.find('.step-value').text();
      expect(initialQty).toContain('0g'); // 초기 0g

      await appleCard.findAll('.step-btn')[1].trigger('click'); // + 버튼 클릭
      expect(appleCard.find('.step-value').text()).toContain('10g'); // stepOf(item)이 10이므로

      await appleCard.findAll('.step-btn')[0].trigger('click'); // - 버튼 클릭
      expect(appleCard.find('.step-value').text()).toContain('0g');
    });
  });

  describe('발주 주문 추가 (addToOrder)', () => {
    it('발주 주문 성공 시 알림을 표시하고 수량을 초기화한다', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const appleCard = wrapper.findAll('.product-grid .card')[0];
      await appleCard.findAll('.step-btn')[1].trigger('click'); // + 버튼 클릭 (10g)
      
      await appleCard.find('.order-btn').trigger('click');
      await flushPromises();

      expect(http.post).toHaveBeenCalledWith('/purchase', null, {
        params: { quantity: 10, skuNo: 'SKU001' },
      });
      expect(window.alert).toHaveBeenCalledWith('발주 주문이 생성되었습니다.');
      expect(appleCard.find('.step-value').text()).toContain('0g'); // 수량 초기화 확인
    });

    it('발주 주문 실패 시 에러 알림을 표시한다', async () => {
      http.post.mockRejectedValue(new Error('발주 API 오류'));
      const wrapper = mountComponent();
      await flushPromises();

      const appleCard = wrapper.findAll('.product-grid .card')[0];
      await appleCard.findAll('.step-btn')[1].trigger('click'); // + 버튼 클릭

      await appleCard.find('.order-btn').trigger('click');
      await flushPromises();

      expect(window.alert).toHaveBeenCalledWith('발주 처리 중 오류가 발생했습니다.');
      expect(appleCard.find('.step-value').text()).toContain('10g'); // 수량 초기화되지 않음
    });
  });
});
