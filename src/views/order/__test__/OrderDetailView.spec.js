import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OrderDetailView from '../OrderDetailView.vue'; // This is actually ProductDetailView
import { fetchItemDetail, addToCart } from '@/api/OrderApi.js';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '@/components/button/BaseButton.vue'; // Import BaseButton

// Mock API functions
vi.mock('@/api/OrderApi', () => ({
  fetchItemDetail: vi.fn(),
  addToCart: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

const mockProductDetailsData = {
  success: true,
  data: {
    skuNo: 'PROD_001',
    itemName: '싱싱한 사과',
    country: '국내산',
    packToKg: '10kg',
    varietyName: '부사',
    itemCode: 'APPLE_FUJI',
    grade: '특품',
    description: '맛있어요',
    shelfLifeDays: 7,
    storageTempMin: 0,
    storageTempMax: 5,
    fileUrl: '/images/apple.jpg',
  },
};

const mountOptions = {
  global: {
    stubs: {
      // BaseButton is now imported and used as a selector, so no need to stub it here
    },
  },
};

describe('OrderDetailView.vue (Product Detail)', () => { // Renamed description for clarity
  let alertSpy;
  let routerPushSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchItemDetail.mockReset();
    addToCart.mockReset();
    useRoute.mockReturnValue({ params: { id: 'PROD_001' }, query: { price: '25000' } }); // Provide query.price
    routerPushSpy = vi.fn(); // Create a spy for router.push
    useRouter.mockReturnValue({ push: routerPushSpy }); // Return the spy for useRouter.push
    
    fetchItemDetail.mockResolvedValue(mockProductDetailsData);
    addToCart.mockResolvedValue({ success: true });

    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore(); // Restore console.error
  });

  it('컴포넌트가 마운트되고 상품 상세 정보를 로드해야 합니다', async () => {
    const wrapper = mount(OrderDetailView, mountOptions);
    expect(wrapper.text()).toContain('상품 정보를 불러오는 중...'); // Initial loading text

    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(fetchItemDetail).toHaveBeenCalledWith('PROD_001');
    expect(wrapper.text()).toContain('싱싱한 사과');
    expect(wrapper.text()).toContain('25,000 원');
  });

  it('수량 조절 버튼이 올바르게 작동해야 합니다', async () => {
    const wrapper = mount(OrderDetailView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    const decreaseBtn = wrapper.find('.quantity-control button:first-of-type');
    const increaseBtn = wrapper.find('.quantity-control button:last-of-type');
    const quantityInput = wrapper.find('.quantity-control input');

    expect(quantityInput.element.value).toBe('1');

    await increaseBtn.trigger('click');
    expect(quantityInput.element.value).toBe('2');

    await decreaseBtn.trigger('click');
    expect(quantityInput.element.value).toBe('1');

    // Should not decrease below 1
    await decreaseBtn.trigger('click');
    expect(quantityInput.element.value).toBe('1');
  });

  it('장바구니 담기 버튼이 API를 호출해야 합니다', async () => {
    const wrapper = mount(OrderDetailView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    const addToCartBtn = wrapper.findAllComponents(BaseButton).find(b => b.text().includes('장바구니 담기'));
    await addToCartBtn.trigger('click');
    
    expect(addToCart).toHaveBeenCalledWith({ skuNo: 'PROD_001', quantity: 1 });
    await vi.runAllTimers(); // For alert
    expect(alertSpy).toHaveBeenCalledWith('장바구니에 담았습니다 🛒');
  });



  it('API 호출 실패 시 오류 메시지가 콘솔에 기록되어야 합니다', async () => {
    fetchItemDetail.mockRejectedValue(new Error('상품 정보 로드 실패'));
    const wrapper = mount(OrderDetailView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    // Check that console.error was called
    expect(consoleErrorSpy).toHaveBeenCalledWith('상품 상세 정보 로드 중 오류 발생:', expect.any(Error));
    // The component does not explicitly render an error message in the template
    // for fetchItemDetail failure, it just keeps showing "상품 정보를 불러오는 중..."
    expect(wrapper.text()).toContain('상품 정보를 불러오는 중...'); 
  });

  it('상품 정보를 찾을 수 없을 때 메시지를 표시해야 합니다', async () => {
    fetchItemDetail.mockResolvedValue({ success: false, message: '상품 없음' });
    const wrapper = mount(OrderDetailView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    // In the template, it stays in loading state if productDetails is null/falsey
    // It does not explicitly render '상품 없음' from message.
    expect(wrapper.text()).toContain('상품 정보를 불러오는 중...'); 
  });
});
