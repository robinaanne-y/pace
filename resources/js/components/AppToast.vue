<script setup>
import { useToast } from '../composables/useToast';
import AppIcon from './AppIcon.vue';

const { toast, dismiss } = useToast();
</script>

<template>
    <div v-if="toast" class="toast" :class="{ 'error-toast': toast.type === 'error' }" :role="toast.type === 'error' ? 'alert' : 'status'">
        <span class="toast-icon">
            <AppIcon :name="toast.type === 'error' ? 'alert' : 'check'" :size="14" :stroke-width="2.5" />
        </span>
        {{ toast.message }}
        <button type="button" class="icon-button" aria-label="Dismiss notification" @click="dismiss">
            <AppIcon name="x" :size="14" />
        </button>
    </div>
</template>
