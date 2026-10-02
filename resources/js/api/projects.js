import { request } from './client';

export async function listProjects() {
    return (await request('GET', '/projects')).data;
}

export async function getProject(id) {
    return (await request('GET', `/projects/${id}`)).data;
}

export async function createProject(project) {
    return (await request('POST', '/projects', project)).data;
}

export async function updateProject(id, project) {
    return (await request('PUT', `/projects/${id}`, project)).data;
}

export function deleteProject(id) {
    return request('DELETE', `/projects/${id}`);
}
