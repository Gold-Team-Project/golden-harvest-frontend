import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import InfoCard from '../InfoCard.vue';

describe('InfoCard.vue', () => {
  it('props로 전달된 title과 icon을 올바르게 렌더링해야 합니다', () => {
    const title = '테스트 제목';
    const icon = '🚀';
    const wrapper = mount(InfoCard, {
      props: { title, icon },
    });

    expect(wrapper.find('.title').text()).toBe(title);
    expect(wrapper.find('.icon').text()).toBe(icon);
  });

  it('슬롯에 전달된 콘텐츠를 올바르게 렌더링해야 합니다', () => {
    const slotContent = '<p>슬롯 내용입니다.</p>';
    const wrapper = mount(InfoCard, {
      props: { title: '제목', icon: '💡' },
      slots: {
        default: slotContent,
      },
    });

    expect(wrapper.find('.card-content').html()).toContain(slotContent);
  });

  it('title과 icon prop이 필수로 요구됩니다', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    mount(InfoCard); // Missing required props

    // Check if at least one warning message contains the string
    expect(spy.mock.calls.some(call => call[0].includes('Missing required prop: "title"'))).toBe(true);
    expect(spy.mock.calls.some(call => call[0].includes('Missing required prop: "icon"'))).toBe(true);
    
    spy.mockRestore();
  });
});