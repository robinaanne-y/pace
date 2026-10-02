import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useToast } from '@/composables/useToast';

describe('useToast', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        useToast().dismiss();
        vi.useRealTimers();
    });

    test('shows nothing until a toast is raised', () => {
        expect(useToast().toast.value).toBeNull();
    });

    test('shows a success toast', () => {
        const { toast, success } = useToast();

        success('Project created successfully.');

        expect(toast.value).toEqual({ message: 'Project created successfully.', type: 'success' });
    });

    test('shows an error toast', () => {
        const { toast, error } = useToast();

        error('Unable to delete the project.');

        expect(toast.value).toEqual({ message: 'Unable to delete the project.', type: 'error' });
    });

    test('dismisses itself after four seconds', () => {
        const { toast, success } = useToast();

        success('Saved.');
        vi.advanceTimersByTime(3999);
        expect(toast.value).not.toBeNull();
        vi.advanceTimersByTime(1);

        expect(toast.value).toBeNull();
    });

    test('a newer toast replaces the older one and restarts the timer', () => {
        const { toast, success, error } = useToast();

        success('First');
        vi.advanceTimersByTime(3000);
        error('Second');
        vi.advanceTimersByTime(3000);

        expect(toast.value).toEqual({ message: 'Second', type: 'error' });
        vi.advanceTimersByTime(1000);
        expect(toast.value).toBeNull();
    });

    test('can be dismissed by hand', () => {
        const { toast, success, dismiss } = useToast();

        success('Saved.');
        dismiss();

        expect(toast.value).toBeNull();
    });
});
