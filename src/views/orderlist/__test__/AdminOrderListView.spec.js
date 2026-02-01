import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AdminOrderListView from '../AdminOrderListView.vue';
import BaseButton from '@/components/button/BaseButton.vue';
import OrderStatusBadge from '@/components/status/OrderStatusBadge.vue';
import Pagination from '@/components/pagination/Pagination.vue';
import { fetchAllOrders } from '@/api/OrderApi.js';

// Mock the API call
vi.mock('@/api/OrderApi', () => ({
  fetchAllOrders: vi.fn(),
}));

const mockOrders = {
  success: true,
  data: {
    content: [
      {
        salesOrderId: 101,
        createdAt: '2023-01-01T10:00:00',
        company: '거래처 A',
        orderItems: [{ itemName: '상품 A' }],
        totalAmount: 50000,
        orderStatus: '주문 완료',
      },
      {
        salesOrderId: 102,
        createdAt: '2023-01-02T11:00:00',
        company: '거래처 B',
        orderItems: [{ itemName: '상품 B' }, { itemName: '상품 C' }],
        totalAmount: 120000,
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
        template: '<a :href="to.name ? `/admin/order/${to.params.id}` : to.path"><slot /></a>',
        props: ['to'],
      },
    },
  },
};

describe('AdminOrderListView.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchAllOrders.mockReset();
    fetchAllOrders.mockResolvedValue(mockOrders);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('컴포넌트가 마운트되고 초기 데이터를 로드해야 합니다', async () => {
    const wrapper = mount(AdminOrderListView, mountOptions);
    expect(wrapper.text()).toContain('데이터를 불러오는 중...');
    
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(fetchAllOrders).toHaveBeenCalledTimes(1);
    expect(wrapper.findAll('.order-table tbody tr')).toHaveLength(2);
    expect(wrapper.text()).toContain('거래처 A');
    expect(wrapper.text()).toContain('거래처 B');
  });

  it('날짜 필터로 검색할 수 있어야 합니다', async () => {
    const wrapper = mount(AdminOrderListView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    const dateInputs = wrapper.findAll('input[type="date"]');
    await dateInputs[0].setValue('2023-01-01');
    await dateInputs[1].setValue('2023-01-31');
    
    // The component watches for date changes, so loadOrders is called automatically.
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(fetchAllOrders).toHaveBeenCalledTimes(3); // Initial load + 2 filter changes
    expect(fetchAllOrders).toHaveBeenLastCalledWith({
      startDate: '2023-01-01',
      endDate: '2023-01-31',
      orderStatus: null,
    });
  });

  it('주문 상태 필터로 검색할 수 있어야 합니다', async () => {
    const wrapper = mount(AdminOrderListView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();
    
    const statusSelect = wrapper.find('select');
    await statusSelect.setValue('배송 중');
    
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(fetchAllOrders).toHaveBeenCalledTimes(2);
    expect(fetchAllOrders).toHaveBeenLastCalledWith({
      startDate: '',
      endDate: '',
      orderStatus: '배송 중',
    });
  });

  it('거래처명으로 클라이언트 측 필터링을 수행해야 합니다', async () => {
    const wrapper = mount(AdminOrderListView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    const searchInput = wrapper.find('input[placeholder="찾으시는 거래처를 입력해주세요."]');
    await searchInput.setValue('거래처 A');

    const searchButton = wrapper.findAllComponents(BaseButton).find(b => b.text() === '검색');
    await searchButton.trigger('click');
    
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll('.order-table tbody tr')).toHaveLength(1);
    expect(wrapper.text()).toContain('거래처 A');
    expect(wrapper.text()).not.toContain('거래처 B');
  });

  it('데이터가 없을 때 메시지를 표시해야 합니다', async () => {
    fetchAllOrders.mockResolvedValue({ success: true, data: { content: [], totalElements: 0 } });
    const wrapper = mount(AdminOrderListView, mountOptions);

    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('조회된 주문 내역이 없습니다.');
  });

  it('API 호출 실패 시 오류 메시지를 표시해야 합니다', async () => {
    fetchAllOrders.mockRejectedValue(new Error('API 에러'));
    const wrapper = mount(AdminOrderListView, mountOptions);

    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('오류: API 호출 중 오류가 발생했습니다: API 에러');
  });

  it('페이지네이션이 올바르게 작동해야 합니다', async () => {
    const largeMock = {
      ...mockOrders,
      data: {
        ...mockOrders.data,
        content: Array(15).fill(mockOrders.data.content[0]),
        totalElements: 15,
      }
    };
    fetchAllOrders.mockResolvedValue(largeMock);

    const wrapper = mount(AdminOrderListView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    const pagination = wrapper.findComponent(Pagination);
    expect(pagination.exists()).toBe(true);
    expect(pagination.props().pages).toHaveLength(2); // 15 items, 10 per page = 2 pages
    
    // Check initial page
    expect(wrapper.findAll('.order-table tbody tr')).toHaveLength(10);
    
    // Change page
    await pagination.vm.$emit('update:current', 2);
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll('.order-table tbody tr')).toHaveLength(5);
  });
});
