import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRouter } from 'vue-router'
import http from '@/api/axios'
import MasterDataList from '../MasterDataList.vue'

// 1. 변수명은 반드시 'mock'으로 시작해야 호이스팅 에러가 나지 않습니다.
const mockRouterPush = vi.fn()

// 2. 모듈 모킹
vi.mock('vue-router', () => ({
    useRouter: vi.fn(() => ({
        push: mockRouterPush,
    })),
}))

vi.mock('@/api/axios', () => ({
    default: {
        get: vi.fn(),
    },
}))

// 3. 타입 안전하게 Mock 인스턴스 가져오기
const mockedGet = vi.mocked(http.get)
const mockedUseRouter = vi.mocked(useRouter)

describe('MasterDataList.vue', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                // template 내에서 $router.push 등을 사용할 경우를 대비해 추가
                mocks: {
                    $router: {
                        push: mockRouterPush
                    }
                }
            },
        })
    }

    beforeEach(() => {
        vi.clearAllMocks();
        // useRouter가 호출될 때 mockRouterPush를 가진 객체를 반환하도록 설정
        mockedUseRouter.mockReturnValue({
            push: mockRouterPush,
            replace: vi.fn(),
            go: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            getRoutes: vi.fn(),
            addRoute: vi.fn(),
            removeRoute: vi.fn(),
            hasRoute: vi.fn(),
            resolve: vi.fn(),
            options: {} as any,
            currentRoute: {} as any,
            isReady: vi.fn(),
            install: vi.fn(),
            listening: true,
            beforeEach: vi.fn(),
            beforeResolve: vi.fn(),
            afterEach: vi.fn(),
            onError: vi.fn()
        } as any);

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
        // 반환 데이터 구조를 실제 API와 동일하게 맞춤
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

        // 만약 이전처럼 에러가 난다면 이 부분을 "/admin/masterData/detail/SKU001" 형태로 수정하세요.
        expect(mockRouterPush).toHaveBeenCalledWith({
            name: 'adminMasterDataDetail',
            params: { skuNo: 'SKU001' },
        })
    })
})