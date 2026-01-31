import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Pagination from '@/components/pagination/Pagination.vue'

describe('Pagination.vue', () => {
    it('현재 페이지는 active 클래스를 가진다', () => {
        const wrapper = mount(Pagination, {
            props: { pages: [1, 2, 3], current: 2 },
        })

        const pageBtns = wrapper.findAll('button.page')
        expect(pageBtns).toHaveLength(3)

        const active = wrapper.find('button.page.active')
        expect(active.exists()).toBe(true)
        expect(active.text()).toBe('2')
    })

    it('현재가 첫 페이지면 왼쪽 화살표는 disabled', () => {
        const wrapper = mount(Pagination, {
            props: { pages: [1, 2, 3], current: 1 },
        })

        const arrows = wrapper.findAll('button.arrow')
        expect(arrows).toHaveLength(2)

        expect(arrows[0].attributes('disabled')).toBeDefined() // left
        expect(arrows[1].attributes('disabled')).toBeUndefined() // right
    })

    it('현재가 마지막 페이지면 오른쪽 화살표는 disabled', () => {
        const wrapper = mount(Pagination, {
            props: { pages: [1, 2, 3], current: 3 },
        })

        const arrows = wrapper.findAll('button.arrow')
        expect(arrows).toHaveLength(2)

        expect(arrows[0].attributes('disabled')).toBeUndefined()
        expect(arrows[1].attributes('disabled')).toBeDefined()
    })

    it('페이지 버튼 클릭 시 update:current emit 된다 (현재 페이지가 아니면)', async () => {
        const wrapper = mount(Pagination, {
            props: { pages: [1, 2, 3], current: 1 },
        })

        const btn2 = wrapper.findAll('button.page').find(b => b.text() === '2')
        expect(btn2, '페이지 버튼 "2"가 렌더링되어야 합니다.').toBeTruthy()
        if (!btn2) throw new Error('페이지 버튼 "2"가 없습니다')

        await btn2.trigger('click')

        const emitted = wrapper.emitted('update:current')
        expect(emitted).toBeTruthy()
        if (!emitted) throw new Error('update:current가 emit되지 않았습니다')

        expect(emitted[0]).toEqual([2])
    })

    it('현재 페이지 버튼 클릭하면 emit 하지 않는다', async () => {
        const wrapper = mount(Pagination, {
            props: { pages: [1, 2, 3], current: 2 },
        })

        const btn2 = wrapper.findAll('button.page').find(b => b.text() === '2')
        expect(btn2, '페이지 버튼 "2"가 렌더링되어야 합니다.').toBeTruthy()
        if (!btn2) throw new Error('페이지 버튼 "2"가 없습니다')

        await btn2.trigger('click')

        expect(wrapper.emitted('update:current')).toBeFalsy()
    })

    it('왼쪽 화살표 클릭 시 current-1이 pages 안에 있으면 emit', async () => {
        const wrapper = mount(Pagination, {
            props: { pages: [1, 2, 3], current: 2 },
        })

        const arrows = wrapper.findAll('button.arrow')
        expect(arrows).toHaveLength(2)

        await arrows[0].trigger('click')

        const emitted = wrapper.emitted('update:current')
        expect(emitted).toBeTruthy()
        if (!emitted) throw new Error('update:current가 emit되지 않았습니다')

        expect(emitted[0]).toEqual([1])
    })

    it('오른쪽 화살표 클릭 시 current+1이 pages 안에 있으면 emit', async () => {
        const wrapper = mount(Pagination, {
            props: { pages: [1, 2, 3], current: 2 },
        })

        const arrows = wrapper.findAll('button.arrow')
        expect(arrows).toHaveLength(2)

        await arrows[1].trigger('click')

        const emitted = wrapper.emitted('update:current')
        expect(emitted).toBeTruthy()
        if (!emitted) throw new Error('update:current가 emit되지 않았습니다')

        expect(emitted[0]).toEqual([3])
    })

    it('pages에 없는 페이지로 change되면 emit 하지 않는다', async () => {
        const wrapper = mount(Pagination, {
            props: { pages: [10, 11], current: 11 },
        })

        const arrows = wrapper.findAll('button.arrow')
        expect(arrows).toHaveLength(2)

        await arrows[1].trigger('click')

        expect(wrapper.emitted('update:current')).toBeFalsy()
    })
})
