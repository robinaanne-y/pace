import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { ApiError } from '@/api/client';
import { createProject } from '@/api/projects';
import { useToast } from '@/composables/useToast';
import ProjectCreate from '@/pages/ProjectCreate.vue';
import { button, field, makeProject, makeRouter } from '../helpers';

vi.mock('@/api/projects');

async function render() {
    const router = await makeRouter('/projects/create');
    const wrapper = mount(ProjectCreate, { attachTo: document.body, global: { plugins: [router] } });

    return { wrapper, router };
}

async function fillValidForm(wrapper) {
    await field(wrapper, 'Project name').setValue('Corporate Website');
    await field(wrapper, 'Client name').setValue('Acme Corporation');
    await field(wrapper, 'Description').setValue('Redesign the site.');
    await field(wrapper, 'Status').setValue('in_progress');
    await field(wrapper, 'Priority').setValue('high');
    await field(wrapper, 'Start date').setValue('2026-06-01');
    await field(wrapper, 'Due date').setValue('2026-07-15');
}

const submit = (wrapper) => wrapper.find('form').trigger('submit');
const errors = (wrapper) => wrapper.findAll('.field-error').map((node) => node.text());

describe('ProjectCreate page', () => {
    afterEach(() => {
        useToast().dismiss();
    });

    test('shows the form with a Create Project button', async () => {
        const { wrapper } = await render();

        expect(wrapper.find('h1').text()).toBe('New project');
        expect(button(wrapper, 'Create Project')).toBeDefined();
    });

    test('an invalid form is not sent to the API', async () => {
        const { wrapper } = await render();

        await submit(wrapper);

        expect(errors(wrapper)).toEqual(['Project name is required.', 'Client name is required.']);
        expect(createProject).not.toHaveBeenCalled();
    });

    test('a valid form creates the project, shows a success toast and returns to the list', async () => {
        createProject.mockResolvedValue(makeProject({ id: 9 }));
        const { wrapper, router } = await render();
        await fillValidForm(wrapper);

        await submit(wrapper);
        await flushPromises();

        expect(createProject).toHaveBeenCalledExactlyOnceWith({
            client_name: 'Acme Corporation',
            project_name: 'Corporate Website',
            description: 'Redesign the site.',
            status: 'in_progress',
            priority: 'high',
            start_date: '2026-06-01',
            due_date: '2026-07-15',
        });
        expect(useToast().toast.value).toEqual({ message: 'Project created successfully.', type: 'success' });
        expect(router.currentRoute.value.name).toBe('projects.index');
    });

    test('shows the server validation messages next to their fields and stays on the page', async () => {
        createProject.mockRejectedValue(new ApiError(422, 'The description field must not be greater than 5000 characters.', { description: ['The description field must not be greater than 5000 characters.'] }));
        const { wrapper, router } = await render();
        await fillValidForm(wrapper);

        await submit(wrapper);
        await flushPromises();

        expect(errors(wrapper)).toEqual(['The description field must not be greater than 5000 characters.']);
        expect(field(wrapper, 'Description').attributes('aria-invalid')).toBe('true');
        expect(field(wrapper, 'Project name').element.value).toBe('Corporate Website');
        expect(useToast().toast.value).toBeNull();
        expect(router.currentRoute.value.name).toBe('projects.create');
        expect(button(wrapper, 'Create Project').element.disabled).toBe(false);
    });

    test('shows a toast and keeps the typed values when the request fails for another reason', async () => {
        createProject.mockRejectedValue(new ApiError(0, 'Unable to reach the server. Check your connection and try again.'));
        const { wrapper, router } = await render();
        await fillValidForm(wrapper);

        await submit(wrapper);
        await flushPromises();

        expect(useToast().toast.value).toEqual({ message: 'Unable to reach the server. Check your connection and try again.', type: 'error' });
        expect(field(wrapper, 'Client name').element.value).toBe('Acme Corporation');
        expect(router.currentRoute.value.name).toBe('projects.create');
    });

    test('can be retried after a failure', async () => {
        createProject.mockRejectedValueOnce(new ApiError(500, 'The server ran into a problem. Please try again.')).mockResolvedValueOnce(makeProject());
        const { wrapper, router } = await render();
        await fillValidForm(wrapper);

        await submit(wrapper);
        await flushPromises();
        await submit(wrapper);
        await flushPromises();

        expect(createProject).toHaveBeenCalledTimes(2);
        expect(router.currentRoute.value.name).toBe('projects.index');
    });

    test('sends only one request when submitted twice while saving', async () => {
        let finish;
        createProject.mockReturnValue(new Promise((resolve) => (finish = resolve)));
        const { wrapper } = await render();
        await fillValidForm(wrapper);

        await submit(wrapper);
        expect(button(wrapper, 'Saving…').element.disabled).toBe(true);
        await submit(wrapper);

        expect(createProject).toHaveBeenCalledTimes(1);
        finish(makeProject());
        await flushPromises();
    });

    test('Cancel returns to the list without saving', async () => {
        const { wrapper, router } = await render();

        await button(wrapper, 'Cancel').trigger('click');
        await flushPromises();

        expect(router.currentRoute.value.name).toBe('projects.index');
        expect(createProject).not.toHaveBeenCalled();
    });
});
