<script setup>
import AppIcon from '../components/AppIcon.vue';
import BaseButton from '../components/BaseButton.vue';
import PageHeader from '../components/PageHeader.vue';
</script>

<template>
    <PageHeader eyebrow="WORKSPACE" title="Projects" description="Manage and monitor all client projects.">
        <template #actions>
            <BaseButton :to="{ name: 'projects.create' }">
                <AppIcon name="plus" />
                New Project
            </BaseButton>
        </template>
    </PageHeader>
</template>
