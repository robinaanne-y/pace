<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppIcon from '../components/AppIcon.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseDrawer from '../components/BaseDrawer.vue';
import DeleteProjectModal from '../components/DeleteProjectModal.vue';
import PriorityBadge from '../components/PriorityBadge.vue';
import ProjectLoadError from '../components/ProjectLoadError.vue';
import StatusBadge from '../components/StatusBadge.vue';
import { useProject } from '../composables/useProject';
import { formatDate } from '../format';

const props = defineProps({
    id: { type: String, required: true },
});

const emit = defineEmits(['deleted']);

const router = useRouter();
const { project, isLoading, isNotFound, loadError, load } = useProject(props.id);
const isDeleteModalOpen = ref(false);

function close() {
    router.push({ name: 'projects.index' });
}

function closeAfterDelete() {
    emit('deleted', project.value.id);
    close();
}
</script>

<template>
    <BaseDrawer @close="close">
        <template #header>
            <h2>{{ project ? project.project_name : 'Project details' }}</h2>
            <p v-if="project">{{ project.client_name }}</p>
        </template>

        <div v-if="isLoading" class="form-fields" role="status" aria-label="Loading project">
            <span class="skeleton sk-title" />
            <span class="skeleton sk-description" />
            <span class="skeleton sk-search" />
            <span class="skeleton sk-search" />
        </div>
        <div v-else-if="loadError" class="form-fields">
            <ProjectLoadError :not-found="isNotFound" :message="loadError" @retry="load" />
        </div>
        <template v-else>
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

            <DeleteProjectModal v-model:open="isDeleteModalOpen" :project="project" @deleted="closeAfterDelete" />
        </template>

        <template v-if="project" #footer>
            <BaseButton variant="secondary" :to="{ name: 'projects.edit', params: { id } }">
                <AppIcon name="pencil" :size="14" />
                Edit Project
            </BaseButton>
            <BaseButton variant="destructive" @click="isDeleteModalOpen = true">
                <AppIcon name="trash" :size="14" />
                Delete
            </BaseButton>
        </template>
    </BaseDrawer>
</template>
