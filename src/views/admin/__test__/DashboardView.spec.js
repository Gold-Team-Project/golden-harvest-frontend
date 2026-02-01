import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import DashboardView from '../DashboardView.vue';

describe('DashboardView.vue', () => {
  it('주요 섹션 제목과 설명이 올바르게 렌더링되어야 합니다', () => {
    const wrapper = mount(DashboardView);
    expect(wrapper.exists()).toBe(true);

    // 주요 섹션 제목 확인
    expect(wrapper.text()).toContain('총 재고');
    expect(wrapper.text()).toContain('오늘의 흐름');
    expect(wrapper.text()).toContain('유통기한 임박');
    expect(wrapper.text()).toContain('예상 폐기량');
    expect(wrapper.text()).toContain('이번달 최고 주문');
    expect(wrapper.text()).toContain('알림함');
  });

  it('각 지표 카드가 올바른 값을 표시해야 합니다', () => {
    const wrapper = mount(DashboardView);

    // 총 재고
    const totalStockCard = wrapper.findAll('.metric-card')[0];
    expect(totalStockCard.text()).toContain('45,200kg');
    expect(totalStockCard.text()).toContain('1,240 활성 LOT');

    // 오늘의 흐름
    const todayFlowCard = wrapper.findAll('.metric-card')[1];
    expect(todayFlowCard.text()).toContain('입고 15');
    expect(todayFlowCard.text()).toContain('출고 42');

    // 유통기한 임박
    const expiringCard = wrapper.findAll('.metric-card')[2];
    expect(expiringCard.text()).toContain('28개 LOT');
    expect(expiringCard.text()).toContain('7일 이내 만료 예정');

    // 예상 폐기량
    const disposalCard = wrapper.findAll('.metric-card')[3];
    expect(disposalCard.text()).toContain('120 kg');
    expect(disposalCard.text()).toContain('이번 주 폐기 예상');
  });

  it('이번달 최고 주문 및 알림함 섹션이 올바르게 렌더링되어야 합니다', () => {
    const wrapper = mount(DashboardView);

    // 이번달 최고 주문
    const topOrderCard = wrapper.find('.top-order-card');
    expect(topOrderCard.text()).toContain('감귤 30kg');
    expect(topOrderCard.text()).toContain('4,321 개');
    expect(topOrderCard.text()).toContain('현재 재고 1,000개');

    // 알림함
    const notificationsCard = wrapper.find('.notifications-card');
    expect(notificationsCard.findAll('.notification-item')).toHaveLength(6);
    expect(notificationsCard.text()).toContain('재고 부족 알림');
    expect(notificationsCard.text()).toContain('사과 15kg');
    expect(notificationsCard.text()).toContain('재고 10 상자 미만');
    expect(notificationsCard.text()).toContain('전체 알림 보기');
  });
});
