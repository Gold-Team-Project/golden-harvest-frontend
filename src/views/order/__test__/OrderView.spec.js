import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OrderView from '../OrderView.vue';
import { fetchProducts } from '@/api/OrderApi.js';

// Mock API functions
vi.mock('@/api/OrderApi', () => ({
  fetchProducts: vi.fn(),
}));

const mockProductsData = {
  success: true,
  data: [
    { skuNo: 'P001', itemName: '맛있는 사과', customerPrice: 15000, baseUnit: '1kg', varietyName: '부사', gradeName: '특', fileUrl: '/images/apple.jpg' },
    { skuNo: 'P002', itemName: '싱싱한 배', customerPrice: 25000, baseUnit: '1개', varietyName: '신고', gradeName: '상', fileUrl: '/images/pear.jpg' },
  ],
};

const mountOptions = {
  global: {
    stubs: {
      BaseButton: true, // Stub BaseButton
      RouterLink: {
        template: '<a class="product-link" :href="to.name ? `/product/${to.params.id}?price=${to.query.price}` : to.path"><slot /></a>', // Add class here
        props: ['to'],
      },
    },
  },
};

describe('OrderView.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchProducts.mockReset();
    fetchProducts.mockResolvedValue(mockProductsData);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('마운트 시 상품을 불러오고 렌더링해야 합니다', async () => {
    const wrapper = mount(OrderView, mountOptions);
    
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(fetchProducts).toHaveBeenCalledTimes(1);
    expect(wrapper.findAll('.product-card')).toHaveLength(2);
    expect(wrapper.text()).toContain('맛있는 사과');
    expect(wrapper.text()).toContain('싱싱한 배');
  });

  it('상품 카드 세부 정보가 올바르게 렌더링되어야 합니다', async () => {
    const wrapper = mount(OrderView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    const firstProductCard = wrapper.findAll('.product-card')[0]; // This is the div inside router-link
    const firstProductLink = wrapper.findAll('.product-link')[0]; // This is the router-link stub itself

    expect(firstProductCard.find('.product-name').text()).toBe('맛있는 사과');
    expect(firstProductCard.find('.product-price .price-value').text()).toBe('15,000원');
    expect(firstProductCard.find('.product-price .price-unit').text().trim()).toBe('/ 1kg');
    expect(firstProductCard.find('.product-category').text()).toBe('부사 | 특');
    expect(firstProductCard.find('.product-image').attributes('src')).toBe('/images/apple.jpg');
    expect(firstProductLink.attributes('href')).toBe('/product/P001?price=15000'); // Assert on the link itself
  });

  it('상품이 없을 때 메시지를 표시해야 합니다 (또는 빈 그리드)', async () => {
    fetchProducts.mockResolvedValue({ success: true, data: [] });
    const wrapper = mount(OrderView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll('.product-card')).toHaveLength(0);
    expect(wrapper.find('.product-grid').exists()).toBe(true);
    expect(wrapper.find('.product-grid').html()).not.toContain('<div class="product-card">');
  });

  it('API 호출 실패 시 오류를 콘솔에 기록해야 합니다', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchProducts.mockRejectedValue(new Error('네트워크 에러'));
    const wrapper = mount(OrderView, mountOptions);
    await vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(errorSpy).toHaveBeenCalledWith('상품을 불러오는 중 에러가 발생했습니다:', expect.any(Error));
    errorSpy.mockRestore();
  });
});