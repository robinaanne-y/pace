import { describe, expect, test } from 'vitest';
import { formatDate } from '@/format';

describe('formatDate', () => {
    test('formats an ISO date as a short readable date', () => {
        expect(formatDate('2026-10-02')).toBe('Oct 02, 2026');
    });

    test('does not shift the day across time zones', () => {
        expect(formatDate('2026-01-01')).toBe('Jan 01, 2026');
        expect(formatDate('2026-12-31')).toBe('Dec 31, 2026');
    });

    test.each([null, undefined, ''])('shows a dash when the date is %j', (date) => {
        expect(formatDate(date)).toBe('—');
    });
});
