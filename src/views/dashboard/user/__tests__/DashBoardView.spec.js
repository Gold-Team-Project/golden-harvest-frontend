import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import DashBoardView from '@/views/dashboard/user/DashBoardView.vue';

// 이 컴포넌트는 현재 API 호출 없이 정적 데이터를 사용하므로,
// 테스트는 데이터가 올바르게 렌더링되는지에 초점을 맞춥니다.

describe('DashBoardView.vue', () => {
  const wrapper = mount(DashBoardView);

  it('메인 섹션 제목들이 올바르게 렌더링된다', () => {
    const headers = wrapper.findAll('h2, h3');
    const headerTexts = headers.map(h => h.text());
    
    expect(headerTexts).toContain('구매 현황');
    expect(headerTexts).toContain('주문 진행 상황');
    expect(headerTexts).toContain('자주 구매한 상품');
  });

  it('구매 현황(stat) 카드들이 하드코딩된 데이터를 표시한다', () => {
    const statCards = wrapper.findAll('.stat-card');
    
    // 최소 1개 이상의 카드가 있는지 확인
    expect(statCards.length).toBeGreaterThan(0);

    // 첫 번째 카드('당일') 데이터 확인
    const firstCard = statCards[0];
    expect(firstCard.find('.stat-label').text()).toBe('당일');
    expect(firstCard.find('.stat-value').text()).toBe('123');
    expect(firstCard.find('.stat-unit').text()).toBe('orders');
  });

  it('주문 진행 상황 스텝들이 하드코딩된 데이터를 표시한다', () => {
    const stepItems = wrapper.findAll('.step-item');
    
    // 최소 1개 이상의 스텝이 있는지 확인
    expect(stepItems.length).toBeGreaterThan(0);

    // 첫 번째 스텝('주문 접수') 데이터 확인
    const firstStep = stepItems[0];
    expect(firstStep.find('.step-label').text()).toBe('주문 접수');
    expect(firstStep.find('.step-count').text()).toContain('12');
  });

  it('자주 구매한 상품 목록이 하드코"딩된 데이터를 표시한다', () => {
    const itemCards = wrapper.findAll('.item-card');

    // 최소 1개 이상의 아이템 카드가 있는지 확인
    expect(itemCards.length).toBeGreaterThan(0);

    // 첫 번째 아이템 데이터 확인
    const firstItem = itemCards[0];
    expect(firstItem.find('.item-name').text()).toBe('유기농 현미 햇반 210g x 24개');
    expect(firstItem.find('.price').text()).toContain('32,400');
    expect(firstItem.find('.count-tag').text()).toBe('15회 구매');
  });
});
