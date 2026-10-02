import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ApiError, request } from '@/api/client';

function respond(status, body) {
    return {
        status,
        ok: status >= 200 && status < 300,
        json: body === undefined ? () => Promise.reject(new SyntaxError('Unexpected end of JSON input')) : () => Promise.resolve(body),
    };
}

describe('request', () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('sends a GET to the API base URL asking for JSON, without a body', async () => {
        fetchMock.mockResolvedValue(respond(200, { data: [] }));

        const result = await request('GET', '/projects');

        expect(result).toEqual({ data: [] });
        expect(fetchMock).toHaveBeenCalledWith('/api/projects', { method: 'GET', headers: { Accept: 'application/json' }, body: undefined });
    });

    test('sends a JSON body with a content type', async () => {
        fetchMock.mockResolvedValue(respond(201, { data: { id: 1 } }));

        await request('POST', '/projects', { project_name: 'Site' });

        expect(fetchMock).toHaveBeenCalledWith('/api/projects', {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: '{"project_name":"Site"}',
        });
    });

    test('returns null for 204 No Content', async () => {
        fetchMock.mockResolvedValue(respond(204));

        await expect(request('DELETE', '/projects/1')).resolves.toBeNull();
    });

    test('turns a validation failure into an ApiError with the field messages', async () => {
        const errors = { client_name: ['The client name field is required.'] };
        fetchMock.mockResolvedValue(respond(422, { message: 'The client name field is required.', errors }));

        const error = await request('POST', '/projects', {}).catch((caught) => caught);

        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({ status: 422, message: 'The client name field is required.', errors });
    });

    test('keeps the server message for a 404', async () => {
        fetchMock.mockResolvedValue(respond(404, { message: 'Project not found.' }));

        await expect(request('GET', '/projects/9')).rejects.toMatchObject({ status: 404, message: 'Project not found.', errors: {} });
    });

    test('hides the server message and details on a 500', async () => {
        fetchMock.mockResolvedValue(respond(500, { message: 'SQLSTATE[HY000]: connection refused', trace: ['…'] }));

        const error = await request('GET', '/projects').catch((caught) => caught);

        expect(error.status).toBe(500);
        expect(error.message).toBe('The server ran into a problem. Please try again.');
        expect(error.errors).toEqual({});
    });

    test('uses a plain message when an error response is not JSON', async () => {
        fetchMock.mockResolvedValue(respond(400));

        await expect(request('GET', '/projects')).rejects.toMatchObject({ status: 400, message: 'Something went wrong.' });
    });

    test('reports a dropped connection as an ApiError with status 0', async () => {
        fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

        const error = await request('GET', '/projects').catch((caught) => caught);

        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(0);
        expect(error.message).toBe('Unable to reach the server. Check your connection and try again.');
    });
});
