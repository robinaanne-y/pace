<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createProject } from '../api/projects';
import AppIcon from '../components/AppIcon.vue';
import PageHeader from '../components/PageHeader.vue';
import ProjectForm from '../components/ProjectForm.vue';
import { useToast } from '../composables/useToast';

const router = useRouter();
const toast = useToast();
const serverErrors = ref({});
const isSubmitting = ref(false);

async function save(project) {
    isSubmitting.value = true;
    serverErrors.value = {};

    try {
        await createProject(project);
        toast.success('Project created successfully.');
        router.push({ name: 'projects.index' });
    } catch (error) {
        if (error.status === 422) {
            serverErrors.value = error.errors;
        } else {
            toast.error(error.message);
        }
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <RouterLink :to="{ name: 'projects.index' }" class="back-link">
        <AppIcon name="arrow-left" :size="14" />
        Back to projects
    </RouterLink>
    <PageHeader title="New project" description="Add a client project to the workspace." />
    <ProjectForm submit-label="Create Project" :cancel-to="{ name: 'projects.index' }" :server-errors="serverErrors" :is-submitting="isSubmitting" @submit="save" />
</template>
