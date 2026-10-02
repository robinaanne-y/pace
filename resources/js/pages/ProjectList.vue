<template>
    <div class="page-heading">
        <div>
            <p class="eyebrow">WORKSPACE</p>
            <h1>Projects</h1>
            <p>Manage and monitor all client projects.</p>
        </div>
        <RouterLink :to="{ name: 'projects.create' }" class="button primary">New Project</RouterLink>
    </div>
</template>
