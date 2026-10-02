<script setup>
import { useTemplateRef, watch } from 'vue';
import { useToast } from '../composables/useToast';
import AppIcon from './AppIcon.vue';

const { toast, dismiss } = useToast();
const element = useTemplateRef('element');

// Showing it as a popover puts each new toast above any open modal or side panel.
watch(
    toast,
    () => {
        if (!element.value) {
            return;
        }
        if (element.value.matches(':popover-open')) {
            element.value.hidePopover();
        }
        element.value.showPopover();
    },
    { flush: 'post' },
);
</script>

<template>
    <div v-if="toast" ref="element" popover="manual" class="toast" :class="{ 'error-toast': toast.type === 'error' }" :role="toast.type === 'error' ? 'alert' : 'status'">
        <span class="toast-icon">
            <AppIcon :name="toast.type === 'error' ? 'alert' : 'check'" :size="14" :stroke-width="2.5" />
        </span>
        {{ toast.message }}
        <button type="button" class="icon-button" aria-label="Dismiss notification" @click="dismiss">
            <AppIcon name="x" :size="14" />
        </button>
    </div>
</template>
