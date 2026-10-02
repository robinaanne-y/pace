<script setup>
import AppIcon from '../components/AppIcon.vue';
import PageHeader from '../components/PageHeader.vue';

defineProps({
    id: { type: String, required: true },
});
</script>

<template>
    <RouterLink :to="{ name: 'projects.show', params: { id } }" class="back-link">
        <AppIcon name="arrow-left" :size="14" />
        Back to project
    </RouterLink>
    <PageHeader title="Edit project" :description="`Project #${id}`" />
</template>
