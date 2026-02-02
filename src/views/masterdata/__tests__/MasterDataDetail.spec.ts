import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRoute, useRouter } from 'vue-router'
import http from '@/api/axios'
import MasterDataDetail from '../MasterDataDetail.vue'

// 1. Mock 함수들을 최상단에서 정의 (변수명은 반드시 'mock'으로 시작해야 호이스팅 시 에러가 안 남)
const mockRouterPush = vi.fn()
const mockRouterBack = vi.fn()

// 2. 모듈 모킹
vi.mock('vue-router', () => ({
    useRoute: vi.fn(),
    useRouter: vi.fn(() => ({
        push: mockRouterPush,
        back: mockRouterBack,
    })),
}))

vi.mock('@/api/axios', () => ({
    default: {
        get: vi.fn(),
        put: vi.fn(),
    },
}))

// 3. 타입 안전하게 Mock 인스턴스 가져오기 (vi.mocked 사용)
const mockedGet = vi.mocked(http.get)
const mockedPut = vi.mocked(http.put)
const mockedUseRoute = vi.mocked(useRoute)

describe('MasterDataDetail.vue', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // 4. 타입 추론이 완료된 mockedUseRoute 사용
        mockedUseRoute.mockReturnValue({
            params: { skuNo: 'SKU123' },
            query: {},
            hash: '',
            fullPath: '',
            matched: [],
            meta: {},
            name: undefined,
            path: ''
        } as any);

        return mount(MasterDataDetail, {
            global: {
                stubs: {
                    BaseButton: {
                        template: '<button @click="$emit(\'click\')"><slot /></button>',
                        emits: ['click']
                    },
                },
                mocks: {
                    $router: {
                        push: mockRouterPush,
                        back: mockRouterBack,
                    },
                },
            },
        })
    }

    beforeEach(() => {
        vi.clearAllMocks()
        mockedGet.mockResolvedValue({ data: mockDetail })
        mockedPut.mockResolvedValue({ data: {} })

        // window 메서드 모킹
        window.confirm = vi.fn(() => true)
        window.alert = vi.fn()
    })

    it('마운트 시 상세 데이터를 불러와 렌더링합니다', async () => {
        wrapper = mountComponent()
        await flushPromises()

        expect(mockedGet).toHaveBeenCalledWith('/master-data/items/SKU123')
        expect(wrapper.text()).toContain('상세 테스트 사과')
        expect(wrapper.text()).toContain('IC123')
        expect(wrapper.text()).toContain('사용중')
    })

    it('"수정하기" 버튼 클릭 시 수정 페이지로 이동합니다', async () => {
        wrapper = mountComponent()
        await flushPromises()

        const buttons = wrapper.findAll('button')
        const editButton = buttons.find((b: any) => b.text().includes('수정하기'))

        expect(editButton).toBeTruthy()
        await editButton.trigger('click')

        expect(mockRouterPush).toHaveBeenCalledWith('/admin/masterData/edit/SKU123')
    })

    it('"목록으로" 버튼 클릭 시 이전 페이지로 돌아갑니다', async () => {
        wrapper = mountComponent()
        await flushPromises()

        const buttons = wrapper.findAll('button')
        const backButton = buttons.find((b: any) => b.text().includes('목록으로'))

        await backButton.trigger('click')
        expect(mockRouterBack).toHaveBeenCalledTimes(1)
    })

    it('"사용 중지" 버튼 클릭 시 상태 변경 API를 호출하고 UI를 업데이트합니다', async () => {
        wrapper = mountComponent()
        await flushPromises()

        const toggleButton = wrapper.find('.btn-red')
        await toggleButton.trigger('click')

        expect(window.confirm).toHaveBeenCalled()
        expect(mockedPut).toHaveBeenCalledWith('/master-data/IC123/status', { isActive: false })

        await flushPromises()
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