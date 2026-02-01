import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import OrderProgress from '../OrderProgress.vue';

describe('OrderProgress.vue', () => {
  const steps = [
    { key: 'PENDING', label: '주문 접수', index: 0 },
    { key: 'PAID', label: '상품 준비중', index: 1 },
    { key: 'PREPARING', label: '배송 준비중', index: 2 },
    { key: 'SHIPPING', label: '배송 중', index: 3 },
    { key: 'DELIVERED', label: '배송 완료', index: 4 }
  ];

  it('취소 상태일 때 취소 바를 표시해야 합니다', () => {
    const wrapper = mount(OrderProgress, {
      props: { status: 'CANCELLED' },
    });

    expect(wrapper.find('.cancelled-bar').exists()).toBe(true);
    expect(wrapper.find('.cancelled-bar').text()).toBe('주문 취소');
    expect(wrapper.find('.progress-bar').exists()).toBe(false);
  });

  it('각 상태에 따라 진행률 바와 활성 단계를 올바르게 표시해야 합니다', () => {
    // Test PENDING
    let wrapper = mount(OrderProgress, { props: { status: 'PENDING' } });
    expect(wrapper.find('.progress-bar__active').attributes().style).toContain('width: 0%');
    expect(wrapper.findAll('.step.active')).toHaveLength(1);
    expect(wrapper.findAll('.step.active')[0].text()).toBe('주문 접수');

    // Test PAID
    wrapper = mount(OrderProgress, { props: { status: 'PAID' } });
    expect(wrapper.find('.progress-bar__active').attributes().style).toContain(`width: ${ (1 / (steps.length - 1)) * 100 }%`);
    expect(wrapper.findAll('.step.active')).toHaveLength(2);
    expect(wrapper.findAll('.step.active')[1].text()).toBe('상품 준비중');

    // Test DELIVERED
    wrapper = mount(OrderProgress, { props: { status: 'DELIVERED' } });
    expect(wrapper.find('.progress-bar__active').attributes().style).toContain('width: 100%');
    expect(wrapper.findAll('.step.active')).toHaveLength(steps.length);
    expect(wrapper.findAll('.step.active')[steps.length - 1].text()).toBe('배송 완료');
  });

  it('알 수 없는 상태일 때 진행률을 표시하지 않아야 합니다', () => {
    const wrapper = mount(OrderProgress, { props: { status: 'UNKNOWN_STATUS' } });

    expect(wrapper.find('.progress-bar__active').attributes().style).toContain('width: 0%');
    expect(wrapper.findAll('.step.active')).toHaveLength(0);
  });

  it('status prop이 필수로 요구됩니다', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mount(OrderProgress); 
    expect(spy.mock.calls.some(call => call[0].includes('Missing required prop: "status"'))).toBe(true);
    spy.mockRestore();
  });
});