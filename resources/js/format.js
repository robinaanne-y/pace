const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

export function formatDate(date) {
    if (!date) {
        return '—';
    }

    const [year, month, day] = date.split('-').map(Number);

    return dateFormatter.format(new Date(year, month - 1, day));
}
