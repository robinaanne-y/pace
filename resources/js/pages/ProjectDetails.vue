<script setup>
import AppIcon from '../components/AppIcon.vue';
import BaseButton from '../components/BaseButton.vue';
import PageHeader from '../components/PageHeader.vue';

defineProps({
    id: { type: String, required: true },
});
</script>

<template>
    <RouterLink :to="{ name: 'projects.index' }" class="back-link">
        <AppIcon name="arrow-left" :size="14" />
        Back to projects
    </RouterLink>
    <PageHeader class="detail-heading" title="Project details" :description="`Project #${id}`">
        <template #actions>
            <div class="detail-actions">
                <BaseButton variant="secondary" :to="{ name: 'projects.edit', params: { id } }">Edit Project</BaseButton>
            </div>
        </template>
    </PageHeader>
</template>
