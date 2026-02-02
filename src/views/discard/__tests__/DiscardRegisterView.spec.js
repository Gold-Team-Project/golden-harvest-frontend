import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DiscardRegisterView from '@/views/discard/DiscardRegisterView.vue';
import * as DiscardApi from '@/api/DiscardApi.js';

// 1. API 모의 처리
vi.mock('@/api/DiscardApi.js');

// 2. vue-router 모의 처리
const pushMock = vi.fn();
const backMock = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
    back: backMock,
  }),
}));

// 3. window.alert 모의 처리
window.alert = vi.fn();


describe('DiscardRegisterView.vue', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountComponent = () => {
    return mount(DiscardRegisterView, {
      global: {
        stubs: {
          BaseButton: { template: '<button><slot /></button>' }, // BaseButton 스텁 처리: 슬롯 콘텐츠를 렌더링하도록
        },
        mocks: {
          $router: { // 템플릿의 $router 접근을 위해 모의 라우터 제공
            push: pushMock,
            back: backMock,
          },
        },
      }
    });
  };

  describe('렌더링', () => {
    it('필요한 모든 폼 필드와 버튼이 렌더링된다', () => {
      const wrapper = mountComponent();
      expect(wrapper.find('#lot-id').exists()).toBe(true);
      expect(wrapper.find('#discard-quantity').exists()).toBe(true);
      expect(wrapper.find('#discard-reason').exists()).toBe(true);
      expect(wrapper.find('#reason-detail').exists()).toBe(true);
      expect(wrapper.find('.btn-primary').text()).toBe('폐기 등록');
      expect(wrapper.find('.btn-secondary').text()).toBe('취소');
    });
  });

  describe('유효성 검사', () => {
    it('LOT 번호 없이 제출 시 경고 메시지를 표시한다', async () => {
      const wrapper = mountComponent();
      await wrapper.find('#discard-quantity').setValue(10);
      await wrapper.find('#discard-reason').setValue('DAMAGED');
      
      await wrapper.find('.btn-primary').trigger('click');
      
      expect(window.alert).toHaveBeenCalledWith('LOT 번호를 입력해주세요.');
      expect(DiscardApi.registerDiscard).not.toHaveBeenCalled();
    });

    it('폐기 수량 없이 제출 시 경고 메시지를 표시한다', async () => {
      const wrapper = mountComponent();
      await wrapper.find('#lot-id').setValue('LOT123');
      await wrapper.find('#discard-reason').setValue('DAMAGED');
      
      await wrapper.find('.btn-primary').trigger('click');
      
      expect(window.alert).toHaveBeenCalledWith('폐기 수량을 1 이상으로 입력해주세요.');
      expect(DiscardApi.registerDiscard).not.toHaveBeenCalled();
    });

    it('폐기 수량이 0 이하일 때 경고 메시지를 표시한다', async () => {
      const wrapper = mountComponent();
      await wrapper.find('#lot-id').setValue('LOT123');
      await wrapper.find('#discard-quantity').setValue(0);
      await wrapper.find('#discard-reason').setValue('DAMAGED');
      
      await wrapper.find('.btn-primary').trigger('click');
      
      expect(window.alert).toHaveBeenCalledWith('폐기 수량을 1 이상으로 입력해주세요.');
      expect(DiscardApi.registerDiscard).not.toHaveBeenCalled();
    });

    it('폐기 사유 없이 제출 시 경고 메시지를 표시한다', async () => {
      const wrapper = mountComponent();
      await wrapper.find('#lot-id').setValue('LOT123');
      await wrapper.find('#discard-quantity').setValue(10);
      
      await wrapper.find('.btn-primary').trigger('click');
      
      expect(window.alert).toHaveBeenCalledWith('폐기 사유를 선택해주세요.');
      expect(DiscardApi.registerDiscard).not.toHaveBeenCalled();
    });
  });

  describe('폼 제출', () => {
    const fillForm = async (wrapper) => {
      await wrapper.find('#lot-id').setValue('LOT123');
      await wrapper.find('#discard-quantity').setValue(10);
      await wrapper.find('#discard-reason').setValue('DAMAGED');
      await wrapper.find('#reason-detail').setValue('상세 사유');
    };

    it('유효한 데이터로 제출 시 registerDiscard API를 호출하고 리다이렉션한다', async () => {
      DiscardApi.registerDiscard.mockResolvedValue({});
      const wrapper = mountComponent();
      await fillForm(wrapper);
      
      await wrapper.find('.btn-primary').trigger('click');
      await flushPromises();

      expect(DiscardApi.registerDiscard).toHaveBeenCalledWith({
        lotNo: 'LOT123',
        quantity: 10,
        discardStatus: 'DAMAGED',
        description: '상세 사유',
      });
      expect(window.alert).toHaveBeenCalledWith('폐기 등록이 완료되었습니다.');
      expect(pushMock).toHaveBeenCalledWith({ name: 'adminDiscardList' });
    });

    it('API 제출 실패 시 에러 알림을 표시하고 리다이렉션하지 않는다', async () => {
      DiscardApi.registerDiscard.mockRejectedValue(new Error('API error'));
      const wrapper = mountComponent();
      await fillForm(wrapper);
      
      await wrapper.find('.btn-primary').trigger('click');
      await flushPromises();

      expect(DiscardApi.registerDiscard).toHaveBeenCalledTimes(1);
      expect(window.alert).toHaveBeenCalledWith('폐기 등록 중 오류가 발생했습니다.');
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  describe('취소 버튼', () => {
    it('"취소" 버튼 클릭 시 router.back()을 호출한다', async () => {
      const wrapper = mountComponent();
      
      await wrapper.find('.btn-secondary').trigger('click');
      
      expect(backMock).toHaveBeenCalledTimes(1);
    });
  });
});
