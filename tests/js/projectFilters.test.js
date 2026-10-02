import { describe, expect, test } from 'vitest';
import { filterAndSortProjects, PAGE_SIZE } from '@/projectFilters';
import { makeProject } from './helpers';

const acme = makeProject({ id: 1, client_name: 'Acme Corporation', project_name: 'Website Redesign', description: 'Modernise the site', status: 'in_progress', priority: 'high', start_date: '2026-06-01', due_date: '2026-07-15' });
const cafe = makeProject({ id: 2, client_name: 'GreenLeaf Cafe', project_name: 'Online Ordering', description: null, status: 'planning', priority: 'medium', start_date: '2026-06-10', due_date: '2026-08-01' });
const clinic = makeProject({ id: 3, client_name: 'HealthFirst Clinic', project_name: 'Appointment System', description: 'Booking for patients', status: 'completed', priority: 'low', start_date: null, due_date: null });
const projects = [acme, cafe, clinic];

const names = (list) => list.map((project) => project.project_name);

describe('filterAndSortProjects', () => {
    test('page size is 10', () => {
        expect(PAGE_SIZE).toBe(10);
    });

    test('returns every project in the given order by default', () => {
        expect(filterAndSortProjects(projects)).toEqual(projects);
    });

    describe('search', () => {
        test.each([
            ['client name', 'greenleaf', ['Online Ordering']],
            ['project name', 'APPOINTMENT', ['Appointment System']],
            ['description', 'patients', ['Appointment System']],
            ['partial words', 'web', ['Website Redesign']],
        ])('matches on %s, ignoring case', (_, search, expected) => {
            expect(names(filterAndSortProjects(projects, { search }))).toEqual(expected);
        });

        test('ignores surrounding whitespace', () => {
            expect(names(filterAndSortProjects(projects, { search: '  acme  ' }))).toEqual(['Website Redesign']);
        });

        test('does not fail on projects without a description', () => {
            expect(filterAndSortProjects([cafe], { search: 'nothing' })).toEqual([]);
        });

        test('returns nothing when no project matches', () => {
            expect(filterAndSortProjects(projects, { search: 'zzz' })).toEqual([]);
        });
    });

    describe('filters', () => {
        test('filters by status', () => {
            expect(names(filterAndSortProjects(projects, { status: 'planning' }))).toEqual(['Online Ordering']);
        });

        test('filters by priority', () => {
            expect(names(filterAndSortProjects(projects, { priority: 'low' }))).toEqual(['Appointment System']);
        });

        test('combines search, status and priority', () => {
            const both = [acme, makeProject({ id: 9, project_name: 'Other', status: 'in_progress', priority: 'low' })];

            expect(names(filterAndSortProjects(both, { status: 'in_progress', priority: 'high' }))).toEqual(['Website Redesign']);
            expect(filterAndSortProjects(both, { status: 'planning' })).toEqual([]);
        });
    });

    describe('sorting', () => {
        test('sorts by due date, soonest first, with undated projects last', () => {
            expect(names(filterAndSortProjects(projects, { sort: 'due_date' }))).toEqual(['Website Redesign', 'Online Ordering', 'Appointment System']);
        });

        test('sorts by start date, earliest first, with undated projects last', () => {
            expect(names(filterAndSortProjects([clinic, cafe, acme], { sort: 'start_date' }))).toEqual(['Website Redesign', 'Online Ordering', 'Appointment System']);
        });

        test('sorts by project name, ignoring case', () => {
            const lower = makeProject({ id: 4, project_name: 'banking app' });

            expect(names(filterAndSortProjects([...projects, lower], { sort: 'project_name' }))).toEqual(['Appointment System', 'banking app', 'Online Ordering', 'Website Redesign']);
        });

        test('sorts by priority, high first', () => {
            expect(names(filterAndSortProjects([clinic, cafe, acme], { sort: 'priority' }))).toEqual(['Website Redesign', 'Online Ordering', 'Appointment System']);
        });

        test('keeps the given order for "newest" and for unknown sorts', () => {
            expect(filterAndSortProjects([clinic, acme], { sort: 'newest' })).toEqual([clinic, acme]);
            expect(filterAndSortProjects([clinic, acme], { sort: 'bogus' })).toEqual([clinic, acme]);
        });

        test('does not reorder the original list', () => {
            const original = [clinic, cafe, acme];

            filterAndSortProjects(original, { sort: 'priority' });

            expect(original).toEqual([clinic, cafe, acme]);
        });
    });
});
