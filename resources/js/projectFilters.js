export const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'due_date', label: 'Due date' },
    { value: 'start_date', label: 'Start date' },
    { value: 'project_name', label: 'Project name' },
    { value: 'priority', label: 'Priority' },
];

export const PAGE_SIZE = 10;

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

// Dates are ISO strings, so they sort alphabetically; projects without a date go last.
const compareDates = (first, second) => (first ?? '9999').localeCompare(second ?? '9999');

const comparators = {
    due_date: (first, second) => compareDates(first.due_date, second.due_date),
    start_date: (first, second) => compareDates(first.start_date, second.start_date),
    project_name: (first, second) => first.project_name.localeCompare(second.project_name, undefined, { sensitivity: 'base' }),
    priority: (first, second) => PRIORITY_RANK[first.priority] - PRIORITY_RANK[second.priority],
};

export function filterAndSortProjects(projects, { search = '', status = '', priority = '', sort = 'newest' } = {}) {
    const term = search.trim().toLowerCase();

    const matches = projects.filter(
        (project) =>
            (!status || project.status === status) &&
            (!priority || project.priority === priority) &&
            (!term || [project.client_name, project.project_name, project.description].some((text) => text?.toLowerCase().includes(term))),
    );

    return comparators[sort] ? matches.sort(comparators[sort]) : matches;
}
