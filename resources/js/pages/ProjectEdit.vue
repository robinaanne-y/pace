<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { updateProject } from '../api/projects';
import AppIcon from '../components/AppIcon.vue';
import PageHeader from '../components/PageHeader.vue';
import ProjectForm from '../components/ProjectForm.vue';
import ProjectLoadError from '../components/ProjectLoadError.vue';
import { useProject } from '../composables/useProject';
import { useToast } from '../composables/useToast';

const props = defineProps({
    id: { type: String, required: true },
});

const router = useRouter();
const toast = useToast();
const { project, isLoading, isNotFound, loadError, load } = useProject(props.id);
const serverErrors = ref({});
const isSubmitting = ref(false);

// Returns to wherever the edit was opened from: the list or the project's details panel.
function goBack() {
    if (window.history.state?.back) {
        router.back();
    } else {
        router.push({ name: 'projects.index' });
    }
}

async function save(changes) {
    isSubmitting.value = true;
    serverErrors.value = {};

    try {
        await updateProject(props.id, changes);
        toast.success('Project updated successfully.');
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
    <button type="button" class="back-link" @click="goBack">
        <AppIcon name="arrow-left" :size="14" />
        Back
    </button>
    <PageHeader title="Edit project" :description="project ? project.project_name : ''" />

    <div v-if="isLoading" class="surface project-form" role="status" aria-label="Loading project">
        <div class="form-fields">
            <span class="skeleton sk-label" />
            <span class="skeleton sk-search" />
            <span class="skeleton sk-label" />
            <span class="skeleton sk-search" />
            <span class="skeleton sk-label" />
            <span class="skeleton sk-search" />
        </div>
    </div>
    <ProjectLoadError v-else-if="loadError" :not-found="isNotFound" :message="loadError" @retry="load" />
    <ProjectForm
        v-else
        :project="project"
        submit-label="Save Changes"
        :server-errors="serverErrors"
        :is-submitting="isSubmitting"
        @submit="save"
        @cancel="goBack"
    />
</template>
