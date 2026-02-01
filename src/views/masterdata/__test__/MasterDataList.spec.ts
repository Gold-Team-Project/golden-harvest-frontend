import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRouter } from 'vue-router'
import http from '@/api/axios'
import MasterDataList from '../MasterDataList.vue'

// Mock dependencies
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

vi.mock('@/api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

const mockedGet = http.get as vi.Mock
const mockedRouterPush = vi.fn()

describe('MasterDataList.vue', () => {
  let wrapper: any

  const mockItems = {
    data: {
      content: [
        { skuNo: 'SKU001', itemName: '테스트 사과', varietyName: '부사', gradeName: '특', status: true, createdAt: '2023-01-01T10:00:00' },
        { skuNo: 'SKU002', itemName: '테스트 배', varietyName: '신고', gradeName: '상', status: false, createdAt: '2023-01-02T11:00:00' },
      ],
    },
  }

  // Helper to mount the component
  function mountComponent() {
    return mount(MasterDataList, {
      global: {
        stubs: {
          Pagination: {
            props: ['pages', 'current'],
            emits: ['update:current'],
            template: `<div id="pagination-stub" @click="$emit('update:current', 2)"></div>`
          },
          StatusBadge: { template: '<span><slot /></span>' },
          BaseButton: { template: '<button @click="$emit(\'click\')"><slot /></button>', emits: ['click'] },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as vi.Mock).mockReturnValue({ push: mockedRouterPush });
    mockedGet.mockResolvedValue({ data: mockItems });
  })

  it('마운트 시 품목 목록을 불러와 렌더링합니다', async () => {
    wrapper = mountComponent()
    await flushPromises()

    expect(mockedGet).toHaveBeenCalledTimes(1)
    expect(mockedGet).toHaveBeenCalledWith('/master-data/items', expect.any(Object))

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2)
    expect(rows[0].text()).toContain('테스트 사과')
    expect(rows[0].text()).toContain('활성화')
    expect(rows[1].text()).toContain('테스트 배')
    expect(rows[1].text()).toContain('비활성화')
  })

  it('품목 데이터가 없을 때 메시지를 표시합니다', async () => {
    mockedGet.mockResolvedValueOnce({ data: { data: { content: [] } } })
    wrapper = mountComponent()
    await flushPromises()

    const row = wrapper.find('tbody tr')
    expect(row.text()).toBe('품목 데이터가 없습니다.')
    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
  })

  it('"검색" 버튼 클릭 시 입력된 값으로 API를 다시 호출합니다', async () => {
    wrapper = mountComponent()
    await flushPromises() // Initial fetch

    await wrapper.find('input[placeholder="품목명"]').setValue('사과')
    await wrapper.find('select').setValue('true')

    const searchButton = wrapper.findAll('button').find((b: any) => b.text().includes('검색'))
    expect(searchButton).toBeTruthy()
    await searchButton!.trigger('click')
    await flushPromises()

    expect(mockedGet).toHaveBeenCalledTimes(2)
    expect(mockedGet).toHaveBeenLastCalledWith('/master-data/items', {
      params: expect.objectContaining({
        itemName: '사과',
        status: true,
      }),
    })
  })

  it('Pagination에서 페이지 변경 시 API를 다시 호출합니다', async () => {
    wrapper = mountComponent()
    await flushPromises()
    expect(mockedGet).toHaveBeenCalledTimes(1)

    await wrapper.find('#pagination-stub').trigger('click')
    await flushPromises()

    expect(mockedGet).toHaveBeenCalledTimes(2)
    expect(mockedGet).toHaveBeenLastCalledWith('/master-data/items', expect.objectContaining({
      params: expect.objectContaining({ page: 2 }),
    }))
  })

  it('"상세보기" 버튼 클릭 시 상세 페이지로 이동합니다', async () => {
    wrapper = mountComponent()
    await flushPromises()

    const detailButton = wrapper.find('tbody tr:first-of-type').findAll('button').find((b: any) => b.text().includes('상세보기'))
    expect(detailButton).toBeTruthy()
    await detailButton!.trigger('click')

    expect(mockedRouterPush).toHaveBeenCalledWith({
      name: 'adminMasterDataDetail',
      params: { skuNo: 'SKU001' },
    })
  })
})
