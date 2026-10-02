import { createMemoryHistory, createRouter } from 'vue-router';

export function makeProject(overrides = {}) {
    return {
        id: 1,
        client_name: 'Acme Corporation',
        project_name: 'Corporate Website Redesign',
        description: 'Redesign the company website.',
        status: 'in_progress',
        priority: 'high',
        start_date: '2026-06-01',
        due_date: '2026-07-15',
        created_at: '2026-10-02T04:16:43.000000Z',
        updated_at: '2026-10-02T04:16:43.000000Z',
        ...overrides,
    };
}

export function makeProjects(count) {
    return Array.from({ length: count }, (_, index) =>
        makeProject({ id: count - index, project_name: `Project ${String(count - index).padStart(2, '0')}`, client_name: `Client ${count - index}` }),
    );
}

export async function makeRouter(path = '/projects') {
    const Stub = { template: '<div />' };
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/projects', name: 'projects.index', component: Stub },
            { path: '/projects/create', name: 'projects.create', component: Stub },
            { path: '/projects/:id', name: 'projects.show', component: Stub },
            { path: '/projects/:id/edit', name: 'projects.edit', component: Stub },
        ],
    });

    await router.push(path);
    await router.isReady();

    return router;
}

export function field(wrapper, labelText) {
    const label = wrapper.findAll('label').find((candidate) => candidate.text().startsWith(labelText));

    return wrapper.find(`[id="${label.attributes('for')}"]`);
}

export function button(wrapper, text) {
    return wrapper.findAll('button, a').find((candidate) => candidate.text() === text);
}
