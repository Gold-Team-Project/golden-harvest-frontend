import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import InquiryListView from '@/views/inquiry/user/InquiryListView.vue'
import http from '@/api/axios'
import { useRouter } from 'vue-router'

// Mock dependencies
vi.mock('@/api/axios', () => ({
    default: {
        get: vi.fn(),
    },
}))

const pushMock = vi.fn()
vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}))

const mockedGet = http.get as unknown as ReturnType<typeof vi.fn>

// Helper to mount the component with stubs
function mountComponent() {
    return mount(InquiryListView, {
        global: {
            stubs: {
                StatusBadge: { template: '<span><slot /></span>' },
                BaseButton: { template: '<button @click="$emit(\'click\')"><slot /></button>', emits: ['click'] },
                Pagination: { template: '<div id="pagination-stub"></div>', emits: ['update:current'] },
                InquiryDetailModal: {
                    props: ['inquiryNo'],
                    template: '<div id="detail-modal-stub" @click="$emit(\'close\')"></div>',
                    emits: ['close'],
                },
            },
        },
    });
}

describe('InquiryListView.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedGet.mockResolvedValue({ data: { data: [] } }); // Default to empty
    });

    const mockInquiries = [
        { InquiryNo: 'INQ-001', title: '첫 번째 문의', createdAt: '2023-01-01T10:00:00', processingStatus: 'N' },
        { InquiryNo: 'INQ-002', title: '두 번째 문의', createdAt: '2023-01-02T11:00:00', processingStatus: 'Y' },
    ];

    it('마운트 시 문의 목록을 불러오고 렌더링합니다', async () => {
        mockedGet.mockResolvedValueOnce({ data: { data: mockInquiries } });
        const wrapper = mountComponent();

        await flushPromises();

        expect(mockedGet).toHaveBeenCalledTimes(1);
        expect(mockedGet).toHaveBeenCalledWith('/inquiries', expect.any(Object));

        const rows = wrapper.findAll('tbody tr');
        expect(rows).toHaveLength(2);
        expect(rows[0].text()).toContain('첫 번째 문의');
        expect(rows[0].text()).toContain('답변대기');
        expect(rows[1].text()).toContain('두 번째 문의');
        expect(rows[1].text()).toContain('답변완료');
    });

    it('문의 내역이 없을 때 메시지를 표시합니다', async () => {
        const wrapper = mountComponent();
        await flushPromises();

        expect(wrapper.find('tbody tr td[colspan="6"]').text()).toBe('문의 내역이 없습니다.');
    });

    it('"문의 등록" 버튼 클릭 시 /inquiries/create로 이동합니다', async () => {
        const wrapper = mountComponent();
        await flushPromises();

        const createButton = wrapper.findAll('button').find(b => b.text().includes('문의 등록'));
        expect(createButton).toBeTruthy();
        await createButton!.trigger('click');

        expect(pushMock).toHaveBeenCalledWith('/inquiries/create');
    });

    it('"상세보기" 버튼 클릭 시 상세 모달을 엽니다', async () => {
        mockedGet.mockResolvedValueOnce({ data: { data: mockInquiries } });
        const wrapper = mountComponent();
        await flushPromises();

        // Initially, modal should not exist
        expect(wrapper.find('#detail-modal-stub').exists()).toBe(false);

        const detailButton = wrapper.find('tbody tr:first-of-type').findAll('button').find(b => b.text().includes('상세보기'));
        expect(detailButton).toBeTruthy();
        await detailButton!.trigger('click');

        // Now, modal should exist
        const modal = wrapper.findComponent({ name: 'InquiryDetailModal' });
        expect(modal.exists()).toBe(true);
        expect(modal.props('inquiryNo')).toBe('INQ-001');
    });

    it('상세 모달의 close 이벤트를 받으면 모달을 닫습니다', async () => {
        mockedGet.mockResolvedValueOnce({ data: { data: mockInquiries } });
        const wrapper = mountComponent();
        await flushPromises();

        // Open modal first
        const detailButton = wrapper.find('tbody tr:first-of-type button');
        expect(detailButton.exists()).toBe(true);
        await detailButton.trigger('click');
        expect(wrapper.find('#detail-modal-stub').exists()).toBe(true);

        // Emit 'close' event from the modal
        await wrapper.findComponent({ name: 'InquiryDetailModal' }).vm.$emit('close');
        
        // Modal should be gone
        expect(wrapper.find('#detail-modal-stub').exists()).toBe(false);
    });

    it('Pagination에서 페이지 변경 시 API를 다시 호출합니다', async () => {
        const wrapper = mountComponent();
        await flushPromises();
        
        // Initial call
        expect(mockedGet).toHaveBeenCalledTimes(1);

        // Change page via pagination event
        await wrapper.findComponent({ name: 'Pagination' }).vm.$emit('update:current', 2);
        await flushPromises();
        
        // API should be called again with page 2
        expect(mockedGet).toHaveBeenCalledTimes(2);
        expect(mockedGet).toHaveBeenLastCalledWith('/inquiries', expect.objectContaining({
            params: expect.objectContaining({ page: 2 })
        }));
    });
});
