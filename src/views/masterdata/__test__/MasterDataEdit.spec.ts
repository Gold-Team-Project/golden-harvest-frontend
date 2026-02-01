import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRoute, useRouter } from 'vue-router'
import http from '@/api/axios'
import MasterDataEdit from '../MasterDataEdit.vue'

// Mock dependencies
vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
  })),
}))

vi.mock('@/api/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

const mockedGet = http.get as vi.Mock
const mockedPatch = http.patch as vi.Mock
const mockedRouterPush = vi.fn()
const mockedRouterBack = vi.fn()

describe('MasterDataEdit.vue', () => {
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
    ;(useRoute as vi.Mock).mockReturnValue({ params: { skuNo: 'SKU456' } });
    (useRouter as vi.Mock).mockReturnValue({ push: mockedRouterPush, back: mockedRouterBack });
    
    return mount(MasterDataEdit, {
      global: {
        stubs: {
          BaseButton: { template: '<button @click="$emit(\'click\')"><slot /></button>', emits: ['click'] },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockedGet.mockResolvedValue({ data: mockDetail })
    mockedPatch.mockResolvedValue({})
    window.confirm = vi.fn(() => true)
    window.alert = vi.fn()
    
    // Mock URL.createObjectURL for file preview
    global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/mock-url');
  })

  it('마운트 시 데이터를 불러와 폼을 채웁니다', async () => {
    wrapper = mountComponent()
    await flushPromises()

    expect(mockedGet).toHaveBeenCalledWith('/master-data/items/SKU456')
    
    const descriptionInput = wrapper.find('textarea').element as HTMLTextAreaElement
    const shelfLifeInput = wrapper.find('input[type="number"]').element as HTMLInputElement

    expect(descriptionInput.value).toBe('오래된 설명')
    expect(shelfLifeInput.value).toBe('10')
  })

  it('"취소" 버튼 클릭 시 이전 페이지로 돌아갑니다', async () => {
    wrapper = mountComponent()
    await flushPromises()

    const cancelButton = wrapper.findAll('button').find((b: any) => b.text().includes('취소'))
    expect(cancelButton).toBeTruthy()
    await cancelButton!.trigger('click')

    expect(mockedRouterBack).toHaveBeenCalledTimes(1)
  })

  it('폼 수정 후 "저장하기"를 누르면 patch API를 호출하고 상세 페이지로 이동합니다', async () => {
    wrapper = mountComponent()
    await flushPromises()

    // 1. Modify form data
    await wrapper.find('textarea').setValue('새로운 설명입니다.')
    await wrapper.find('input[type="number"]').setValue(15)

    // 2. Click save
    const saveButton = wrapper.findAll('button').find((b: any) => b.text().includes('저장하기'))
    expect(saveButton).toBeTruthy()
    await saveButton!.trigger('click')

    expect(window.confirm).toHaveBeenCalledWith('수정 내용을 저장하시겠습니까?')
    
    // 3. Assert API call
    expect(mockedPatch).toHaveBeenCalledTimes(1)
    
    const [url, formData, config] = mockedPatch.mock.calls[0]
    expect(url).toBe('/master-data/IC456')
    expect(formData).toBeInstanceOf(FormData)
    expect(config.headers['Content-Type']).toBe('multipart/form-data')

    const requestData = JSON.parse(formData.get('request'))
    expect(requestData).toEqual({
      description: '새로운 설명입니다.',
      shelfLifeDays: "15", // input type=number returns string
      storageTempMin: 1,
      storageTempMax: 5,
    })
    
    // File not attached in this test
    expect(formData.get('file')).toBeNull()

    // 4. Assert navigation
    await flushPromises()
    expect(window.alert).toHaveBeenCalledWith('성공적으로 수정되었습니다.')
    expect(mockedRouterPush).toHaveBeenCalledWith('/admin/masterData/SKU456')
  })

  it('파일을 첨부하고 저장하면 FormData에 파일이 포함됩니다', async () => {
    wrapper = mountComponent()
    await flushPromises()
    
    // 1. Attach a file
    const fileInput = wrapper.find('input[type="file"]')
    const file = new File(['dummy-content'], 'test.png', { type: 'image/png' })
    
    // DOM like setting for file input
    Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false,
    });
    await fileInput.trigger('change')
    await flushPromises()

    // Check preview
    expect(wrapper.find('img').attributes('src')).toBe('blob:http://localhost/mock-url')

    // 2. Click save
    const saveButton = wrapper.findAll('button').find((b: any) => b.text().includes('저장하기'))
    await saveButton!.trigger('click')

    // 3. Assert FormData content
    const formData = mockedPatch.mock.calls[0][1]
    const attachedFile = formData.get('file')
    expect(attachedFile).toBeInstanceOf(File)
    expect(attachedFile.name).toBe('test.png')
  })
})
