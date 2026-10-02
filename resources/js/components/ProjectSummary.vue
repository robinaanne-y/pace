<script setup>
import { computed } from 'vue';
import AppIcon from './AppIcon.vue';

const props = defineProps({
    projects: { type: Array, required: true },
});

const cards = computed(() => {
    const countByStatus = (status) => props.projects.filter((project) => project.status === status).length;

    return [
        { label: 'Total Projects', count: props.projects.length, note: 'Across all clients', icon: 'folder', tone: 'total' },
        { label: 'In Progress', count: countByStatus('in_progress'), note: 'Currently being worked on', icon: 'activity', tone: 'progress' },
        { label: 'On Hold', count: countByStatus('on_hold'), note: 'Paused or waiting', icon: 'pause', tone: 'hold' },
        { label: 'Completed', count: countByStatus('completed'), note: 'Delivered to clients', icon: 'check', tone: 'complete' },
    ];
});
</script>

<template>
    <div class="summary-grid">
        <div v-for="card in cards" :key="card.label" class="surface summary-card">
            <div class="summary-top">
                {{ card.label }}
                <span class="summary-icon" :class="card.tone">
                    <AppIcon :name="card.icon" />
                </span>
            </div>
            <p class="summary-number">
                {{ card.count }}
                <span>{{ card.note }}</span>
            </p>
        </div>
    </div>
</template>
