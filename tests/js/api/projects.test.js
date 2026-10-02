import { describe, expect, test, vi } from 'vitest';
import { request } from '@/api/client';
import { createProject, deleteProject, getProject, listProjects, updateProject } from '@/api/projects';

vi.mock('@/api/client');

describe('projects API', () => {
    test('listProjects gets /projects and returns the data array', async () => {
        request.mockResolvedValue({ data: [{ id: 1 }] });

        await expect(listProjects()).resolves.toEqual([{ id: 1 }]);
        expect(request).toHaveBeenCalledWith('GET', '/projects');
    });

    test('getProject gets one project and returns its data', async () => {
        request.mockResolvedValue({ data: { id: 7 } });

        await expect(getProject('7')).resolves.toEqual({ id: 7 });
        expect(request).toHaveBeenCalledWith('GET', '/projects/7');
    });

    test('createProject posts the project and returns the created data', async () => {
        request.mockResolvedValue({ data: { id: 8, project_name: 'Site' } });

        await expect(createProject({ project_name: 'Site' })).resolves.toEqual({ id: 8, project_name: 'Site' });
        expect(request).toHaveBeenCalledWith('POST', '/projects', { project_name: 'Site' });
    });

    test('updateProject puts the changes to the project', async () => {
        request.mockResolvedValue({ data: { id: 8 } });

        await updateProject('8', { project_name: 'New' });

        expect(request).toHaveBeenCalledWith('PUT', '/projects/8', { project_name: 'New' });
    });

    test('deleteProject sends a DELETE', async () => {
        request.mockResolvedValue(null);

        await expect(deleteProject(8)).resolves.toBeNull();
        expect(request).toHaveBeenCalledWith('DELETE', '/projects/8');
    });
});
