import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { ApiError } from '@/api/client';
import { deleteProject } from '@/api/projects';
import DeleteProjectModal from '@/components/DeleteProjectModal.vue';
import { useToast } from '@/composables/useToast';
import { button, makeProject } from '../helpers';

vi.mock('@/api/projects');

function render() {
    const wrapper = mount(DeleteProjectModal, {
        props: { open: true, project: makeProject({ id: 5, project_name: 'Corporate Website Redesign' }), 'onUpdate:open': (value) => wrapper.setProps({ open: value }) },
    });

    return wrapper;
}

describe('DeleteProjectModal', () => {
    afterEach(() => {
        useToast().dismiss();
    });

    test('names the project and does nothing until confirmed', () => {
        const wrapper = render();

        expect(wrapper.find('dialog').attributes('open')).toBeDefined();
        expect(wrapper.find('dialog p').text()).toContain('Corporate Website Redesign');
        expect(wrapper.find('dialog p').text()).toContain('cannot be undone');
        expect(deleteProject).not.toHaveBeenCalled();
    });

    test('Cancel closes the dialog without deleting', async () => {
        const wrapper = render();

        await button(wrapper, 'Cancel').trigger('click');

        expect(wrapper.props('open')).toBe(false);
        expect(deleteProject).not.toHaveBeenCalled();
        expect(wrapper.emitted('deleted')).toBeUndefined();
    });

    test('confirming deletes the project, closes, shows a success toast and reports it', async () => {
        deleteProject.mockResolvedValue(null);
        const wrapper = render();

        await button(wrapper, 'Delete Project').trigger('click');
        await flushPromises();

        expect(deleteProject).toHaveBeenCalledExactlyOnceWith(5);
        expect(wrapper.props('open')).toBe(false);
        expect(useToast().toast.value).toEqual({ message: 'Project deleted successfully.', type: 'success' });
        expect(wrapper.emitted('deleted')).toHaveLength(1);
    });

    test('disables both buttons and ignores a second click while deleting', async () => {
        let finish;
        deleteProject.mockReturnValue(new Promise((resolve) => (finish = resolve)));
        const wrapper = render();

        await button(wrapper, 'Delete Project').trigger('click');

        expect(button(wrapper, 'Deleting…').element.disabled).toBe(true);
        expect(button(wrapper, 'Cancel').element.disabled).toBe(true);
        await button(wrapper, 'Deleting…').trigger('click');
        expect(deleteProject).toHaveBeenCalledTimes(1);

        finish(null);
        await flushPromises();
        expect(button(wrapper, 'Delete Project').element.disabled).toBe(false);
    });

    test('a failure shows the error and keeps the project in place', async () => {
        deleteProject.mockRejectedValue(new ApiError(0, 'Unable to reach the server. Check your connection and try again.'));
        const wrapper = render();

        await button(wrapper, 'Delete Project').trigger('click');
        await flushPromises();

        expect(useToast().toast.value).toEqual({ message: 'Unable to reach the server. Check your connection and try again.', type: 'error' });
        expect(wrapper.emitted('deleted')).toBeUndefined();
        expect(wrapper.props('open')).toBe(false);
    });

    test('a project that is already gone is reported as deleted so the list can drop it', async () => {
        deleteProject.mockRejectedValue(new ApiError(404, 'Project not found.'));
        const wrapper = render();

        await button(wrapper, 'Delete Project').trigger('click');
        await flushPromises();

        expect(useToast().toast.value).toEqual({ message: 'This project has already been deleted.', type: 'error' });
        expect(wrapper.emitted('deleted')).toHaveLength(1);
    });
});
