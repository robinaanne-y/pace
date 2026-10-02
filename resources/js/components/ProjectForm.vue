<script setup>
import { computed, nextTick, reactive, ref, useTemplateRef } from 'vue';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../constants';
import AppIcon from './AppIcon.vue';
import BaseButton from './BaseButton.vue';
import BaseInput from './BaseInput.vue';
import BaseSelect from './BaseSelect.vue';

const props = defineProps({
    project: { type: Object, default: null },
    serverErrors: { type: Object, default: () => ({}) },
    isSubmitting: { type: Boolean, default: false },
    submitLabel: { type: String, required: true },
});

const emit = defineEmits(['submit', 'cancel']);

const form = useTemplateRef('form');
const fields = reactive({
    client_name: props.project?.client_name ?? '',
    project_name: props.project?.project_name ?? '',
    description: props.project?.description ?? '',
    status: props.project?.status ?? 'planning',
    priority: props.project?.priority ?? 'medium',
    start_date: props.project?.start_date ?? '',
    due_date: props.project?.due_date ?? '',
});
const clientErrors = ref({});

const errors = computed(() => {
    if (Object.keys(clientErrors.value).length > 0) {
        return clientErrors.value;
    }

    return Object.fromEntries(Object.entries(props.serverErrors).map(([field, messages]) => [field, messages[0]]));
});

function validate() {
    const found = {};

    if (!fields.client_name.trim()) {
        found.client_name = 'Client name is required.';
    }
    if (!fields.project_name.trim()) {
        found.project_name = 'Project name is required.';
    }
    if (!fields.status) {
        found.status = 'Status is required.';
    }
    if (!fields.priority) {
        found.priority = 'Priority is required.';
    }
    if (fields.start_date && fields.due_date && fields.due_date < fields.start_date) {
        found.due_date = 'Due date cannot be earlier than the start date.';
    }

    return found;
}

async function submit() {
    if (props.isSubmitting) {
        return;
    }

    clientErrors.value = validate();

    if (Object.keys(clientErrors.value).length > 0) {
        await nextTick();
        form.value.querySelector('[aria-invalid="true"]')?.focus();

        return;
    }

    emit('submit', {
        client_name: fields.client_name.trim(),
        project_name: fields.project_name.trim(),
        description: fields.description.trim() || null,
        status: fields.status,
        priority: fields.priority,
        start_date: fields.start_date || null,
        due_date: fields.due_date || null,
    });
}
</script>

<template>
    <form ref="form" class="surface project-form" novalidate @submit.prevent="submit">
        <div class="form-section-heading">
            <AppIcon name="folder" :size="18" />
            <h2>Project details</h2>
        </div>

        <div class="form-fields">
            <div class="field-grid">
                <BaseInput v-model="fields.project_name" label="Project name" required maxlength="255" placeholder="e.g. Website redesign" :error="errors.project_name" />
                <BaseInput v-model="fields.client_name" label="Client name" required maxlength="255" placeholder="e.g. Acme Corporation" :error="errors.client_name" />
            </div>
            <BaseInput v-model="fields.description" label="Description" optional multiline maxlength="5000" placeholder="What is this project about?" :error="errors.description" />
            <div class="field-grid">
                <BaseSelect v-model="fields.status" label="Status" required :options="STATUS_OPTIONS" :error="errors.status" />
                <BaseSelect v-model="fields.priority" label="Priority" required :options="PRIORITY_OPTIONS" :error="errors.priority" />
            </div>
            <div class="field-grid">
                <BaseInput v-model="fields.start_date" label="Start date" type="date" optional :error="errors.start_date" />
                <BaseInput v-model="fields.due_date" label="Due date" type="date" optional :error="errors.due_date" />
            </div>
        </div>

        <div class="form-actions">
            <BaseButton variant="secondary" @click="$emit('cancel')">Cancel</BaseButton>
            <BaseButton type="submit" :disabled="isSubmitting">{{ isSubmitting ? 'Saving…' : submitLabel }}</BaseButton>
        </div>
    </form>
</template>
