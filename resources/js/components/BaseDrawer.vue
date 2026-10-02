<script setup>
import { onMounted, useId, useTemplateRef } from 'vue';
import AppIcon from './AppIcon.vue';

const emit = defineEmits(['close']);

const dialog = useTemplateRef('dialog');
const headerId = useId();

function closeOnBackdropClick(event) {
    if (event.target === dialog.value) {
        emit('close');
    }
}

onMounted(() => dialog.value.showModal());
</script>

<template>
    <dialog ref="dialog" class="drawer" :aria-labelledby="headerId" @close="$emit('close')" @click="closeOnBackdropClick">
        <header class="drawer-header">
            <div :id="headerId" class="min-w-0">
                <slot name="header" />
            </div>
            <button type="button" class="icon-button" aria-label="Close" @click="$emit('close')">
                <AppIcon name="x" />
            </button>
        </header>
        <div class="drawer-body">
            <slot />
        </div>
        <div v-if="$slots.footer" class="form-actions">
            <slot name="footer" />
        </div>
    </dialog>
</template>
