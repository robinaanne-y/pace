import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { ApiError } from '@/api/client';
import { deleteProject, listProjects } from '@/api/projects';
import { useToast } from '@/composables/useToast';
import ProjectList from '@/pages/ProjectList.vue';
import { button, makeProject, makeProjects, makeRouter } from '../helpers';

vi.mock('@/api/projects');

async function render(projects = makeProjects(3)) {
    listProjects.mockResolvedValue(projects);
    const wrapper = mount(ProjectList, { global: { plugins: [await makeRouter()] } });
    await flushPromises();

    return wrapper;
}

const rows = (wrapper) => wrapper.findAll('.table-wrap tbody tr');
const rowNames = (wrapper) => rows(wrapper).map((row) => row.find('.project-name').text());
const footer = (wrapper) => wrapper.find('.table-footer > span').text().replace(/\s+/g, ' ');
const currentPage = (wrapper) => wrapper.find('.pagination [aria-current="page"]').text();

async function search(wrapper, term) {
    await wrapper.find('input[type="search"]').setValue(term);
}

// The dropdown buttons show the chosen option once one is selected, so find them by position, not by label.
const FILTER_POSITION = { Status: 0, Priority: 1, Sort: 2 };

async function choose(wrapper, filter, option) {
    await wrapper.findAll('.filter-button')[FILTER_POSITION[filter]].trigger('click');
    await wrapper.findAll('.dropdown-menu button').find((node) => node.text() === option).trigger('click');
}

