import { mount, shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OrderHistoryView from '../OrderHistoryView.vue';
import BaseButton from '@/components/button/BaseButton.vue';
import OrderStatusBadge from '@/components/status/OrderStatusBadge.vue';
import Pagination from '@/components/pagination/Pagination.vue';
import { fetchMyOrders } from '@/api/OrderApi.js';

// Mock the API call
vi.mock('@/api/OrderApi', () => ({
  fetchMyOrders: vi.fn(),
}));

const mockOrders = {
  success: true,
  data: {
    content: [
      {
        salesOrderId: 1,
        createdAt: '2023-01-01',
        orderItems: [{ itemName: 'Test Product A', quantity: 2 }],
        totalAmount: 20000,
        orderStatus: '주문 완료',
      },
      {
        salesOrderId: 2,
        createdAt: '2023-01-02',
        orderItems: [{ itemName: 'Test Product B', quantity: 1 }],
        totalAmount: 15000,
        orderStatus: '배송 중',
      },
    ],
    totalElements: 2,
    totalPages: 1,
  },
};

const mountOptions = {
  global: {
    components: {
      RouterLink: {
        template: '<a :href="to.name ? `/order/${to.params.id}` : to.path"><slot /></a>', // More robust mock
        props: ['to'],
      },
    },
  },
};


describe('OrderHistoryView.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchMyOrders.mockReset();
    fetchMyOrders.mockResolvedValue(mockOrders);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('컴포넌트가 성공적으로 마운트되어야 합니다', async () => {
    const wrapper = mount(OrderHistoryView, mountOptions);
    expect(wrapper.exists()).toBe(true);
    // Initial loading state assertion moved before timer advancement
    expect(wrapper.text()).toContain('데이터를 불러오는 중...');
    
    await vi.runOnlyPendingTimers();
    await wrapper.vm.$nextTick();

    expect(fetchMyOrders).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).not.toContain('데이터를 불러오는 중...');
    expect(wrapper.text()).toContain('총 2건의 주문 내역이 있습니다.');
  });

  it('주문 내역이 올바르게 렌더링되어야 합니다', async () => {
    const wrapper = mount(OrderHistoryView, mountOptions);
    await vi.runOnlyPendingTimers();
    await wrapper.vm.$nextTick();

    const orderRows = wrapper.findAll('.order-table tbody tr');
    expect(orderRows).toHaveLength(mockOrders.data.content.length);

    expect(orderRows[0].text()).toContain('2023-01-01');
    expect(orderRows[0].text()).toContain('Test Product A');
    expect(orderRows[0].text()).toContain('2');
    expect(orderRows[0].text()).toContain('20,000원');
    expect(orderRows[0].findComponent(OrderStatusBadge).exists()).toBe(true);
    expect(orderRows[0].findComponent(OrderStatusBadge).props().status).toBe('PENDING');
    expect(orderRows[0].find('a.detail-link').attributes('href')).toBe('/order/1');
  });

  it('날짜 필터가 적용되어야 하고 API가 올바른 필터로 호출되어야 합니다', async () => {
    const wrapper = mount(OrderHistoryView, mountOptions);
    await vi.runOnlyPendingTimers();
    await wrapper.vm.$nextTick();

    const dateInputs = wrapper.findAll('input.date-input'); // Find by class
    const startDateInput = dateInputs[0];
    const endDateInput = dateInputs[1];
    const applyButton = wrapper.findComponent(BaseButton);

    expect(startDateInput.exists()).toBe(true); // Ensure inputs are found
    expect(endDateInput.exists()).toBe(true);

    await startDateInput.setValue('2023-01-01');
    await endDateInput.setValue('2023-01-31');
    await applyButton.trigger('click');
    await vi.runOnlyPendingTimers();
    await wrapper.vm.$nextTick();

    expect(fetchMyOrders).toHaveBeenCalledTimes(2);
    expect(fetchMyOrders).toHaveBeenCalledWith({ startDate: '2023-01-01', endDate: '2023-01-31' });
  });

  it('시작일이 종료일보다 늦으면 필터링되지 않고 alert가 표시되어야 합니다', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const wrapper = mount(OrderHistoryView, mountOptions);
    await vi.runOnlyPendingTimers();
    await wrapper.vm.$nextTick();

    const dateInputs = wrapper.findAll('input.date-input'); // Find by class
    const startDateInput = dateInputs[0];
    const endDateInput = dateInputs[1];
    const applyButton = wrapper.findComponent(BaseButton);

    expect(startDateInput.exists()).toBe(true); // Ensure inputs are found
    expect(endDateInput.exists()).toBe(true);

    await startDateInput.setValue('2023-01-31');
    await endDateInput.setValue('2023-01-01');
    await applyButton.trigger('click');
    await wrapper.vm.$nextTick();

    expect(alertSpy).toHaveBeenCalledWith('시작일은 종료일보다 늦을 수 없습니다.');
    expect(fetchMyOrders).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });

  it('API 호출 실패 시 오류 메시지를 표시해야 합니다', async () => {
    fetchMyOrders.mockRejectedValue(new Error('네트워크 오류'));
    const wrapper = mount(OrderHistoryView, mountOptions);
    await vi.runOnlyPendingTimers();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('오류: API 호출 중 오류가 발생했습니다: 네트워크 오류');
    expect(wrapper.find('.list-summary').attributes('style')).toContain('color: red;');
  });

  it('Pagination 컴포넌트가 올바른 props로 렌더링되어야 합니다', async () => {
    const wrapper = mount(OrderHistoryView, mountOptions);
    await vi.runOnlyPendingTimers();
    await wrapper.vm.$nextTick();

    const pagination = wrapper.findComponent(Pagination);
    expect(pagination.exists()).toBe(true);
    expect(pagination.props().pages).toEqual([1]);
    expect(pagination.props().current).toBe(1);
  });

  it('Pagination에서 update:current 이벤트 발생 시 페이지가 업데이트되어야 합니다', async () => {
    fetchMyOrders.mockResolvedValue({
      success: true,
      data: {
        content: Array(15).fill({
          salesOrderId: 1, createdAt: '2023-01-01', orderItems: [{ itemName: 'Item', quantity: 1 }], totalAmount: 1000, orderStatus: '주문 완료',
        }),
        totalElements: 15,
        totalPages: 2,
      },
    });

    const wrapper = mount(OrderHistoryView, mountOptions);
    await vi.runOnlyPendingTimers();
    await wrapper.vm.$nextTick();

    const pagination = wrapper.findComponent(Pagination);
    expect(pagination.props().current).toBe(1);

    await pagination.vm.$emit('update:current', 2);
    await vi.runOnlyPendingTimers();
    await wrapper.vm.$nextTick();

    expect(pagination.props().current).toBe(2);
    expect(wrapper.findAll('.order-table tbody tr')).toHaveLength(5);
  });
});
