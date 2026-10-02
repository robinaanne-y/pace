<script setup>
import { formatDate } from '../format';
import AppIcon from './AppIcon.vue';
import BasePagination from './BasePagination.vue';
import PriorityBadge from './PriorityBadge.vue';
import StatusBadge from './StatusBadge.vue';

defineProps({
    projects: { type: Array, required: true },
    total: { type: Number, required: true },
    firstPosition: { type: Number, required: true },
    pageCount: { type: Number, required: true },
});

defineEmits(['delete']);

const page = defineModel('page', { type: Number, required: true });
</script>

<template>
    <div class="table-wrap overflow-x-auto">
        <table>
            <thead>
                <tr>
                    <th class="project-column">PROJECT</th>
                    <th>CLIENT</th>
                    <th>STATUS</th>
                    <th>PRIORITY</th>
                    <th>START DATE</th>
                    <th>DUE DATE</th>
                    <th class="action-column sticky right-0 w-28 bg-[#fcfcfd]" aria-label="Actions"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="project in projects" :key="project.id" class="group">
                    <td>
                        <div class="project-cell">
                            <span class="project-symbol" :class="project.status.replaceAll('_', '-')">
                                <AppIcon name="folder" />
                            </span>
                            <div class="min-w-0">
                                <RouterLink :to="{ name: 'projects.show', params: { id: project.id } }" class="project-name">
                                    {{ project.project_name }}
                                </RouterLink>
                                <p v-if="project.description">{{ project.description }}</p>
                            </div>
                        </div>
                    </td>
                    <td class="client-cell">{{ project.client_name }}</td>
                    <td><StatusBadge :status="project.status" /></td>
                    <td><PriorityBadge :priority="project.priority" /></td>
                    <td class="date-cell">{{ formatDate(project.start_date) }}</td>
                    <td class="date-cell">{{ formatDate(project.due_date) }}</td>
                    <td class="sticky right-0 bg-white group-hover:bg-[#fafbff]">
                        <div class="flex justify-end gap-1">
                            <RouterLink :to="{ name: 'projects.show', params: { id: project.id } }" class="icon-button" title="View" :aria-label="`View ${project.project_name}`">
                                <AppIcon name="eye" />
                            </RouterLink>
                            <RouterLink :to="{ name: 'projects.edit', params: { id: project.id } }" class="icon-button" title="Edit" :aria-label="`Edit ${project.project_name}`">
                                <AppIcon name="pencil" />
                            </RouterLink>
                            <button type="button" class="icon-button" title="Delete" :aria-label="`Delete ${project.project_name}`" @click="$emit('delete', project)">
                                <AppIcon name="trash" />
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="mobile-projects">
        <article v-for="project in projects" :key="project.id" class="mobile-project-card">
            <div class="mobile-card-heading">
                <div>
                    <RouterLink :to="{ name: 'projects.show', params: { id: project.id } }" class="project-name">
                        {{ project.project_name }}
                    </RouterLink>
                    <p>{{ project.client_name }}</p>
                </div>
                <div class="flex shrink-0">
                    <RouterLink :to="{ name: 'projects.show', params: { id: project.id } }" class="icon-button" title="View" :aria-label="`View ${project.project_name}`">
                        <AppIcon name="eye" />
                    </RouterLink>
                    <RouterLink :to="{ name: 'projects.edit', params: { id: project.id } }" class="icon-button" title="Edit" :aria-label="`Edit ${project.project_name}`">
                        <AppIcon name="pencil" />
                    </RouterLink>
                    <button type="button" class="icon-button" title="Delete" :aria-label="`Delete ${project.project_name}`" @click="$emit('delete', project)">
                        <AppIcon name="trash" />
                    </button>
                </div>
            </div>
            <p v-if="project.description" class="mobile-description">{{ project.description }}</p>
            <div class="mobile-badges">
                <StatusBadge :status="project.status" />
                <PriorityBadge :priority="project.priority" />
            </div>
            <div class="mobile-dates">
                <span>Start date <strong>{{ formatDate(project.start_date) }}</strong></span>
                <span>Due date <strong>{{ formatDate(project.due_date) }}</strong></span>
            </div>
        </article>
    </div>

    <div class="table-footer">
        <span>
            Showing <strong>{{ firstPosition }}–{{ firstPosition + projects.length - 1 }}</strong> of {{ total }} {{ total === 1 ? 'project' : 'projects' }}
        </span>
        <BasePagination v-if="pageCount > 1" v-model:page="page" :page-count="pageCount" />
    </div>
</template>
