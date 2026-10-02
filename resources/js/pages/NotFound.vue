<template>
    <div class="surface empty-state">
        <h2>Page not found</h2>
        <p>The page you are looking for does not exist.</p>
        <RouterLink :to="{ name: 'projects.index' }" class="button primary">Back to projects</RouterLink>
    </div>
</template>
