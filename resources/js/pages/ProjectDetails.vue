<script setup>
defineProps({
    id: { type: String, required: true },
});
</script>

<template>
    <RouterLink :to="{ name: 'projects.index' }" class="back-link">Back to projects</RouterLink>
    <div class="page-heading detail-heading">
        <div>
            <h1>Project details</h1>
            <p>Project #{{ id }}</p>
        </div>
        <div class="detail-actions">
            <RouterLink :to="{ name: 'projects.edit', params: { id } }" class="button secondary">Edit Project</RouterLink>
        </div>
    </div>
</template>
