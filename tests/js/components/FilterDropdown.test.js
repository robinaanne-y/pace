import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import FilterDropdown from '@/components/FilterDropdown.vue';

const options = [
    { value: '', label: 'All statuses' },
    { value: 'planning', label: 'Planning' },
    { value: 'completed', label: 'Completed' },
];

function render(props = {}) {
    const wrapper = mount(FilterDropdown, {
        attachTo: document.body,
        props: { label: 'Status', options, modelValue: '', 'onUpdate:modelValue': (value) => wrapper.setProps({ modelValue: value }), ...props },
    });

    return wrapper;
}

describe('FilterDropdown', () => {
    test('is closed at first and shows its label', () => {
        const wrapper = render();

        expect(wrapper.find('.filter-button').text()).toBe('Status');
        expect(wrapper.find('.dropdown-menu').exists()).toBe(false);
        expect(wrapper.find('.filter-button').classes()).not.toContain('is-filtered');
    });

    test('opens a menu of the options and marks the selected one', async () => {
        const wrapper = render();

        await wrapper.find('.filter-button').trigger('click');

        expect(wrapper.findAll('.dropdown-menu button').map((item) => item.text())).toEqual(['All statuses', 'Planning', 'Completed']);
        expect(wrapper.find('.dropdown-menu .selected').text()).toBe('All statuses');
    });

    test('choosing an option updates the value, closes the menu and highlights the button', async () => {
        const wrapper = render();
        await wrapper.find('.filter-button').trigger('click');

        await wrapper.findAll('.dropdown-menu button')[2].trigger('click');

        expect(wrapper.props('modelValue')).toBe('completed');
        expect(wrapper.find('.dropdown-menu').exists()).toBe(false);
        expect(wrapper.find('.filter-button').text()).toBe('Completed');
        expect(wrapper.find('.filter-button').classes()).toContain('is-filtered');
    });

    test('choosing the default option clears the highlight', async () => {
        const wrapper = render({ modelValue: 'planning' });
        await wrapper.find('.filter-button').trigger('click');

        await wrapper.findAll('.dropdown-menu button')[0].trigger('click');

        expect(wrapper.find('.filter-button').text()).toBe('Status');
        expect(wrapper.find('.filter-button').classes()).not.toContain('is-filtered');
    });

    test('prefixes the chosen option when a prefix is given', () => {
        const wrapper = render({ label: 'Sort', defaultValue: '', modelValue: 'planning', selectionPrefix: 'Sort: ' });

        expect(wrapper.find('.filter-button').text()).toBe('Sort: Planning');
    });

    test('closes on Escape', async () => {
        const wrapper = render();
        await wrapper.find('.filter-button').trigger('click');

        await wrapper.find('.dropdown').trigger('keydown', { key: 'Escape' });

        expect(wrapper.find('.dropdown-menu').exists()).toBe(false);
    });

    test('closes when the user presses outside it', async () => {
        const wrapper = render();
        await wrapper.find('.filter-button').trigger('click');

        document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await wrapper.vm.$nextTick();

        expect(wrapper.find('.dropdown-menu').exists()).toBe(false);
    });

    test('stays open when the user presses inside it', async () => {
        const wrapper = render();
        await wrapper.find('.filter-button').trigger('click');

        wrapper.find('.dropdown-menu').element.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await wrapper.vm.$nextTick();

        expect(wrapper.find('.dropdown-menu').exists()).toBe(true);
    });
});
