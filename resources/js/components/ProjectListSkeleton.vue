<template>
    <div class="loading-screen" role="status" aria-label="Loading projects">
        <div class="summary-grid">
            <div v-for="card in 4" :key="card" class="surface summary-card">
                <div class="summary-top">
                    <span class="skeleton sk-label" />
                    <span class="skeleton sk-icon" />
                </div>
                <span class="skeleton sk-number" />
                <span class="skeleton sk-note" />
            </div>
        </div>

        <div class="surface loading-panel">
            <div class="skeleton-table-heading">
                <span v-for="column in 6" :key="column" class="skeleton sk-label" />
            </div>
            <div v-for="row in 5" :key="row" class="skeleton-row">
                <div class="skeleton-project">
                    <span class="skeleton sk-icon" />
                    <div>
                        <span class="skeleton sk-title" />
                        <span class="skeleton sk-description" />
                    </div>
                </div>
                <span class="skeleton sk-client" />
                <span class="skeleton sk-badge" />
                <span class="skeleton sk-priority" />
                <span class="skeleton sk-date" />
                <span class="skeleton sk-date" />
            </div>
        </div>
    </div>
</template>
