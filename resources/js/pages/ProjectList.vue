<script setup>
import { computed, onMounted, ref } from 'vue';
import { listProjects } from '../api/projects';
import { filterAndSortProjects, SORT_OPTIONS } from '../projectFilters';
import AppIcon from '../components/AppIcon.vue';
import BaseButton from '../components/BaseButton.vue';
import DeleteProjectModal from '../components/DeleteProjectModal.vue';
import PageHeader from '../components/PageHeader.vue';
import ProjectListSkeleton from '../components/ProjectListSkeleton.vue';
import ProjectSummary from '../components/ProjectSummary.vue';
import ProjectTable from '../components/ProjectTable.vue';
import ProjectToolbar from '../components/ProjectToolbar.vue';

const projects = ref([]);
const isLoading = ref(true);
const loadError = ref('');
const projectToDelete = ref(null);
const isDeleteModalOpen = ref(false);
const search = ref('');
const status = ref('');
const priority = ref('');
const sort = ref('newest');

const visibleProjects = computed(() =>
    filterAndSortProjects(projects.value, { search: search.value, status: status.value, priority: priority.value, sort: sort.value }),
);
const isFiltered = computed(() => search.value.trim() !== '' || status.value !== '' || priority.value !== '');
const sortLabel = computed(() => SORT_OPTIONS.find((option) => option.value === sort.value).label);

function clearFilters() {
    search.value = '';
    status.value = '';
    priority.value = '';
}

function confirmDelete(project) {
    projectToDelete.value = project;
    isDeleteModalOpen.value = true;
}

function removeProject(id) {
    projects.value = projects.value.filter((project) => project.id !== id);
}

async function loadProjects() {
    isLoading.value = true;
    loadError.value = '';

    try {
        projects.value = await listProjects();
    } catch (error) {
        loadError.value = error.message;
    } finally {
        isLoading.value = false;
    }
}

onMounted(loadProjects);
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

    <ProjectListSkeleton v-if="isLoading" />

    <div v-else-if="loadError" class="surface state-panel" role="alert">
        <div class="empty-state">
            <div class="empty-icon error-icon">
                <AppIcon name="alert" :size="24" />
            </div>
            <h2>Unable to load projects.</h2>
            <p>{{ loadError }}</p>
            <BaseButton variant="secondary" @click="loadProjects">
                <AppIcon name="refresh" />
                Try Again
            </BaseButton>
        </div>
    </div>

    <template v-else>
        <ProjectSummary :projects="projects" />

        <section>
            <div class="section-heading">
                <h2>
                    All Projects
                    <span class="count-badge">{{ projects.length }}</span>
                </h2>
                <span class="section-note">Sorted by {{ sortLabel.toLowerCase() }}</span>
            </div>

            <div v-if="projects.length === 0" class="surface projects-panel">
                <div class="empty-state">
                    <div class="empty-icon">
                        <AppIcon name="folder" :size="24" />
                    </div>
                    <h2>No projects yet</h2>
                    <p>Create your first project to start tracking client work.</p>
                    <BaseButton :to="{ name: 'projects.create' }">
                        <AppIcon name="plus" />
                        New Project
                    </BaseButton>
                </div>
            </div>
            <div v-else class="surface projects-panel">
                <ProjectToolbar v-model:search="search" v-model:status="status" v-model:priority="priority" v-model:sort="sort" />
                <div v-if="isFiltered" class="results-bar" role="status">
                    <span>{{ visibleProjects.length }} of {{ projects.length }} projects match</span>
                    <button type="button" @click="clearFilters">
                        <AppIcon name="x" :size="12" />
                        Clear filters
                    </button>
                </div>
                <div v-if="visibleProjects.length === 0" class="empty-state">
                    <div class="empty-icon">
                        <AppIcon name="search" :size="24" />
                    </div>
                    <h2>No matching projects</h2>
                    <p>Try a different search term or clear the filters.</p>
                    <BaseButton variant="secondary" @click="clearFilters">Clear filters</BaseButton>
                </div>
                <ProjectTable v-else :projects="visibleProjects" :total="projects.length" @delete="confirmDelete" />
            </div>
        </section>

        <DeleteProjectModal v-if="projectToDelete" v-model:open="isDeleteModalOpen" :project="projectToDelete" @deleted="removeProject(projectToDelete.id)" />
    </template>

    <RouterView v-slot="{ Component, route }">
        <component :is="Component" :key="route.params.id" @deleted="removeProject" />
    </RouterView>
</template>
