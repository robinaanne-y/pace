<script setup>
defineProps({
    id: { type: String, required: true },
});
</script>

<template>
    <RouterLink :to="{ name: 'projects.show', params: { id } }" class="back-link">Back to project</RouterLink>
    <div class="page-heading">
        <div>
            <h1>Edit project</h1>
            <p>Project #{{ id }}</p>
        </div>
    </div>
</template>
