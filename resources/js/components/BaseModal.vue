<script setup>
import { onMounted, useId, useTemplateRef, watch } from 'vue';

defineProps({
    title: { type: String, required: true },
});

const open = defineModel('open', { type: Boolean, default: false });
const dialog = useTemplateRef('dialog');
const titleId = useId();

function sync() {
    if (open.value && !dialog.value.open) {
        dialog.value.showModal();
    } else if (!open.value && dialog.value.open) {
        dialog.value.close();
    }
}

function closeOnBackdropClick(event) {
    if (event.target === dialog.value) {
        open.value = false;
    }
}

onMounted(sync);
watch(open, sync);
</script>

<template>
    <dialog ref="dialog" class="delete-dialog" :aria-labelledby="titleId" @close="open = false" @click="closeOnBackdropClick">
        <div class="modal-content">
            <slot name="icon" />
            <h2 :id="titleId">{{ title }}</h2>
            <slot />
            <div class="form-actions">
                <slot name="actions" />
            </div>
        </div>
    </dialog>
</template>
