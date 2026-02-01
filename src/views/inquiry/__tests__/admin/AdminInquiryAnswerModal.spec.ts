import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/api/axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}))

import http from '@/api/axios'
import AdminInquiryAnswerModal from '@/views/inquiry/modal/AdminInquiryAnswerModal.vue' // 경로 맞추기

const mockedGet = http.get as unknown as ReturnType<typeof vi.fn>
const mockedPost = http.post as unknown as ReturnType<typeof vi.fn>

describe('AdminInquiryAnswerModal.vue', () => {
    const originalAlert = window.alert

    beforeEach(() => {
        vi.clearAllMocks()
        window.alert = vi.fn()
    })

    afterEach(() => {
        window.alert = originalAlert
        vi.restoreAllMocks()
    })

    function mountModal(props?: Partial<{ inquiryNo: string; no: number }>) {
        return mount(AdminInquiryAnswerModal, {
            props: {
                inquiryNo: 'INQ-1',
                no: 1,
                ...props,
            },
            global: {
                stubs: {
                    BaseButton: {
                        emits: ['click'],
                        template: `<button data-testid="btn" @click="$emit('click')"><slot /></button>`,
                    },
                    StatusBadge: {
                        template: `<span data-testid="badge"><slot /></span>`,
                    },
                },
            },
        })
    }

    it('마운트 시 상세 조회 API를 호출하고 내용을 렌더링한다', async () => {
        mockedGet.mockResolvedValueOnce({
            data: {
                data: {
                    createdAt: '2026-01-30T12:00:00',
                    company: '골든상사',
                    name: '담당자',
                    phoneNumber: '010-1234-5678',
                    email: 'test@example.com',
                    processingStatus: 'N',
                    title: '제목',
                    body: '내용',
                    fileName: null,
                    downloadUrl: null,
                    comment: '기존답변',
                },
            },
        })

        const wrapper = mountModal({ inquiryNo: 'INQ-1', no: 9 })
        await flushPromises()

        expect(mockedGet).toHaveBeenCalledTimes(1)
        expect(mockedGet).toHaveBeenCalledWith('/admin/inquiries/INQ-1')

        // 렌더링 확인
        expect(wrapper.text()).toContain('문의번호')
        expect(wrapper.text()).toContain('9')
        expect(wrapper.text()).toContain('골든상사')
        expect(wrapper.text()).toContain('담당자')
        expect(wrapper.text()).toContain('010-1234-5678')
        expect(wrapper.text()).toContain('test@example.com')
        expect(wrapper.text()).toContain('제목')
        expect(wrapper.text()).toContain('내용')

        // comment가 기존 답변으로 세팅되는지(textarea v-model)
        const textarea = wrapper.find('textarea')
        expect((textarea.element as HTMLTextAreaElement).value).toBe('기존답변')

        // 상태
        expect(wrapper.text()).toContain('대기중')
    })

    it('닫기 버튼 클릭 시 close emit', async () => {
        mockedGet.mockResolvedValueOnce({ data: { data: {} } })

        const wrapper = mountModal()
        await flushPromises()

        await wrapper.find('button.close').trigger('click')
        expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('답변등록 클릭 시 POST 호출 후 answered, close emit', async () => {
        mockedGet.mockResolvedValueOnce({
            data: { data: { comment: '' } },
        })
        mockedPost.mockResolvedValueOnce({ data: { ok: true } })

        const wrapper = mountModal({ inquiryNo: 'INQ-777' })
        await flushPromises()

        // textarea 입력
        const textarea = wrapper.find('textarea')
        await textarea.setValue('새 답변')

        // 답변등록 클릭
        const submitBtn = wrapper.findAll('[data-testid="btn"]').find(b => b.text().includes('답변등록'))
        expect(submitBtn).toBeTruthy()

        await submitBtn!.trigger('click')
        await flushPromises()

        expect(mockedPost).toHaveBeenCalledTimes(1)
        expect(mockedPost).toHaveBeenCalledWith('/inquiries/INQ-777/comments', {
            comment: '새 답변',
        })

        expect(wrapper.emitted('answered')).toBeTruthy()
        expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('답변등록 실패 시 alert 호출', async () => {
        mockedGet.mockResolvedValueOnce({
            data: { data: { comment: '' } },
        })
        mockedPost.mockRejectedValueOnce(new Error('fail'))

        const wrapper = mountModal({ inquiryNo: 'INQ-500' })
        await flushPromises()

        const textarea = wrapper.find('textarea')
        await textarea.setValue('답변')

        const submitBtn = wrapper.findAll('[data-testid="btn"]').find(b => b.text().includes('답변등록'))
        await submitBtn!.trigger('click')
        await flushPromises()

        expect(window.alert).toHaveBeenCalled()
    })

    it('첨부파일이 있을 때 파일명이 보이고, downloadUrl 없으면 alert', async () => {
        mockedGet.mockResolvedValueOnce({
            data: {
                data: {
                    createdAt: '2026-01-30T12:00:00',
                    company: '골든상사',
                    name: '담당자',
                    phoneNumber: '010-1234-5678',
                    email: 'test@example.com',
                    processingStatus: 'N',
                    title: '제목',
                    body: '내용',
                    fileName: '파일.pdf',
                    downloadUrl: '-0', // 너 코드에서 "-0"이면 다운로드 없음 처리
                    comment: '',
                },
            },
        })

        const wrapper = mountModal({ inquiryNo: 'INQ-FILE' })
        await flushPromises()

        expect(wrapper.text()).toContain('📎')
        expect(wrapper.text()).toContain('파일.pdf')

        // file-box 클릭 -> downloadUrl이 "-0" 이면 alert
        await wrapper.find('.file-box').trigger('click')
        expect(window.alert).toHaveBeenCalled()
    })

    it('다운로드 성공 흐름: fetch로 blob 받아 a 태그 클릭까지 진행', async () => {
        // downloadFile 내부에서 fetch + URL.createObjectURL + a.click 사용하므로 다 mock
        mockedGet.mockResolvedValueOnce({
            data: {
                data: {
                    createdAt: '2026-01-30T12:00:00',
                    company: '골든상사',
                    name: '담당자',
                    phoneNumber: '010-1234-5678',
                    email: 'test@example.com',
                    processingStatus: 'N',
                    title: '제목',
                    body: '내용',
                    fileName: '파일.pdf',
                    downloadUrl: 'https://example.com/file.pdf',
                    comment: '',
                },
            },
        })

        const fakeBlob = new Blob(['hello'], { type: 'application/pdf' })

        // fetch mock
        const fetchMock = vi.fn().mockResolvedValue({
                blob: vi.fn().mockResolvedValue(fakeBlob),
            } as any)
        ;(globalThis as any).fetch = fetchMock

        // URL.createObjectURL / revokeObjectURL mock
        const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
        const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

        // a.click spy
        const clickSpy = vi.fn()
        const appendSpy = vi.spyOn(document.body, 'appendChild')
        const removeSpy = vi.spyOn(HTMLElement.prototype, 'remove')

        // createElement('a')가 click 가진 엘리먼트를 만들도록 조작
        const originalCreateElement = document.createElement.bind(document)
        vi.spyOn(document, 'createElement').mockImplementation((tagName: any) => {
            const el = originalCreateElement(tagName)
            if (tagName === 'a') {
                ;(el as any).click = clickSpy
            }
            return el
        })

        const wrapper = mountModal({ inquiryNo: 'INQ-DL' })
        await flushPromises()

        await wrapper.find('.file-box').trigger('click')
        await flushPromises()

        expect(fetchMock).toHaveBeenCalledWith('https://example.com/file.pdf', { method: 'GET' })
        expect(createObjectURLSpy).toHaveBeenCalled()
        expect(appendSpy).toHaveBeenCalled()
        expect(clickSpy).toHaveBeenCalled()
        expect(removeSpy).toHaveBeenCalled()
        expect(revokeObjectURLSpy).toHaveBeenCalled()

        // cleanup
        ;(globalThis as any).fetch = undefined
    })
})
