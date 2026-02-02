import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import DiscardItemView from '@/views/discard/DiscardItemView.vue';

// window.alert 모의 처리
window.alert = vi.fn();

describe('DiscardItemView.vue', () => {

  // 테스트용 모의 데이터
  const mockData = {
    id: '99999',
    date: '2025-12-25',
    productName: '테스트용 귤',
    productCode: 'T-001',
    amount: '10kg',
    loss: 50000
  };

  it('isOpen prop이 false일 때 모달이 렌더링되지 않는다', () => {
    const wrapper = mount(DiscardItemView, {
      props: {
        isOpen: false,
        modalData: mockData
      }
    });
    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });

  it('isOpen prop이 true일 때 모달이 렌더링된다', () => {
    const wrapper = mount(DiscardItemView, {
      props: {
        isOpen: true,
        modalData: mockData
      }
    });
    expect(wrapper.find('.modal-overlay').exists()).toBe(true);
    expect(wrapper.find('h3').text()).toBe('폐기 품목 조회');
  });

  it('props로 전달된 modalData를 올바르게 렌더링한다', () => {
    const wrapper = mount(DiscardItemView, {
      props: {
        isOpen: true,
        modalData: mockData
      }
    });

    const values = wrapper.findAll('.value').map(w => w.text());
    
    expect(values).toContain('#' + mockData.id);
    expect(values).toContain(mockData.date);
    expect(wrapper.find('.p-name').text()).toBe(mockData.productName);
    expect(wrapper.find('.p-code').text()).toBe('CODE : ' + mockData.productCode);
    expect(values).toContain(mockData.amount);
    expect(values).toContain(mockData.loss.toLocaleString() + '원');
  });

  it('닫기 버튼 클릭 시 "close" 이벤트를 발생시킨다', async () => {
    const wrapper = mount(DiscardItemView, {
      props: { isOpen: true, modalData: mockData }
    });

    await wrapper.find('.close-x').trigger('click');
    
    expect(wrapper.emitted()).toHaveProperty('close');
    expect(wrapper.emitted('close').length).toBe(1);
  });

  it('모달 오버레이 클릭 시 "close" 이벤트를 발생시킨다', async () => {
    const wrapper = mount(DiscardItemView, {
      props: { isOpen: true, modalData: mockData }
    });

    await wrapper.find('.modal-overlay').trigger('click');
    
    expect(wrapper.emitted()).toHaveProperty('close');
  });

  it('"수정" 버튼 클릭 시 alert를 호출한다', async () => {
    const wrapper = mount(DiscardItemView, {
      props: { isOpen: true, modalData: mockData }
    });

    await wrapper.find('.btn-edit').trigger('click');
    
    expect(window.alert).toHaveBeenCalledWith('수정 로직 실행');
  });
});
