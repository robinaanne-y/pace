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
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
            Accept: 'application/json',
            ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) {
        return null;
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(response.status, payload?.message ?? 'Something went wrong.', payload?.errors ?? {});
    }

    return payload;
}
