import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import BasePagination from '@/components/BasePagination.vue';

function render(page, pageCount) {
    const wrapper = mount(BasePagination, {
        props: { page, pageCount, 'onUpdate:page': (value) => wrapper.setProps({ page: value }) },
    });

    return wrapper;
}

const shown = (wrapper) => wrapper.findAll('.page-button, .page-gap').map((node) => node.text()).filter((text) => text !== '');

describe('BasePagination', () => {
    test('lists every page when there are seven or fewer', () => {
        expect(shown(render(1, 3))).toEqual(['1', '2', '3']);
        expect(shown(render(4, 7))).toEqual(['1', '2', '3', '4', '5', '6', '7']);
    });

    test.each([
        [1, ['1', '2', '…', '12']],
        [2, ['1', '2', '3', '…', '12']],
        [6, ['1', '…', '5', '6', '7', '…', '12']],
        [11, ['1', '…', '10', '11', '12']],
        [12, ['1', '…', '11', '12']],
    ])('collapses a long range around page %i', (page, expected) => {
        expect(shown(render(page, 12))).toEqual(expected);
    });

    test('marks the current page', () => {
        const wrapper = render(2, 3);

        expect(wrapper.find('[aria-current="page"]').text()).toBe('2');
        expect(wrapper.findAll('[aria-current]')).toHaveLength(1);
    });

    test('disables Previous on the first page and Next on the last', () => {
        expect(render(1, 3).find('[aria-label="Previous page"]').element.disabled).toBe(true);
        expect(render(1, 3).find('[aria-label="Next page"]').element.disabled).toBe(false);
        expect(render(3, 3).find('[aria-label="Next page"]').element.disabled).toBe(true);
        expect(render(3, 3).find('[aria-label="Previous page"]').element.disabled).toBe(false);
    });

    test('moves to the clicked page, and one page at a time with Next and Previous', async () => {
        const wrapper = render(2, 5);

        await wrapper.find('[aria-label="Page 4"]').trigger('click');
        expect(wrapper.find('[aria-current="page"]').text()).toBe('4');

        await wrapper.find('[aria-label="Next page"]').trigger('click');
        expect(wrapper.find('[aria-current="page"]').text()).toBe('5');

        await wrapper.find('[aria-label="Previous page"]').trigger('click');
        expect(wrapper.find('[aria-current="page"]').text()).toBe('4');
    });
});
