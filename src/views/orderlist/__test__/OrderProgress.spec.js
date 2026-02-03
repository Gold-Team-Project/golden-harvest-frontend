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

  it('취소 상태일 때 취소 메시지를 표시해야 합니다', () => {
    const wrapper = mount(OrderProgress, {
      props: { status: 'CANCELLED' },
    });

    expect(wrapper.find('.cancelled-message').exists()).toBe(true);
    expect(wrapper.find('.cancelled-message').text()).toBe('주문이 취소되었습니다.');
    expect(wrapper.find('.steps-list').exists()).toBe(false);
  });

  it('각 상태에 따라 올바른 수의 활성 단계를 표시해야 합니다', () => {
    // Test PENDING
    let wrapper = mount(OrderProgress, { props: { status: 'PENDING' } });
    expect(wrapper.findAll('.step-item.active')).toHaveLength(1);
    expect(wrapper.findAll('.step-item.active')[0].text()).toBe('주문 접수');

    // Test PREPARING
    wrapper = mount(OrderProgress, { props: { status: 'PREPARING' } });
    expect(wrapper.findAll('.step-item.active')).toHaveLength(3);
    expect(wrapper.findAll('.step-item.active')[2].text()).toBe('배송 준비중');
    
    // Test DELIVERED (last step)
    wrapper = mount(OrderProgress, { props: { status: 'DELIVERED' } });
    expect(wrapper.findAll('.step-item.active')).toHaveLength(steps.length);
    expect(wrapper.findAll('.step-item.active')[steps.length - 1].text()).toBe('배송 완료');
  });

  it('알 수 없는 상태일 때 활성 단계를 표시하지 않아야 합니다', () => {
    const wrapper = mount(OrderProgress, { props: { status: 'UNKNOWN_STATUS' } });

    expect(wrapper.findAll('.step-item.active')).toHaveLength(0);
  });
  
  it('status prop이 필수로 요구됩니다', () => {
    // This test is kept as it is not related to the UI structure
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mount(OrderProgress); 
    expect(spy.mock.calls.some(call => call[0].includes('Missing required prop: "status"'))).toBe(true);
    spy.mockRestore();
  });
});