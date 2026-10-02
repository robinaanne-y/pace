import { createRouter, createWebHistory } from 'vue-router';
import NotFound from './pages/NotFound.vue';
import ProjectCreate from './pages/ProjectCreate.vue';
import ProjectDetails from './pages/ProjectDetails.vue';
import ProjectEdit from './pages/ProjectEdit.vue';
import ProjectList from './pages/ProjectList.vue';

const appName = import.meta.env.VITE_APP_NAME ?? 'Pace';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: { name: 'projects.index' } },
        {
            path: '/projects',
            name: 'projects.index',
            component: ProjectList,
            meta: { title: 'Projects' },
            children: [{ path: ':id(\\d+)', name: 'projects.show', component: ProjectDetails, props: true, meta: { title: 'Project details' } }],
        },
        { path: '/projects/create', name: 'projects.create', component: ProjectCreate, meta: { title: 'New project' } },
        { path: '/projects/:id(\\d+)/edit', name: 'projects.edit', component: ProjectEdit, props: true, meta: { title: 'Edit project' } },
        { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound, meta: { title: 'Page not found' } },
    ],
    // The details panel opens over the list, so moving between the two keeps the scroll position.
    scrollBehavior: (to, from) => (to.matched[0]?.name === 'projects.index' && from.matched[0]?.name === 'projects.index' ? false : { top: 0 }),
});

router.afterEach((to) => {
    document.title = `${to.meta.title} · ${appName}`;
});

export default router;
