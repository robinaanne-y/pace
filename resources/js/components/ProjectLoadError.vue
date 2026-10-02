<script setup>
import AppIcon from './AppIcon.vue';
import BaseButton from './BaseButton.vue';

defineProps({
    notFound: { type: Boolean, default: false },
    message: { type: String, default: '' },
});

defineEmits(['retry']);
</script>

<template>
    <div class="surface state-panel detail-card" role="alert">
        <div v-if="notFound" class="empty-state">
            <div class="empty-icon">
                <AppIcon name="folder" :size="24" />
            </div>
            <h2>Project not found</h2>
            <p>This project does not exist or has been deleted.</p>
            <BaseButton :to="{ name: 'projects.index' }">Back to projects</BaseButton>
        </div>
        <div v-else class="empty-state">
            <div class="empty-icon error-icon">
                <AppIcon name="alert" :size="24" />
            </div>
            <h2>Unable to load project.</h2>
            <p>{{ message }}</p>
            <BaseButton variant="secondary" @click="$emit('retry')">
                <AppIcon name="refresh" />
                Try Again
            </BaseButton>
        </div>
    </div>
</template>
