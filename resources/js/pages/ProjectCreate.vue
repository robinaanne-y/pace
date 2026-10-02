<script setup>
import AppIcon from '../components/AppIcon.vue';
import PageHeader from '../components/PageHeader.vue';
</script>

<template>
    <RouterLink :to="{ name: 'projects.index' }" class="back-link">
        <AppIcon name="arrow-left" :size="14" />
        Back to projects
    </RouterLink>
    <PageHeader title="New project" description="Add a client project to the workspace." />
</template>
