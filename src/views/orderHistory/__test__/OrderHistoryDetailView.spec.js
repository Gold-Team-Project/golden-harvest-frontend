import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OrderHistoryDetailView from '../OrderHistoryDetailView.vue';
import { fetchOrderDetail } from '@/api/OrderApi.js';
import { useRoute } from 'vue-router';
import OrderProgress from '@/views/orderlist/OrderProgress.vue'; // Import OrderProgress component for stubbing

// Mock dependencies
vi.mock('@/api/OrderApi', () => ({
  fetchOrderDetail: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
}));

const mockOrderDetailData = {
  success: true,
  data: {
    salesOrderId: 'ORDER123',
    orderStatus: '주문 완료', // Default status for general tests
    createdAt: '2023-10-27T10:00:00',
    totalAmount: 75000,
    customerInfo: {
      email: 'test@example.com',
      company: '테스트 컴퍼니',
      businessNumber: '123-45-67890',
      name: '박규진',
      phoneNumber: '010-0101-0101',
      addressLine1: '서울특별시 강남구',
      addressLine2: '테헤란로 123',
      postalCode: '12345',
    },
    orderItems: [
      {
        itemName: '맛있는 사과',
        gradeName: '특',
        varietyName: '부사',
        price: 25000,
        quantity: 2,
      },
      {
        itemName: '달콤한 배',
        gradeName: '상',
        varietyName: '신고',
        price: 25000,
        quantity: 1,
      },
    ],
  },
};

const mountOptions = {
  global: {
    stubs: {
      BaseButton: true,
      OrderProgress: true, // Stub OrderProgress component
    },
  },
};

describe('OrderHistoryDetailView.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchOrderDetail.mockReset();
    useRoute.mockReturnValue({ params: { id: 'ORDER123' } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('컴포넌트가 마운트되고 주문 상세 정보를 로드해야 합니다', async () => {
    fetchOrderDetail.mockResolvedValue(mockOrderDetailData);
    const wrapper = mount(OrderHistoryDetailView, mountOptions);

    expect(wrapper.text()).toContain('주문 상세 정보를 불러오는 중...');
    expect(fetchOrderDetail).toHaveBeenCalledWith('ORDER123');

    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('주문 상세');
    expect(wrapper.text()).toContain('주문번호 : ORDER123');
    expect(wrapper.findAll('.item-table tbody tr')).toHaveLength(2);
  });

  it('주문 품목이 올바르게 렌더링되어야 합니다', async () => {
    fetchOrderDetail.mockResolvedValue(mockOrderDetailData);
    const wrapper = mount(OrderHistoryDetailView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    const firstItemRow = wrapper.findAll('.item-table tbody tr')[0];
    expect(firstItemRow.text()).toContain('맛있는 사과');
    expect(firstItemRow.text()).toContain('코드: 특');
    expect(firstItemRow.text()).toContain('옵션: 부사');
    expect(firstItemRow.text()).toContain('25,000원');
    expect(firstItemRow.text()).toContain('2');
    expect(firstItemRow.text()).toContain('50,000원');
  });

  it('배송 정보가 올바르게 렌더링되어야 합니다', async () => {
    fetchOrderDetail.mockResolvedValue(mockOrderDetailData);
    const wrapper = mount(OrderHistoryDetailView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    const deliveryInfo = wrapper.find('.sidebar-content .card:first-child');
    expect(deliveryInfo.text()).toContain('수령인 : 박규진');
    expect(deliveryInfo.text()).toContain('연락처 : 010-0101-0101');
    expect(deliveryInfo.text()).toContain('주소 : (12345) 서울특별시 강남구 테헤란로 123');
  });

  it('총 합계 금액이 올바르게 표시되어야 합니다', async () => {
    fetchOrderDetail.mockResolvedValue(mockOrderDetailData);
    const wrapper = mount(OrderHistoryDetailView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.total-amount').text()).toBe('75,000원');
  });
  
  it('OrderProgress 컴포넌트가 올바른 상태로 렌더링되어야 합니다', async () => {
    const specificData = JSON.parse(JSON.stringify(mockOrderDetailData));
    specificData.data.orderStatus = '배송 완료'; // Test with a specific status
    fetchOrderDetail.mockResolvedValue(specificData);
    
    const wrapper = mount(OrderHistoryDetailView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    const orderProgressComponent = wrapper.findComponent(OrderProgress);
    expect(orderProgressComponent.exists()).toBe(true);
    expect(orderProgressComponent.props().status).toBe('DELIVERED');
  });

  it('API 호출 실패 시 오류 메시지를 표시해야 합니다', async () => {
    fetchOrderDetail.mockRejectedValue(new Error('API 통신 오류'));
    const wrapper = mount(OrderHistoryDetailView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('오류: API 호출 중 오류가 발생했습니다: API 통신 오류');
  });

  it('주문 정보를 찾을 수 없을 때 메시지를 표시해야 합니다', async () => {
    fetchOrderDetail.mockResolvedValue({ success: false, message: '주문 없음' });
    const wrapper = mount(OrderHistoryDetailView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('오류: 주문 없음');
  });
});