describe('ProjectList page', () => {
    afterEach(() => {
        useToast().dismiss();
    });

    describe('loading and failure states', () => {
        test('shows skeletons while the projects load, then the table', async () => {
            let finish;
            listProjects.mockReturnValue(new Promise((resolve) => (finish = resolve)));
            const wrapper = mount(ProjectList, { global: { plugins: [await makeRouter()] } });

            expect(wrapper.find('.loading-screen').exists()).toBe(true);
            expect(wrapper.find('.table-wrap').exists()).toBe(false);

            finish(makeProjects(2));
            await flushPromises();

            expect(wrapper.find('.loading-screen').exists()).toBe(false);
            expect(rows(wrapper)).toHaveLength(2);
        });

        test('shows an empty state with a way to create a project when there are none', async () => {
            const wrapper = await render([]);

            expect(wrapper.find('.empty-state h2').text()).toBe('No projects yet');
            expect(wrapper.find('.table-wrap').exists()).toBe(false);
            expect(wrapper.findAll('a').filter((link) => link.text() === 'New Project')).toHaveLength(2);
        });

        test('shows the error and a Try Again button that loads the projects again', async () => {
            listProjects.mockRejectedValueOnce(new ApiError(0, 'Unable to reach the server. Check your connection and try again.'));
            const wrapper = mount(ProjectList, { global: { plugins: [await makeRouter()] } });
            await flushPromises();

            expect(wrapper.find('.state-panel h2').text()).toBe('Unable to load projects.');
            expect(wrapper.find('.state-panel p').text()).toBe('Unable to reach the server. Check your connection and try again.');
            expect(wrapper.find('.table-wrap').exists()).toBe(false);

            listProjects.mockResolvedValueOnce(makeProjects(2));
            await button(wrapper, 'Try Again').trigger('click');
            await flushPromises();

            expect(listProjects).toHaveBeenCalledTimes(2);
            expect(wrapper.find('.state-panel').exists()).toBe(false);
            expect(rows(wrapper)).toHaveLength(2);
        });
    });

    describe('displaying projects', () => {
        test('shows a row with the details of each project', async () => {
            const wrapper = await render([makeProject()]);
            const cells = rows(wrapper)[0].findAll('td').map((cell) => cell.text());

            expect(cells[0]).toContain('Corporate Website Redesign');
            expect(cells[0]).toContain('Redesign the company website.');
            expect(cells.slice(1, 6)).toEqual(['Acme Corporation', 'In Progress', 'High', 'Jun 01, 2026', 'Jul 15, 2026']);
        });

        test('shows a dash for a project without dates', async () => {
            const wrapper = await render([makeProject({ start_date: null, due_date: null })]);

            expect(rows(wrapper)[0].findAll('td').slice(4, 6).map((cell) => cell.text())).toEqual(['—', '—']);
        });

        test('links each row to its details and edit pages', async () => {
            const wrapper = await render([makeProject({ id: 7 })]);

            expect(rows(wrapper)[0].find('.project-name').attributes('href')).toBe('/projects/7');
            expect(rows(wrapper)[0].find('[aria-label^="View"]').attributes('href')).toBe('/projects/7');
            expect(rows(wrapper)[0].find('[aria-label^="Edit"]').attributes('href')).toBe('/projects/7/edit');
        });

        test('shows summary counts for every project', async () => {
            const wrapper = await render([
                makeProject({ id: 1, status: 'in_progress' }),
                makeProject({ id: 2, status: 'in_progress' }),
                makeProject({ id: 3, status: 'on_hold' }),
                makeProject({ id: 4, status: 'completed' }),
                makeProject({ id: 5, status: 'planning' }),
            ]);

            expect(wrapper.findAll('.summary-number').map((node) => node.text().match(/^\d+/)[0])).toEqual(['5', '2', '1', '1']);
        });
    });

    describe('search, filters and sorting', () => {
        const mixed = [
            makeProject({ id: 1, project_name: 'Website Redesign', client_name: 'Acme', status: 'in_progress', priority: 'high', due_date: '2026-09-01' }),
            makeProject({ id: 2, project_name: 'Online Ordering', client_name: 'GreenLeaf', status: 'planning', priority: 'low', due_date: '2026-07-01' }),
            makeProject({ id: 3, project_name: 'Mobile App', client_name: 'Acme', status: 'in_progress', priority: 'low', due_date: '2026-08-01' }),
        ];

        test('search narrows the rows and reports how many match', async () => {
            const wrapper = await render(mixed);

            await search(wrapper, 'acme');

            expect(rowNames(wrapper)).toEqual(['Website Redesign', 'Mobile App']);
            expect(wrapper.find('.results-bar span').text()).toBe('2 of 3 projects match');
            expect(footer(wrapper)).toBe('Showing 1–2 of 2 projects');
        });

        test('the status and priority filters combine', async () => {
            const wrapper = await render(mixed);

            await choose(wrapper, 'Status', 'In Progress');
            expect(rowNames(wrapper)).toEqual(['Website Redesign', 'Mobile App']);

            await choose(wrapper, 'Priority', 'Low');
            expect(rowNames(wrapper)).toEqual(['Mobile App']);
        });

        test('shows a message when nothing matches, and Clear filters brings everything back', async () => {
            const wrapper = await render(mixed);
            await search(wrapper, 'zzz');

            expect(wrapper.find('.empty-state h2').text()).toBe('No matching projects');
            expect(rows(wrapper)).toHaveLength(0);

            await button(wrapper.find('.empty-state'), 'Clear filters').trigger('click');

            expect(rows(wrapper)).toHaveLength(3);
            expect(wrapper.find('input[type="search"]').element.value).toBe('');
            expect(wrapper.find('.results-bar').exists()).toBe(false);
        });

        test('sorts by due date', async () => {
            const wrapper = await render(mixed);

            await choose(wrapper, 'Sort', 'Due date');

            expect(rowNames(wrapper)).toEqual(['Online Ordering', 'Mobile App', 'Website Redesign']);
        });

        test('keeps the summary counts for all projects while filtering', async () => {
            const wrapper = await render(mixed);

            await search(wrapper, 'zzz');

            expect(wrapper.find('.summary-number').text()).toMatch(/^3/);
        });
    });

    describe('pagination', () => {
        test('shows 10 projects per page with the range in the footer', async () => {
            const wrapper = await render(makeProjects(25));

            expect(rows(wrapper)).toHaveLength(10);
            expect(rowNames(wrapper)[0]).toBe('Project 25');
            expect(footer(wrapper)).toBe('Showing 1–10 of 25 projects');
            expect(wrapper.findAll('.pagination .page-button').filter((node) => /^\d+$/.test(node.text())).map((node) => node.text())).toEqual(['1', '2', '3']);
        });

        test('moves between pages', async () => {
            const wrapper = await render(makeProjects(25));

            await wrapper.find('[aria-label="Page 3"]').trigger('click');
            expect(rows(wrapper)).toHaveLength(5);
            expect(rowNames(wrapper)[0]).toBe('Project 05');
            expect(footer(wrapper)).toBe('Showing 21–25 of 25 projects');

            await wrapper.find('[aria-label="Previous page"]').trigger('click');
            expect(footer(wrapper)).toBe('Showing 11–20 of 25 projects');
        });

        test('hides the page controls when everything fits on one page', async () => {
            const wrapper = await render(makeProjects(10));

            expect(wrapper.find('.pagination').exists()).toBe(false);
            expect(footer(wrapper)).toBe('Showing 1–10 of 10 projects');
        });

        test('returns to the first page when the search, a filter or the sort changes', async () => {
            const wrapper = await render(makeProjects(25));

            await wrapper.find('[aria-label="Page 2"]').trigger('click');
            await search(wrapper, 'Client');
            expect(currentPage(wrapper)).toBe('1');

            await wrapper.find('[aria-label="Page 3"]').trigger('click');
            await choose(wrapper, 'Status', 'Planning');
            await choose(wrapper, 'Status', 'All statuses');
            expect(currentPage(wrapper)).toBe('1');

            await wrapper.find('[aria-label="Page 2"]').trigger('click');
            await choose(wrapper, 'Sort', 'Project name');
            expect(currentPage(wrapper)).toBe('1');
        });

        test('paginates the filtered results, not all projects', async () => {
            const wrapper = await render(makeProjects(25));

            await search(wrapper, 'client 1');

            expect(footer(wrapper)).toBe('Showing 1–10 of 11 projects');
            expect(wrapper.find('[aria-label="Page 2"]').exists()).toBe(true);
            expect(wrapper.find('[aria-label="Page 3"]').exists()).toBe(false);
        });
    });

    describe('deleting', () => {
        const deleteButton = (wrapper, name) => wrapper.find(`.table-wrap [aria-label="Delete ${name}"]`);
        const dialog = (wrapper) => wrapper.find('dialog.delete-dialog');

        test('asks for confirmation naming the project before deleting anything', async () => {
            const wrapper = await render();

            await deleteButton(wrapper, 'Project 02').trigger('click');

            expect(dialog(wrapper).attributes('open')).toBeDefined();
            expect(dialog(wrapper).find('strong').text()).toBe('Project 02');
            expect(deleteProject).not.toHaveBeenCalled();
            expect(rows(wrapper)).toHaveLength(3);
        });

        test('Cancel keeps the project', async () => {
            const wrapper = await render();
            await deleteButton(wrapper, 'Project 02').trigger('click');

            await button(dialog(wrapper), 'Cancel').trigger('click');

            expect(dialog(wrapper).attributes('open')).toBeUndefined();
            expect(deleteProject).not.toHaveBeenCalled();
            expect(rows(wrapper)).toHaveLength(3);
        });

        test('confirming deletes that project, removes its row and updates the counts', async () => {
            deleteProject.mockResolvedValue(null);
            const wrapper = await render(makeProjects(3));
            await deleteButton(wrapper, 'Project 02').trigger('click');

            await button(dialog(wrapper), 'Delete Project').trigger('click');
            await flushPromises();

            expect(deleteProject).toHaveBeenCalledExactlyOnceWith(2);
            expect(rowNames(wrapper)).toEqual(['Project 03', 'Project 01']);
            expect(wrapper.find('.count-badge').text()).toBe('2');
            expect(footer(wrapper)).toBe('Showing 1–2 of 2 projects');
            expect(useToast().toast.value).toEqual({ message: 'Project deleted successfully.', type: 'success' });
        });

        test('deleting the only project on the last page moves back one page', async () => {
            deleteProject.mockResolvedValue(null);
            const wrapper = await render(makeProjects(21));
            await wrapper.find('[aria-label="Page 3"]').trigger('click');
            expect(rowNames(wrapper)).toEqual(['Project 01']);

            await deleteButton(wrapper, 'Project 01').trigger('click');
            await button(dialog(wrapper), 'Delete Project').trigger('click');
            await flushPromises();

            expect(currentPage(wrapper)).toBe('2');
            expect(footer(wrapper)).toBe('Showing 11–20 of 20 projects');
        });

        test('a failed delete keeps the row and shows the error', async () => {
            deleteProject.mockRejectedValue(new ApiError(0, 'Unable to reach the server. Check your connection and try again.'));
            const wrapper = await render();
            await deleteButton(wrapper, 'Project 02').trigger('click');

            await button(dialog(wrapper), 'Delete Project').trigger('click');
            await flushPromises();

            expect(rows(wrapper)).toHaveLength(3);
            expect(useToast().toast.value).toEqual({ message: 'Unable to reach the server. Check your connection and try again.', type: 'error' });
        });

        test('a project that was already deleted elsewhere is removed from the list', async () => {
            deleteProject.mockRejectedValue(new ApiError(404, 'Project not found.'));
            const wrapper = await render();
            await deleteButton(wrapper, 'Project 02').trigger('click');

            await button(dialog(wrapper), 'Delete Project').trigger('click');
            await flushPromises();

            expect(rowNames(wrapper)).toEqual(['Project 03', 'Project 01']);
        });
    });
});
