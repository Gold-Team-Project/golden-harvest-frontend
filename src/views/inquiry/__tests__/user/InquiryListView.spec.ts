import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import http from '@/api/axios'
import InquiryListView from '@/views/inquiry/user/InquiryListView.vue'


// 1. 호이스팅을 위해 'mock' 접두어 사용
const mockPush = vi.fn()

// 2. 의존성 모킹
vi.mock('@/api/axios', () => ({
    default: {
        get: vi.fn(),
    },
}))

vi.mock('vue-router', () => ({
    useRouter: vi.fn(() => ({
        push: mockPush,
    })),
}))

// 3. 타입 안전한 Mock 설정
const mockedGet = vi.mocked(http.get)

describe('InquiryListView.vue', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let wrapper: any

    const mockInquiries = [
        // 실제 컴포넌트에서 사용하는 대문자 'InquiryNo'로 맞춤
        { InquiryNo: 'INQ-001', title: '첫 번째 문의', createdAt: '2023-01-01T10:00:00', processingStatus: 'N' },
        { InquiryNo: 'INQ-002', title: '두 번째 문의', createdAt: '2023-01-02T11:00:00', processingStatus: 'Y' },
    ];

    // Helper to mount the component with stubs
    function mountComponent() {
        return mount(InquiryListView, {
            global: {
                stubs: {
                    StatusBadge: { template: '<span><slot /></span>' },
                    BaseButton: {
                        template: '<button @click="$emit(\'click\')"><slot /></button>',
                        emits: ['click']
                    },
                    // [수정] findComponent가 잘 잡히도록 name과 props 명시
                    Pagination: {
                        name: 'Pagination',
                        template: '<div id="pagination-stub"></div>',
                        props: ['pages', 'current'],
                        emits: ['update:current']
                    },
                    InquiryDetailModal: {
                        name: 'InquiryDetailModal',
                        props: ['inquiryNo'],
                        template: '<div id="detail-modal-stub"></div>',
                        emits: ['close'],
                    },
                },
                mocks: {
                    $router: {
                        push: mockPush
                    }
                }
            },
        });
    }

    beforeEach(() => {
        vi.clearAllMocks();
        // 기본 API 응답 설정
        mockedGet.mockResolvedValue({ data: { data: [] } });
    });

    it('마운트 시 문의 목록을 불러오고 렌더링합니다', async () => {
        mockedGet.mockResolvedValueOnce({ data: { data: mockInquiries } });
        wrapper = mountComponent();
        await flushPromises();

        expect(mockedGet).toHaveBeenCalledTimes(1);
        expect(mockedGet).toHaveBeenCalledWith('/inquiries', expect.any(Object));

        const rows = wrapper.findAll('tbody tr');
        expect(rows).toHaveLength(2);
        expect(rows[0].text()).toContain('첫 번째 문의');
        expect(rows[0].text()).toContain('답변대기');
    });

    it('문의 내역이 없을 때 메시지를 표시합니다', async () => {
        wrapper = mountComponent();
        await flushPromises();

        expect(wrapper.find('tbody tr td[colspan="6"]').text()).toBe('문의 내역이 없습니다.');
    });

    it('"문의 등록" 버튼 클릭 시 /inquiries/create로 이동합니다', async () => {
        wrapper = mountComponent();
        await flushPromises();

        const createButton = wrapper.findAll('button').find((b: any) => b.text().includes('문의 등록'));
        expect(createButton).toBeTruthy();
        await createButton!.trigger('click');

        expect(mockPush).toHaveBeenCalledWith('/inquiries/create');
    });

    it('"상세보기" 버튼 클릭 시 상세 모달을 엽니다', async () => {
        mockedGet.mockResolvedValueOnce({ data: { data: mockInquiries } });
        wrapper = mountComponent();
        await flushPromises();

        const detailButton = wrapper.findAll('button').find((b: any) => b.text().includes('상세보기'));
        await detailButton.trigger('click');

        // findComponent로 stub된 모달 인스턴스를 찾음
        const modal = wrapper.findComponent({ name: 'InquiryDetailModal' });
        expect(modal.exists()).toBe(true);
        // [해결] 키값 InquiryNo 매칭 확인
        expect(modal.props('inquiryNo')).toBe('INQ-001');
    });

    it('상세 모달의 close 이벤트를 받으면 모달을 닫습니다', async () => {
        mockedGet.mockResolvedValueOnce({ data: { data: mockInquiries } });
        wrapper = mountComponent();
        await flushPromises();

        // 모달 열기
        const detailButton = wrapper.findAll('button').find((b: any) => b.text().includes('상세보기'));
        await detailButton.trigger('click');

        const modal = wrapper.findComponent({ name: 'InquiryDetailModal' });
        expect(modal.exists()).toBe(true);

        // close 이벤트 발생
        await modal.vm.$emit('close');

        // 모달이 사라졌는지 확인
        expect(wrapper.findComponent({ name: 'InquiryDetailModal' }).exists()).toBe(false);
    });

    it('Pagination에서 페이지 변경 시 API를 다시 호출합니다', async () => {
        mockedGet.mockResolvedValue({ data: { data: mockInquiries } });
        wrapper = mountComponent();
        await flushPromises();

        expect(mockedGet).toHaveBeenCalledTimes(1);

        // [해결] findComponent({ name: 'Pagination' })을 사용하여 vm에 접근
        const pagination = wrapper.findComponent({ name: 'Pagination' });
        expect(pagination.exists()).toBe(true);

        // 가짜 컴포넌트에서 페이지 변경 이벤트($emit) 발생
        await pagination.vm.$emit('update:current', 2);
        await flushPromises();

        // API가 두 번째로 호출되었는지 검증
        expect(mockedGet).toHaveBeenCalledTimes(2);
        expect(mockedGet).toHaveBeenLastCalledWith('/inquiries', expect.objectContaining({
            params: expect.objectContaining({ page: 2 })
        }));
    });
});