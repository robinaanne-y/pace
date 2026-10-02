<script setup>
import { formatDate } from '../format';
import AppIcon from './AppIcon.vue';
import PriorityBadge from './PriorityBadge.vue';
import StatusBadge from './StatusBadge.vue';

defineProps({
    projects: { type: Array, required: true },
});
</script>

<template>
    <div class="surface projects-panel">
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th class="project-column">PROJECT</th>
                        <th>CLIENT</th>
                        <th>STATUS</th>
                        <th>PRIORITY</th>
                        <th>START DATE</th>
                        <th>DUE DATE</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="project in projects" :key="project.id">
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
                Showing <strong>{{ projects.length }}</strong> {{ projects.length === 1 ? 'project' : 'projects' }}
            </span>
        </div>
    </div>
</template>
