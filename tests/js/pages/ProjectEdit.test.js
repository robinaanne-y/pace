import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { ApiError } from '@/api/client';
import { getProject, updateProject } from '@/api/projects';
import { useToast } from '@/composables/useToast';
import ProjectEdit from '@/pages/ProjectEdit.vue';
import { button, field, makeProject, makeRouter } from '../helpers';

vi.mock('@/api/projects');

async function render({ load = makeProject({ id: 5 }) } = {}) {
    getProject.mockImplementation(() => (load instanceof Error ? Promise.reject(load) : Promise.resolve(load)));
    const router = await makeRouter('/projects/5/edit');
    const wrapper = mount(ProjectEdit, { attachTo: document.body, props: { id: '5' }, global: { plugins: [router] } });
    await flushPromises();

    return { wrapper, router };
}

const submit = (wrapper) => wrapper.find('form').trigger('submit');
const errors = (wrapper) => wrapper.findAll('.field-error').map((node) => node.text());

describe('ProjectEdit page', () => {
    afterEach(() => {
        useToast().dismiss();
        window.history.replaceState(null, '');
    });

    describe('loading the project', () => {
        test('shows a skeleton while the project loads, then the filled form', async () => {
            let finish;
            getProject.mockReturnValue(new Promise((resolve) => (finish = resolve)));
            const wrapper = mount(ProjectEdit, { props: { id: '5' }, global: { plugins: [await makeRouter('/projects/5/edit')] } });

            expect(wrapper.find('[aria-label="Loading project"]').exists()).toBe(true);
            expect(wrapper.find('form').exists()).toBe(false);

            finish(makeProject({ id: 5 }));
            await flushPromises();

            expect(wrapper.find('[aria-label="Loading project"]').exists()).toBe(false);
            expect(wrapper.find('form').exists()).toBe(true);
        });

        test('asks the API for the project in the URL and fills the form with it', async () => {
            const { wrapper } = await render();

            expect(getProject).toHaveBeenCalledExactlyOnceWith('5');
            expect(wrapper.find('h1').text()).toBe('Edit project');
            expect(field(wrapper, 'Project name').element.value).toBe('Corporate Website Redesign');
            expect(field(wrapper, 'Client name').element.value).toBe('Acme Corporation');
            expect(field(wrapper, 'Status').element.value).toBe('in_progress');
            expect(field(wrapper, 'Due date').element.value).toBe('2026-07-15');
            expect(button(wrapper, 'Save Changes')).toBeDefined();
        });

        test('says so, without a form, when the project does not exist', async () => {
            const { wrapper } = await render({ load: new ApiError(404, 'Project not found.') });

            expect(wrapper.find('.empty-state h2').text()).toBe('Project not found');
            expect(wrapper.find('form').exists()).toBe(false);
            expect(wrapper.find('.empty-state a').attributes('href')).toBe('/projects');
        });

        test('shows the error with Try Again, which loads the project again', async () => {
            const { wrapper } = await render({ load: new ApiError(0, 'Unable to reach the server. Check your connection and try again.') });

            expect(wrapper.find('.empty-state h2').text()).toBe('Unable to load project.');
            expect(wrapper.find('form').exists()).toBe(false);

            getProject.mockResolvedValue(makeProject({ id: 5 }));
            await button(wrapper, 'Try Again').trigger('click');
            await flushPromises();

            expect(getProject).toHaveBeenCalledTimes(2);
            expect(wrapper.find('form').exists()).toBe(true);
        });
    });

    describe('saving', () => {
        test('sends the changed project, shows a success toast and returns to the list', async () => {
            updateProject.mockResolvedValue(makeProject({ id: 5 }));
            const { wrapper, router } = await render();
            await field(wrapper, 'Project name').setValue('Renamed Project');
            await field(wrapper, 'Status').setValue('completed');
            await field(wrapper, 'Description').setValue('');

            await submit(wrapper);
            await flushPromises();

            expect(updateProject).toHaveBeenCalledExactlyOnceWith('5', {
                client_name: 'Acme Corporation',
                project_name: 'Renamed Project',
                description: null,
                status: 'completed',
                priority: 'high',
                start_date: '2026-06-01',
                due_date: '2026-07-15',
            });
            expect(useToast().toast.value).toEqual({ message: 'Project updated successfully.', type: 'success' });
            expect(router.currentRoute.value.name).toBe('projects.index');
        });

        test('does not send an invalid form', async () => {
            const { wrapper } = await render();
            await field(wrapper, 'Client name').setValue('');
            await field(wrapper, 'Due date').setValue('2026-05-01');

            await submit(wrapper);

            expect(errors(wrapper)).toEqual(['Client name is required.', 'Due date cannot be earlier than the start date.']);
            expect(updateProject).not.toHaveBeenCalled();
        });

        test('shows server validation messages and stays on the page', async () => {
            updateProject.mockRejectedValue(new ApiError(422, 'The project name field must not be greater than 255 characters.', { project_name: ['The project name field must not be greater than 255 characters.'] }));
            const { wrapper, router } = await render();

            await submit(wrapper);
            await flushPromises();

            expect(errors(wrapper)).toEqual(['The project name field must not be greater than 255 characters.']);
            expect(router.currentRoute.value.name).toBe('projects.edit');
            expect(useToast().toast.value).toBeNull();
        });

        test('keeps the edited values and shows a toast when the connection fails, and can retry', async () => {
            updateProject.mockRejectedValueOnce(new ApiError(0, 'Unable to reach the server. Check your connection and try again.')).mockResolvedValueOnce(makeProject({ id: 5 }));
            const { wrapper, router } = await render();
            await field(wrapper, 'Project name').setValue('Edited offline');

            await submit(wrapper);
            await flushPromises();

            expect(useToast().toast.value.type).toBe('error');
            expect(field(wrapper, 'Project name').element.value).toBe('Edited offline');
            expect(button(wrapper, 'Save Changes').element.disabled).toBe(false);

            await submit(wrapper);
            await flushPromises();

            expect(updateProject).toHaveBeenCalledTimes(2);
            expect(router.currentRoute.value.name).toBe('projects.index');
        });
    });

    describe('leaving without saving', () => {
        test('Cancel goes to the list when the page was opened directly', async () => {
            const { wrapper, router } = await render();

            await button(wrapper, 'Cancel').trigger('click');
            await flushPromises();

            expect(router.currentRoute.value.name).toBe('projects.index');
            expect(updateProject).not.toHaveBeenCalled();
        });

        test('Cancel and Back return to the previous page when there is one', async () => {
            const { wrapper, router } = await render();
            const back = vi.spyOn(router, 'back').mockImplementation(() => {});
            window.history.replaceState({ back: '/projects/5' }, '');

            await button(wrapper, 'Cancel').trigger('click');
            await button(wrapper, 'Back').trigger('click');

            expect(back).toHaveBeenCalledTimes(2);
            expect(router.currentRoute.value.name).toBe('projects.edit');
        });
    });
});
