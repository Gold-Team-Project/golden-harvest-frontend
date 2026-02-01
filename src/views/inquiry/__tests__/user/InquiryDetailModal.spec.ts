import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import InquiryDetailModal from '@/views/inquiry/modal/InquiryDetailModal.vue'
import http from '@/api/axios'

// Mock axios
vi.mock('@/api/axios', () => ({
    default: {
        get: vi.fn(),
    },
}))

const mockedGet = http.get as unknown as ReturnType<typeof vi.fn>

describe('InquiryDetailModal.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const mockInquiryDetail = {
        title: '테스트 문의',
        body: '문의 내용입니다.',
        comment: '테스트 답변입니다.',
        fileName: 'test-file.pdf',
    }

    it('마운트 시 상세 조회 API를 호출하고 내용을 렌더링합니다', async () => {
        mockedGet.mockResolvedValueOnce({ data: { data: mockInquiryDetail } })
        
        const wrapper = mount(InquiryDetailModal, {
            props: { inquiryNo: 'INQ-123' }
        });

        await flushPromises();

        expect(mockedGet).toHaveBeenCalledTimes(1);
        expect(mockedGet).toHaveBeenCalledWith('/inquiries/INQ-123');

        expect(wrapper.text()).toContain('테스트 문의');
        expect(wrapper.text()).toContain('문의 내용입니다.');
        expect(wrapper.text()).toContain('테스트 답변입니다.');
        expect(wrapper.text()).toContain('test-file.pdf');
    });

    it('답변이 없을 경우 "답변 대기 중입니다."를 표시합니다', async () => {
        const detailWithoutComment = { ...mockInquiryDetail, comment: null };
        mockedGet.mockResolvedValueOnce({ data: { data: detailWithoutComment } });
        
        const wrapper = mount(InquiryDetailModal, {
            props: { inquiryNo: 'INQ-456' }
        });

        await flushPromises();

        expect(wrapper.text()).toContain('답변 대기 중입니다.');
    });

    it('첨부파일이 없을 경우 첨부파일 섹션을 표시하지 않습니다', async () => {
        const detailWithoutFile = { ...mockInquiryDetail, fileName: null };
        mockedGet.mockResolvedValueOnce({ data: { data: detailWithoutFile } });
        
        const wrapper = mount(InquiryDetailModal, {
            props: { inquiryNo: 'INQ-789' }
        });

        await flushPromises();

        expect(wrapper.find('.file-box').exists()).toBe(false);
    });

    it('닫기 버튼을 클릭하면 close 이벤트를 발생시킵니다', async () => {
        mockedGet.mockResolvedValueOnce({ data: { data: mockInquiryDetail } });
        
        const wrapper = mount(InquiryDetailModal, {
            props: { inquiryNo: 'INQ-123' }
        });

        await flushPromises();

        await wrapper.find('.close').trigger('click');
        expect(wrapper.emitted('close')).toBeTruthy();
    });
});
