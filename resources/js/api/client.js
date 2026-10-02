const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

export class ApiError extends Error {
    constructor(status, message, errors = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }
}

export async function request(method, path, body) {
    let response;

    try {
        response = await fetch(`${baseUrl}${path}`, {
            method,
            headers: {
                Accept: 'application/json',
                ...(body ? { 'Content-Type': 'application/json' } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError(0, 'Unable to reach the server. Check your connection and try again.');
    }

    if (response.status === 204) {
        return null;
    }

    const payload = await response.json().catch(() => null);

    if (response.status >= 500) {
        throw new ApiError(response.status, 'The server ran into a problem. Please try again.');
    }

    if (!response.ok) {
        throw new ApiError(response.status, payload?.message ?? 'Something went wrong.', payload?.errors ?? {});
    }

    return payload;
}
