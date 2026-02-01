import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AdminOrderDetailView from '../AdminOrderDetailView.vue';
import { fetchOrderDetail, cancelOrder, approveOrder } from '@/api/OrderApi.js';
import { useRoute } from 'vue-router';

// Mock dependencies
vi.mock('@/api/OrderApi', () => ({
  fetchOrderDetail: vi.fn(),
  cancelOrder: vi.fn(),
  approveOrder: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
}));

const getMockOrderDetail = (status) => ({
  success: true,
  data: {
    salesOrderId: 'ADMIN_ORDER_1',
    createdAt: '2023-11-01T14:30:00',
    company: '테스트 컴퍼니',
    name: '김테스트',
    phoneNumber: '010-9876-5432',
    addressLine1: '서울시 테스트구',
    addressLine2: '테스트로 123',
    postalCode: '12345',
    totalAmount: 150000,
    orderStatus: status,
    orderItems: [{ itemName: '테스트 상품', price: 150000, quantity: 1 }],
  },
});

const mountOptions = {
  global: {
    stubs: {
      InfoCard: {
        template: '<div><slot /></div>',
      },
      OrderProgress: true,
      BaseButton: false, // We need to interact with BaseButton
    },
  },
};

describe('AdminOrderDetailView.vue', () => {
  let confirmSpy;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchOrderDetail.mockReset();
    cancelOrder.mockReset();
    approveOrder.mockReset();
    useRoute.mockReturnValue({ params: { id: 'ADMIN_ORDER_1' } });
    confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    confirmSpy.mockRestore();
  });

  it('컴포넌트가 마운트되고 상세 정보를 올바르게 렌더링해야 합니다', async () => {
    fetchOrderDetail.mockResolvedValue(getMockOrderDetail('주문 완료'));
    const wrapper = mount(AdminOrderDetailView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(fetchOrderDetail).toHaveBeenCalledWith('ADMIN_ORDER_1');
    expect(wrapper.text()).toContain('주문 #ADMIN_ORDER_1');
    expect(wrapper.text()).toContain('테스트 컴퍼니');
    expect(wrapper.text()).toContain('(12345) 서울시 테스트구 테스트로 123');
    expect(wrapper.find('.item-name').text()).toBe('테스트 상품');
  });

  it('주문 승인 버튼이 올바르게 작동해야 합니다', async () => {
    fetchOrderDetail.mockResolvedValue(getMockOrderDetail('주문 완료'));
    approveOrder.mockResolvedValue({ success: true });
    const wrapper = mount(AdminOrderDetailView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    const approveButton = wrapper.findAll('button').find(b => b.text() === '승인');
    expect(approveButton.attributes('disabled')).toBeUndefined();

    await approveButton.trigger('click');

    expect(confirmSpy).toHaveBeenCalledWith('주문번호 ADMIN_ORDER_1를 승인하시겠습니까?');
    expect(approveOrder).toHaveBeenCalledWith('ADMIN_ORDER_1');
    
    await vi.runAllTimers();
    // fetchOrderDetail should be called again to reload
    expect(fetchOrderDetail).toHaveBeenCalledTimes(2);
  });

  it('주문 취소 버튼이 올바르게 작동해야 합니다', async () => {
    fetchOrderDetail.mockResolvedValue(getMockOrderDetail('상품 준비중'));
    cancelOrder.mockResolvedValue({ success: true });
    const wrapper = mount(AdminOrderDetailView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    const cancelButton = wrapper.findAll('button').find(b => b.text() === '주문 취소');
    expect(cancelButton.attributes('disabled')).toBeUndefined();

    await cancelButton.trigger('click');

    expect(confirmSpy).toHaveBeenCalledWith('주문번호 ADMIN_ORDER_1를 정말 취소하시겠습니까?');
    expect(cancelOrder).toHaveBeenCalledWith('ADMIN_ORDER_1');
    
    await vi.runAllTimers();
    expect(fetchOrderDetail).toHaveBeenCalledTimes(2);
  });

  it('배송 완료 상태일 때 승인 및 취소 버튼이 비활성화되어야 합니다', async () => {
    fetchOrderDetail.mockResolvedValue(getMockOrderDetail('배송 완료'));
    const wrapper = mount(AdminOrderDetailView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    const approveButton = wrapper.findAll('button').find(b => b.text() === '승인');
    const cancelButton = wrapper.findAll('button').find(b => b.text() === '주문 취소');

    expect(approveButton.attributes('disabled')).toBeDefined();
    expect(cancelButton.attributes('disabled')).toBeDefined();
  });
});
