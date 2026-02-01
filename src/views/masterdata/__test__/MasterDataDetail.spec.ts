import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRoute, useRouter } from 'vue-router'
import http from '@/api/axios'
import MasterDataDetail from '../MasterDataDetail.vue'

// Mock dependencies
vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
  })),
}))

vi.mock('@/api/axios', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

const mockedGet = http.get as vi.Mock
const mockedPut = http.put as vi.Mock
const mockedRouterPush = vi.fn()
const mockedRouterBack = vi.fn()

describe('MasterDataDetail.vue', () => {
  let wrapper: any

  const mockDetail = {
    data: {
      skuNo: 'SKU123',
      itemCode: 'IC123',
      itemName: '상세 테스트 사과',
      varietyName: '아오리',
      isActive: true,
      originPrices: [
        { originPrice: 10000, unit: 'BOX', createdAt: '2023-02-01T00:00:00' },
      ],
      createdAt: '2023-01-15T00:00:00'
    },
  }

  function mountComponent() {
    // Mock route and router before each mount
    ;(useRoute as vi.Mock).mockReturnValue({ params: { skuNo: 'SKU123' } });
    (useRouter as vi.Mock).mockReturnValue({ push: mockedRouterPush, back: mockedRouterBack });
    
    return mount(MasterDataDetail, {
      global: {
        stubs: {
          BaseButton: { template: '<button @click="$emit(\'click\')"><slot /></button>', emits: ['click'] },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockedGet.mockResolvedValue({ data: mockDetail })
    mockedPut.mockResolvedValue({})
    // Mock window.confirm and alert
    window.confirm = vi.fn(() => true)
    window.alert = vi.fn()
  })

  it('마운트 시 상세 데이터를 불러와 렌더링합니다', async () => {
    wrapper = mountComponent()
    await flushPromises()

    expect(mockedGet).toHaveBeenCalledTimes(1)
    expect(mockedGet).toHaveBeenCalledWith('/master-data/items/SKU123')

    expect(wrapper.text()).toContain('상세 테스트 사과')
    expect(wrapper.text()).toContain('IC123')
    expect(wrapper.text()).toContain('사용중')
    expect(wrapper.text()).toContain('10,000 원') // formatNumber
  })

  it('"수정하기" 버튼 클릭 시 수정 페이지로 이동합니다', async () => {
    wrapper = mountComponent()
    await flushPromises()

    const editButton = wrapper.findAll('button').find((b: any) => b.text().includes('수정하기'))
    expect(editButton).toBeTruthy()
    await editButton!.trigger('click')

    expect(mockedRouterPush).toHaveBeenCalledWith('/admin/masterData/edit/SKU123')
  })

  it('"목록으로" 버튼 클릭 시 이전 페이지로 돌아갑니다', async () => {
    wrapper = mountComponent()
    await flushPromises()

    const backButton = wrapper.findAll('button').find((b: any) => b.text().includes('목록으로'))
    expect(backButton).toBeTruthy()
    await backButton!.trigger('click')

    expect(mockedRouterBack).toHaveBeenCalledTimes(1)
  })

  it('"사용 중지" 버튼 클릭 시 상태 변경 API를 호출하고 UI를 업데이트합니다', async () => {
    wrapper = mountComponent()
    await flushPromises()

    // Initial state
    expect(wrapper.text()).toContain('사용중')

    const toggleButton = wrapper.find('.btn-red') // Initially '사용 중지'
    expect(toggleButton.exists()).toBe(true)
    await toggleButton.trigger('click')

    expect(window.confirm).toHaveBeenCalledWith('해당 품목을 중지 상태로 변경하시겠습니까?')
    expect(mockedPut).toHaveBeenCalledTimes(1)
    expect(mockedPut).toHaveBeenCalledWith('/master-data/IC123/status', { isActive: false })

    await flushPromises()

    // UI updated after successful PUT
    expect(wrapper.text()).toContain('사용중지')
    const newToggleButton = wrapper.find('.btn-green') // Now '사용 전환'
    expect(newToggleButton.text()).toBe('사용 전환')
    expect(window.alert).toHaveBeenCalledWith('상태가 변경되었습니다.')
  })
  
  it('API 호출 실패 시 에러를 로그에 기록합니다', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedGet.mockRejectedValueOnce(new Error('Failed to fetch'))
    
    wrapper = mountComponent()
    await flushPromises()
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('[DETAIL] 상세 정보 조회 실패:', expect.any(Error))
    consoleErrorSpy.mockRestore()
  })
})
