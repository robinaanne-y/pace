<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppIcon from '../components/AppIcon.vue';
import BaseButton from '../components/BaseButton.vue';
import DeleteProjectModal from '../components/DeleteProjectModal.vue';
import PageHeader from '../components/PageHeader.vue';
import PriorityBadge from '../components/PriorityBadge.vue';
import ProjectLoadError from '../components/ProjectLoadError.vue';
import StatusBadge from '../components/StatusBadge.vue';
import { useProject } from '../composables/useProject';
import { formatDate } from '../format';

const props = defineProps({
    id: { type: String, required: true },
});

const router = useRouter();
const { project, isLoading, isNotFound, loadError, load } = useProject(props.id);
const isDeleteModalOpen = ref(false);
</script>

<template>
    <RouterLink :to="{ name: 'projects.index' }" class="back-link">
        <AppIcon name="arrow-left" :size="14" />
        Back to projects
    </RouterLink>

    <div v-if="isLoading" class="surface detail-card" role="status" aria-label="Loading project">
        <div class="form-fields">
            <span class="skeleton sk-title" />
            <span class="skeleton sk-description" />
            <span class="skeleton sk-search" />
            <span class="skeleton sk-search" />
        </div>
    </div>
    <ProjectLoadError v-else-if="loadError" :not-found="isNotFound" :message="loadError" @retry="load" />
    <template v-else>
        <PageHeader class="detail-heading" :title="project.project_name" :description="project.client_name">
            <template #actions>
                <div class="detail-actions">
                    <BaseButton variant="secondary" :to="{ name: 'projects.edit', params: { id } }">
                        <AppIcon name="pencil" :size="14" />
                        Edit Project
                    </BaseButton>
                    <BaseButton variant="destructive" @click="isDeleteModalOpen = true">
                        <AppIcon name="trash" :size="14" />
                        Delete
                    </BaseButton>
                </div>
            </template>
        </PageHeader>

        <div class="surface detail-card">
            <dl class="metadata">
                <div>
                    <dt>Status</dt>
                    <dd><StatusBadge :status="project.status" /></dd>
                </div>
                <div>
                    <dt>Priority</dt>
                    <dd><PriorityBadge :priority="project.priority" /></dd>
                </div>
                <div>
                    <dt>Start Date</dt>
                    <dd>
                        <AppIcon name="calendar" />
                        {{ formatDate(project.start_date) }}
                    </dd>
                </div>
                <div>
                    <dt>Due Date</dt>
                    <dd>
                        <AppIcon name="calendar" />
                        {{ formatDate(project.due_date) }}
                    </dd>
                </div>
            </dl>
            <div class="description-section">
                <h2>Description</h2>
                <p>{{ project.description ?? 'No description provided.' }}</p>
            </div>
        </div>

        <DeleteProjectModal v-model:open="isDeleteModalOpen" :project="project" @deleted="router.push({ name: 'projects.index' })" />
    </template>
</template>
