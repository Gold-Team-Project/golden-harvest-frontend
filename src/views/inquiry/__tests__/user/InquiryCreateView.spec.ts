import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// 1) router mock (push만 필요)
const pushMock = vi.fn()
vi.mock('vue-router', () => ({
    useRouter: () => ({ push: pushMock }),
}))

// 2) http mock (post만 필요)
vi.mock('@/api/axios', () => ({
    default: {
        post: vi.fn(),
    },
}))

import http from '@/api/axios'
import InquiryCreate from '@/views/inquiry/user/InquiryCreateView.vue'

const mockedPost = http.post as unknown as ReturnType<typeof vi.fn>

function mountPage() {
    return mount(InquiryCreate, {
        global: {
            stubs: {
                BaseButton: {
                    template: `<button data-testid="submit" @click="$emit('click')"><slot /></button>`,
                    emits: ['click'],
                },
            },
        },
    })
}

async function readFormDataJson(formData: FormData, key: string) {
    const val = formData.get(key)

    // 없으면 바로 에러 내서 원인을 명확히
    expect(val, `FormData에 "${key}"가 없습니다`).toBeTruthy()

    // Blob이면 text()로 읽기
    if (val instanceof Blob) {
        const text = await val.text()
        return JSON.parse(text)
    }

    // string이면 그대로 파싱
    if (typeof val === 'string') {
        return JSON.parse(val)
    }

    // 그 외 타입이면 문자열로 변환 시도
    return JSON.parse(String(val))
}

describe('InquiryCreateView UI', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('입력 후 작성 완료 클릭 시 /inquiries로 POST하고 /inquiries로 이동한다 (파일 없음)', async () => {
        mockedPost.mockResolvedValueOnce({ data: {} })

        const wrapper = mountPage()

        const titleInput = wrapper.find('input[placeholder="제목을 입력해주세요"]')
        const bodyTextarea = wrapper.find('textarea[placeholder="문의하실 내용을 상세히 작성해주세요"]')

        await titleInput.setValue('테스트 제목')
        await bodyTextarea.setValue('테스트 내용')

        await wrapper.find('[data-testid="submit"]').trigger('click')
        await flushPromises()

        expect(mockedPost).toHaveBeenCalledTimes(1)

        const [url, formData] = mockedPost.mock.calls[0]
        expect(url).toBe('/inquiries')
        expect(formData).toBeInstanceOf(FormData)

        // ✅ request(JSON) 검증 (환경에 따라 Blob/string 둘 다 대응)
        const payload = await readFormDataJson(formData as FormData, 'request')

        expect(payload).toEqual({
            title: '테스트 제목',
            body: '테스트 내용',
            salesOrderId: 1,
        })

        // 파일 없으면 null
        expect((formData as FormData).get('file')).toBeNull()

        // 라우팅 이동 검증
        expect(pushMock).toHaveBeenCalledTimes(1)
        expect(pushMock).toHaveBeenCalledWith('/inquiries')
    })

    it('파일을 첨부하면 FormData에 file이 포함된다', async () => {
        mockedPost.mockResolvedValueOnce({ data: {} })

        const wrapper = mountPage()

        await wrapper.find('input[placeholder="제목을 입력해주세요"]').setValue('파일 테스트')
        await wrapper
            .find('textarea[placeholder="문의하실 내용을 상세히 작성해주세요"]')
            .setValue('파일 포함 테스트')

        // ✅ 파일 업로드 (jsdom 안정 버전)
        const fileInputWrapper = wrapper.find('input[type="file"]')
        const inputEl = fileInputWrapper.element as HTMLInputElement
        const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })

        Object.defineProperty(inputEl, 'files', {
            value: [file],
            writable: false,
        })

        await fileInputWrapper.trigger('change')
        await flushPromises()

        // 제출
        await wrapper.find('[data-testid="submit"]').trigger('click')
        await flushPromises()

        expect(mockedPost).toHaveBeenCalledTimes(1)

        const [, formData] = mockedPost.mock.calls[0]
        expect(formData).toBeInstanceOf(FormData)

        // request도 같이 검증(선택)
        const payload = await readFormDataJson(formData as FormData, 'request')
        expect(payload).toEqual({
            title: '파일 테스트',
            body: '파일 포함 테스트',
            salesOrderId: 1,
        })

        // ✅ file 포함 검증
        const uploaded = (formData as FormData).get('file') as File
        expect(uploaded).toBeInstanceOf(File)
        expect(uploaded.name).toBe('hello.txt')
    })
})
