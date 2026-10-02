import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import ProjectForm from '@/components/ProjectForm.vue';
import { button, field, makeProject } from '../helpers';

function render(props = {}) {
    return mount(ProjectForm, { attachTo: document.body, props: { submitLabel: 'Create Project', ...props } });
}

async function fill(wrapper, values) {
    for (const [label, value] of Object.entries(values)) {
        await field(wrapper, label).setValue(value);
    }
}

const errors = (wrapper) => wrapper.findAll('.field-error').map((node) => node.text());
const submit = (wrapper) => wrapper.find('form').trigger('submit');

describe('ProjectForm', () => {
    describe('fields', () => {
        test('starts empty with status Planning and priority Medium', () => {
            const wrapper = render();

            expect(field(wrapper, 'Project name').element.value).toBe('');
            expect(field(wrapper, 'Client name').element.value).toBe('');
            expect(field(wrapper, 'Status').element.value).toBe('planning');
            expect(field(wrapper, 'Priority').element.value).toBe('medium');
        });

        test('is filled from an existing project', () => {
            const wrapper = render({ project: makeProject() });

            expect(field(wrapper, 'Project name').element.value).toBe('Corporate Website Redesign');
            expect(field(wrapper, 'Client name').element.value).toBe('Acme Corporation');
            expect(field(wrapper, 'Description').element.value).toBe('Redesign the company website.');
            expect(field(wrapper, 'Status').element.value).toBe('in_progress');
            expect(field(wrapper, 'Priority').element.value).toBe('high');
            expect(field(wrapper, 'Start date').element.value).toBe('2026-06-01');
            expect(field(wrapper, 'Due date').element.value).toBe('2026-07-15');
        });

        test('offers every status and priority', () => {
            const wrapper = render();

            expect(field(wrapper, 'Status').findAll('option').map((option) => option.text())).toEqual(['Planning', 'In Progress', 'On Hold', 'Completed']);
            expect(field(wrapper, 'Priority').findAll('option').map((option) => option.text())).toEqual(['Low', 'Medium', 'High']);
        });

        test('limits the description to 5000 characters, as the server does', () => {
            expect(field(render(), 'Description').attributes('maxlength')).toBe('5000');
        });

        test('shows the submit label it is given', () => {
            expect(button(render({ submitLabel: 'Save Changes' }), 'Save Changes')).toBeDefined();
        });
    });

    describe('client-side validation', () => {
        test('an empty form shows both required messages and sends nothing', async () => {
            const wrapper = render();

            await submit(wrapper);

            expect(errors(wrapper)).toEqual(['Project name is required.', 'Client name is required.']);
            expect(wrapper.emitted('submit')).toBeUndefined();
        });

        test('a name made only of spaces counts as empty', async () => {
            const wrapper = render();
            await fill(wrapper, { 'Project name': '   ', 'Client name': 'Acme' });

            await submit(wrapper);

            expect(errors(wrapper)).toEqual(['Project name is required.']);
            expect(wrapper.emitted('submit')).toBeUndefined();
        });

        test('moves focus to the first field with an error', async () => {
            const wrapper = render();
            await fill(wrapper, { 'Project name': 'Site' });

            await submit(wrapper);

            expect(document.activeElement).toBe(field(wrapper, 'Client name').element);
        });

        test('marks invalid fields for assistive technology', async () => {
            const wrapper = render();

            await submit(wrapper);

            expect(field(wrapper, 'Project name').attributes('aria-invalid')).toBe('true');
            expect(field(wrapper, 'Status').attributes('aria-invalid')).toBeUndefined();
        });

        test('a due date before the start date is rejected', async () => {
            const wrapper = render();
            await fill(wrapper, { 'Project name': 'Site', 'Client name': 'Acme', 'Start date': '2026-03-31', 'Due date': '2026-03-30' });

            await submit(wrapper);

            expect(errors(wrapper)).toEqual(['Due date cannot be earlier than the start date.']);
            expect(wrapper.emitted('submit')).toBeUndefined();
        });

        test.each([
            ['the same day as the start date', '2026-03-31', '2026-03-31'],
            ['after the start date', '2026-03-31', '2026-04-30'],
            ['given without a start date', '', '2026-03-01'],
            ['left empty', '2026-03-31', ''],
        ])('accepts a due date %s', async (_, start, due) => {
            const wrapper = render();
            await fill(wrapper, { 'Project name': 'Site', 'Client name': 'Acme', 'Start date': start, 'Due date': due });

            await submit(wrapper);

            expect(errors(wrapper)).toEqual([]);
            expect(wrapper.emitted('submit')).toHaveLength(1);
        });

        test('clears the errors once the form is valid and submitted again', async () => {
            const wrapper = render();
            await submit(wrapper);
            await fill(wrapper, { 'Project name': 'Site', 'Client name': 'Acme' });

            await submit(wrapper);

            expect(errors(wrapper)).toEqual([]);
        });
    });

    describe('submitting', () => {
        test('emits the trimmed values, with empty optional fields as null', async () => {
            const wrapper = render();
            await fill(wrapper, { 'Project name': '  Corporate Site ', 'Client name': ' Acme  ', Status: 'on_hold', Priority: 'low' });

            await submit(wrapper);

            expect(wrapper.emitted('submit')[0][0]).toEqual({
                client_name: 'Acme',
                project_name: 'Corporate Site',
                description: null,
                status: 'on_hold',
                priority: 'low',
                start_date: null,
                due_date: null,
            });
        });

        test('emits every field when all are filled', async () => {
            const wrapper = render();
            await fill(wrapper, { 'Project name': 'Site', 'Client name': 'Acme', Description: ' Notes ', 'Start date': '2026-06-01', 'Due date': '2026-07-15' });

            await submit(wrapper);

            expect(wrapper.emitted('submit')[0][0]).toMatchObject({ description: 'Notes', start_date: '2026-06-01', due_date: '2026-07-15' });
        });

        test('shows a disabled "Saving…" button and ignores submits while saving', async () => {
            const wrapper = render({ project: makeProject(), isSubmitting: true });

            await submit(wrapper);

            expect(button(wrapper, 'Saving…').element.disabled).toBe(true);
            expect(wrapper.emitted('submit')).toBeUndefined();
        });

        test('Cancel emits cancel without validating', async () => {
            const wrapper = render();

            await button(wrapper, 'Cancel').trigger('click');

            expect(wrapper.emitted('cancel')).toHaveLength(1);
            expect(errors(wrapper)).toEqual([]);
            expect(wrapper.emitted('submit')).toBeUndefined();
        });
    });

    describe('server errors', () => {
        test('shows the first server message for each field', () => {
            const wrapper = render({
                serverErrors: {
                    client_name: ['The client name field is required.', 'Another message.'],
                    due_date: ['The due date cannot be earlier than the start date.'],
                },
            });

            expect(errors(wrapper)).toEqual(['The client name field is required.', 'The due date cannot be earlier than the start date.']);
            expect(field(wrapper, 'Client name').attributes('aria-invalid')).toBe('true');
        });

        test('shows a server message for the description', () => {
            const wrapper = render({ serverErrors: { description: ['The description field must not be greater than 5000 characters.'] } });

            expect(errors(wrapper)).toEqual(['The description field must not be greater than 5000 characters.']);
        });
    });
});
