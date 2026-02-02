import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import OrderStatusBadge from '@/components/status/OrderStatusBadge.vue';

describe('OrderStatusBadge.vue', () => {

  const mountComponent = (status) => {
    return mount(OrderStatusBadge, {
      props: {
        status: status,
      }
    });
  };

  it('renders "주문 접수" with "status-pending" class for PENDING status', () => {
    const wrapper = mountComponent('PENDING');
    expect(wrapper.text()).toBe('주문 접수');
    expect(wrapper.classes()).toContain('status-pending');
  });

  it('renders "상품 준비중" with "status-paid" class for PAID status', () => {
    const wrapper = mountComponent('PAID');
    expect(wrapper.text()).toBe('상품 준비중');
    expect(wrapper.classes()).toContain('status-paid');
  });

  it('renders "배송 준비중" with "status-preparing" class for PREPARING status', () => {
    const wrapper = mountComponent('PREPARING');
    expect(wrapper.text()).toBe('배송 준비중');
    expect(wrapper.classes()).toContain('status-preparing');
  });

  it('renders "배송 중" with "status-shipping" class for SHIPPING status', () => {
    const wrapper = mountComponent('SHIPPING');
    expect(wrapper.text()).toBe('배송 중');
    expect(wrapper.classes()).toContain('status-shipping');
  });

  it('renders "배송 완료" with "status-delivered" class for DELIVERED status', () => {
    const wrapper = mountComponent('DELIVERED');
    expect(wrapper.text()).toBe('배송 완료');
    expect(wrapper.classes()).toContain('status-delivered');
  });

  it('renders "주문 취소" with "status-cancelled" class for CANCELLED status', () => {
    const wrapper = mountComponent('CANCELLED');
    expect(wrapper.text()).toBe('주문 취소');
    expect(wrapper.classes()).toContain('status-cancelled');
  });

  it('renders "입금 대기" with "status-pending-payment" class for PENDING_PAYMENT status', () => {
    const wrapper = mountComponent('PENDING_PAYMENT');
    expect(wrapper.text()).toBe('입금 대기');
    expect(wrapper.classes()).toContain('status-pending-payment');
  });

  it('renders "알 수 없음" with "status-unknown" class for unknown status', () => {
    const wrapper = mountComponent('UNKNOWN_STATUS');
    expect(wrapper.text()).toBe('알 수 없음');
    expect(wrapper.classes()).toContain('status-unknown');
  });
});
