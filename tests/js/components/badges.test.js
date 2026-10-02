import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import PriorityBadge from '@/components/PriorityBadge.vue';
import StatusBadge from '@/components/StatusBadge.vue';

describe('StatusBadge', () => {
    test.each([
        ['planning', 'Planning', 'planning'],
        ['in_progress', 'In Progress', 'in-progress'],
        ['on_hold', 'On Hold', 'on-hold'],
        ['completed', 'Completed', 'completed'],
    ])('shows %s as "%s" with the %s style', (status, label, cssClass) => {
        const wrapper = mount(StatusBadge, { props: { status } });

        expect(wrapper.text()).toBe(label);
        expect(wrapper.classes()).toContain(cssClass);
    });
});

describe('PriorityBadge', () => {
    test.each([
        ['low', 'Low'],
        ['medium', 'Medium'],
        ['high', 'High'],
    ])('shows %s as "%s" with its own style', (priority, label) => {
        const wrapper = mount(PriorityBadge, { props: { priority } });

        expect(wrapper.text()).toBe(label);
        expect(wrapper.classes()).toContain(priority);
    });
});
