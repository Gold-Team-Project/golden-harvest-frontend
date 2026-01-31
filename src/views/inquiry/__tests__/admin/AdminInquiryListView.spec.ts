import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api/axios', () => ({
    default: {
        get: vi.fn(),
    },
}))

import http from '@/api/axios'
import AdminInquiryPage from  '@/views/inquiry/admin/AdminInquiryListView.vue'

const mockedGet = http.get as unknown as ReturnType<typeof vi.fn>

function mountPage() {
    return mount(AdminInquiryPage, {
        global: {
            stubs: {
                // Pagination은 이벤트만 발생시키면 됨
                Pagination: {
                    props: ['pages', 'current'],
                    emits: ['update:current'],
                    template: `
            <div data-testid="pagination">
              <button data-testid="page-2" @click="$emit('update:current', 2)">page2</button>
            </div>
          `,
                },
                // UI 뱃지는 slot만 보여주면 충분
                StatusBadge: {
                    template: `<span data-testid="badge"><slot /></span>`,
                },
                // BaseButton은 click emit만 되면 충분
                BaseButton: {
                    emits: ['click'],
                    template: `<button data-testid="btn" @click="$emit('click')"><slot /></button>`,
                },
                // 모달은 열린 여부/props 전달만 검증
                AdminInquiryAnswerModal: {
                    props: ['inquiryNo', 'no'],
                    emits: ['close', 'answered'],
                    template: `<div data-testid="modal">MODAL {{ inquiryNo }} {{ no }}</div>`,
                },
            },
        },
    })
}

describe('AdminInquiryPage UI', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('마운트 시 /admin/inquiries 호출 + 목록 렌더링', async () => {
        mockedGet.mockResolvedValueOnce({
            data: {
                data: [
                    {
                        InquiryNo: 'INQ-1',
                        createdAt: '2026-01-30T12:00:00',
                        company: '골든상사',
                        title: '문의1',
                        processingStatus: 'N', // WAIT
                    },
                    {
                        InquiryNo: 'INQ-2',
                        createdAt: '2026-01-29T09:00:00',
                        company: '수확유통',
                        title: '문의2',
                        processingStatus: 'Y', // DONE
                    },
                ],
            },
        })

        const wrapper = mountPage()
        await flushPromises()

        // API 호출 파라미터 확인
        expect(mockedGet).toHaveBeenCalledTimes(1)
        expect(mockedGet).toHaveBeenCalledWith('/admin/inquiries', {
            params: expect.objectContaining({
                page: 1,
                size: 10,
                title: '',
                company: '',
                status: '',
            }),
        })

        // 렌더링 확인
        expect(wrapper.text()).toContain('골든상사')
        expect(wrapper.text()).toContain('문의1')
        expect(wrapper.text()).toContain('대기중')

        expect(wrapper.text()).toContain('수확유통')
        expect(wrapper.text()).toContain('문의2')
        expect(wrapper.text()).toContain('답변완료')

        // createdAt substring(0,10) 확인
        expect(wrapper.text()).toContain('2026-01-30')
        expect(wrapper.text()).toContain('2026-01-29')
    })

    it('목록이 비어있으면 "문의 내역이 없습니다."가 표시된다', async () => {
        mockedGet.mockResolvedValueOnce({ data: { data: [] } })

        const wrapper = mountPage()
        await flushPromises()

        expect(wrapper.text()).toContain('문의 내역이 없습니다.')
    })

    it('"답변하기" 클릭 시 모달이 열린다 (inquiryNo/no 전달)', async () => {
        mockedGet.mockResolvedValueOnce({
            data: {
                data: [
                    {
                        InquiryNo: 'INQ-777',
                        createdAt: '2026-01-30T12:00:00',
                        company: '골든상사',
                        title: '문의제목',
                        processingStatus: 'N',
                    },
                ],
            },
        })

        const wrapper = mountPage()
        await flushPromises()

        // "답변하기" 버튼 찾아 클릭
        const buttons = wrapper.findAll('[data-testid="btn"]')
        const answerBtn = buttons.find(b => b.text().includes('답변하기'))
        expect(answerBtn).toBeTruthy()

        await answerBtn!.trigger('click')

        const modal = wrapper.find('[data-testid="modal"]')
        expect(modal.exists()).toBe(true)

        // inquiryNo 전달
        expect(modal.text()).toContain('INQ-777')
        // no 계산: page=1, index=0 -> 1
        expect(modal.text()).toContain('1')
    })

    it('페이지네이션에서 page=2로 바꾸면 API를 다시 호출한다', async () => {
        mockedGet.mockResolvedValueOnce({ data: { data: [] } }) // page 1
        mockedGet.mockResolvedValueOnce({ data: { data: [] } }) // page 2

        const wrapper = mountPage()
        await flushPromises()

        await wrapper.find('[data-testid="page-2"]').trigger('click')
        await flushPromises()

        expect(mockedGet).toHaveBeenCalledTimes(2)
        expect(mockedGet.mock.calls[1][0]).toBe('/admin/inquiries')
        expect(mockedGet.mock.calls[1][1]).toEqual({
            params: expect.objectContaining({
                page: 2,
                size: 10,
            }),
        })
    })

    it('검색 input 값이 params로 전달된다 (검색 버튼 클릭)', async () => {
        mockedGet.mockResolvedValue({ data: { data: [] } }) // 여러번 호출될 수 있으니 mockResolvedValue

        const wrapper = mountPage()
        await flushPromises()

        // input 2개: title, company
        const inputs = wrapper.findAll('input')
        await inputs[0].setValue('제목키워드')
        await inputs[1].setValue('회사키워드')

        // select(status) 변경
        const selects = wrapper.findAll('select')
        // 첫 select는 disabled(상품 문의)라서 두 번째가 status
        await selects[1].setValue('DONE')

        // "검색" 버튼 클릭
        const buttons = wrapper.findAll('[data-testid="btn"]')
        const searchBtn = buttons.find(b => b.text().includes('검색'))
        expect(searchBtn).toBeTruthy()

        await searchBtn!.trigger('click')
        await flushPromises()

        // 마지막 호출 params 확인
        const lastCall = mockedGet.mock.calls[mockedGet.mock.calls.length - 1]
        expect(lastCall[0]).toBe('/admin/inquiries')
        expect(lastCall[1]).toEqual({
            params: expect.objectContaining({
                title: '제목키워드',
                company: '회사키워드',
                status: 'DONE',
            }),
        })
    })
})
