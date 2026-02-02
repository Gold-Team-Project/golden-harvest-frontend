import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRoute, useRouter } from 'vue-router'
import MasterDataEdit from '../MasterDataEdit.vue'
import axiosInstance from '@/api/axios'

// 1. 변수명은 반드시 'mock'으로 시작해야 호이스팅 에러가 나지 않습니다.
const mockRouterPush = vi.fn()
const mockRouterBack = vi.fn()

// 2. 모듈 모킹 (내부에서 mockRouterPush 등을 사용)
vi.mock('vue-router', () => ({
    useRoute: vi.fn(),
    useRouter: vi.fn(() => ({
        push: mockRouterPush,
        back: mockRouterBack,
    })),
}))

// 3. axios 메서드 스파이 설정 및 타입 정의
const mockedGet = vi.spyOn(axiosInstance, 'get')
const mockedPatch = vi.spyOn(axiosInstance, 'patch')
const mockedUseRoute = vi.mocked(useRoute)

describe('MasterDataEdit.vue', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let wrapper: any

    const mockDetail = {
        data: {
            skuNo: 'SKU456',
            itemCode: 'IC456',
            itemName: '수정 테스트 사과',
            description: '오래된 설명',
            shelfLifeDays: 10,
            storageTempMin: 1,
            storageTempMax: 5,
        },
    }

    function mountComponent() {
        // 4. useRoute 반환값 타입 안전하게 설정
        mockedUseRoute.mockReturnValue({
            params: { skuNo: 'SKU456' }
        } as any);

        return mount(MasterDataEdit, {
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
        mockedPatch.mockResolvedValue({ data: {} })
        window.confirm = vi.fn(() => true)
        window.alert = vi.fn()

        // global.URL 대신 vi.stubGlobal 사용 (TypeScript 에러 방지)
        vi.stubGlobal('URL', {
            createObjectURL: vi.fn(() => 'blob:http://localhost/mock-url')
        })
    })

    it('마운트 시 데이터를 불러와 폼을 채웁니다', async () => {
        wrapper = mountComponent()
        await flushPromises()
        await wrapper.vm.$nextTick();

        expect(mockedGet).toHaveBeenCalledWith('/master-data/items/SKU456')
        expect(wrapper.vm.form.description).toBe('오래된 설명');
        expect(wrapper.vm.form.shelfLifeDays).toBe(10);

        const descriptionInput = wrapper.find('textarea').element as HTMLTextAreaElement;
        expect(descriptionInput.value).toBe('오래된 설명');
    })

    it('"취소" 버튼 클릭 시 이전 페이지로 돌아갑니다', async () => {
        wrapper = mountComponent()
        await flushPromises()

        const cancelButton = wrapper.findAll('button').find((b: any) => b.text().includes('취소'))
        expect(cancelButton).toBeTruthy()
        await cancelButton!.trigger('click')

        expect(mockRouterBack).toHaveBeenCalledTimes(1)
    })

    it('폼 수정 후 "저장하기"를 누르면 patch API를 호출하고 상세 페이지로 이동합니다', async () => {
        wrapper = mountComponent()
        await flushPromises()

        // 1. 수정 작업
        await wrapper.find('textarea').setValue('새로운 설명입니다.')
        wrapper.vm.form.shelfLifeDays = 15;
        await wrapper.vm.$nextTick();

        // 2. 저장 버튼 클릭
        const saveButton = wrapper.findAll('button').find((b: any) => b.text().includes('저장하기'))
        expect(saveButton).toBeTruthy()
        await saveButton!.trigger('click')

        expect(window.confirm).toHaveBeenCalledWith('수정 내용을 저장하시겠습니까?')

        // 3. API 호출 검증
        expect(mockedPatch).toHaveBeenCalledTimes(1)

        const [url, formData, config] = mockedPatch.mock.calls[0] as [string, FormData, any]
        expect(url).toBe('/master-data/IC456')
        expect(formData).toBeInstanceOf(FormData)
        expect(config.headers['Content-Type']).toBe('multipart/form-data')

        const requestData = JSON.parse(formData.get('request') as string)
        expect(requestData).toEqual({
            description: '새로운 설명입니다.',
            shelfLifeDays: 15,
            storageTempMin: 1,
            storageTempMax: 5,
        })

        expect(formData.get('file')).toBeNull()

        // 4. 네비게이션 검증
        await flushPromises()
        expect(window.alert).toHaveBeenCalledWith('성공적으로 수정되었습니다.')

        // [수정 포인트] 실제 호출된 문자열 경로로 검증합니다.
        expect(mockRouterPush).toHaveBeenCalledWith("/admin/masterData/SKU456");
    })

    it('파일을 첨부하고 저장하면 FormData에 파일이 포함됩니다', async () => {
        wrapper = mountComponent()
        await flushPromises()

        const fileInput = wrapper.find('input[type="file"]')
        const file = new File(['dummy-content'], 'test.png', { type: 'image/png' })

        Object.defineProperty(fileInput.element, 'files', {
            value: [file],
            writable: false,
        });
        await fileInput.trigger('change')
        await flushPromises()

        expect(wrapper.find('img').attributes('src')).toBe('blob:http://localhost/mock-url')

        const saveButton = wrapper.findAll('button').find((b: any) => b.text().includes('저장하기'))
        await saveButton!.trigger('click')

        const formData = mockedPatch.mock.calls[0][1] as FormData
        const attachedFile = formData.get('file')
        expect(attachedFile).toBeInstanceOf(File)
        expect((attachedFile as File).name).toBe('test.png')
    })
})