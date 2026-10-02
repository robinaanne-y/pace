<script setup>
import { onMounted, ref } from 'vue';
import { listProjects } from '../api/projects';
import AppIcon from '../components/AppIcon.vue';
import BaseButton from '../components/BaseButton.vue';
import PageHeader from '../components/PageHeader.vue';
import ProjectListSkeleton from '../components/ProjectListSkeleton.vue';
import ProjectSummary from '../components/ProjectSummary.vue';
import ProjectTable from '../components/ProjectTable.vue';

const projects = ref([]);
const isLoading = ref(true);
const loadError = ref('');

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
                <span class="section-note">Newest first</span>
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
            <ProjectTable v-else :projects="projects" />
        </section>
    </template>
</template>
