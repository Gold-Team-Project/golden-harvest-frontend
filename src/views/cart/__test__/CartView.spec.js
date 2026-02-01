import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CartView from '../CartView.vue';
import { fetchCartItems, updateCartItemQuantity, deleteCartItem, checkoutCart } from '@/api/OrderApi.js';

// Mock API functions
vi.mock('@/api/OrderApi', () => ({
  fetchCartItems: vi.fn(),
  updateCartItemQuantity: vi.fn(),
  deleteCartItem: vi.fn(),
  checkoutCart: vi.fn(),
}));

const mockCartData = {
  success: true,
  data: {
    items: [
      { skuNo: 'SKU001', itemName: '사과', totalPrice: 10000, quantity: 2 },
      { skuNo: 'SKU002', itemName: '바나나', totalPrice: 5000, quantity: 1 },
    ],
  },
};

describe('CartView.vue', () => {
  let alertSpy;
  let confirmSpy;

  beforeEach(() => {
    vi.useFakeTimers();
    // Reset mocks
    fetchCartItems.mockReset();
    updateCartItemQuantity.mockReset();
    deleteCartItem.mockReset();
    checkoutCart.mockReset();

    // Default mock implementation
    fetchCartItems.mockResolvedValue(mockCartData);
    updateCartItemQuantity.mockResolvedValue({ success: true });
    deleteCartItem.mockResolvedValue({ success: true });
    checkoutCart.mockResolvedValue({ success: true, data: 'ORDER_SUCCESS_123' });
    
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    alertSpy.mockRestore();
    confirmSpy.mockRestore();
  });

  it('마운트 시 장바구니 상품을 불러오고 렌더링해야 합니다', async () => {
    const wrapper = mount(CartView);
    expect(wrapper.text()).toContain('장바구니 상품을 불러오는 중...');
    
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(fetchCartItems).toHaveBeenCalledTimes(1);
    expect(wrapper.findAll('.cart-item')).toHaveLength(2);
    expect(wrapper.text()).toContain('사과');
    expect(wrapper.text()).toContain('바나나');
  });

  it('전체 선택 체크박스가 올바르게 작동해야 합니다', async () => {
    const wrapper = mount(CartView);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();
    
    const selectAllCheckbox = wrapper.find('#select-all');
    expect(selectAllCheckbox.element.checked).toBe(true);

    // Deselect all
    await selectAllCheckbox.setValue(false);
    await wrapper.vm.$nextTick(); // Wait for reactivity
    expect(wrapper.vm.selectedItems).toHaveLength(0);
    expect(wrapper.find('.final-amount').text()).toBe('0원');
    
    // Select all again
    await selectAllCheckbox.setValue(true);
    await wrapper.vm.$nextTick(); // Wait for reactivity
    expect(wrapper.vm.selectedItems).toHaveLength(2);
    expect(wrapper.find('.final-amount').text()).not.toBe('0원');
  });

  it('수량 조절 버튼이 API를 호출해야 합니다', async () => {
    const wrapper = mount(CartView);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();
    
    const firstItem = wrapper.findAll('.cart-item')[0];
    const increaseBtn = firstItem.findAll('button')[1];

    await increaseBtn.trigger('click');
    expect(updateCartItemQuantity).toHaveBeenCalledWith('SKU001', 3);
  });

  it('선택 삭제 버튼이 선택된 상품을 삭제해야 합니다', async () => {
    const wrapper = mount(CartView);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    // Deselect the second item, so only the first is selected for deletion
    const secondItemCheckbox = wrapper.findAll('.cart-item input[type="checkbox"]')[1];
    await secondItemCheckbox.setValue(false);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.selectedItems).toHaveLength(1);
    expect(wrapper.vm.selectedItems[0].id).toBe('SKU001');

    const deleteBtn = wrapper.find('.delete-selected-btn');
    await deleteBtn.trigger('click');

    expect(confirmSpy).toHaveBeenCalled();
    expect(deleteCartItem).toHaveBeenCalledWith('SKU001');
    
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();
    
    // The first item should be removed, leaving the second
    expect(wrapper.findAll('.cart-item')).toHaveLength(1);
    expect(wrapper.find('.cart-item').text()).toContain('바나나');
  });

  it('주문하기 버튼이 주문을 생성해야 합니다', async () => {
    const wrapper = mount(CartView);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();
    
    const orderBtn = wrapper.find('.summary-card button');
    await orderBtn.trigger('click');

    expect(confirmSpy).toHaveBeenCalled();
    expect(checkoutCart).toHaveBeenCalledTimes(1);

    await vi.runAllTimers();
    expect(alertSpy).toHaveBeenCalledWith('주문이 성공적으로 완료되었습니다! 주문 번호: ORDER_SUCCESS_123');
    expect(fetchCartItems).toHaveBeenCalledTimes(2);
  });

  it('장바구니가 비었을 때 메시지를 표시해야 합니다', async () => {
    fetchCartItems.mockResolvedValue({ success: true, data: { items: [] } });
    const wrapper = mount(CartView);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('장바구니에 담긴 상품이 없습니다.');
  });
});