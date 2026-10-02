<script setup>
import { ref } from 'vue';
import { deleteProject } from '../api/projects';
import { useToast } from '../composables/useToast';
import AppIcon from './AppIcon.vue';
import BaseButton from './BaseButton.vue';
import BaseModal from './BaseModal.vue';

const props = defineProps({
    project: { type: Object, required: true },
});

const emit = defineEmits(['deleted']);

const open = defineModel('open', { type: Boolean, default: false });
const toast = useToast();
const isDeleting = ref(false);

async function confirm() {
    isDeleting.value = true;

    try {
        await deleteProject(props.project.id);
        open.value = false;
        toast.success('Project deleted successfully.');
        emit('deleted');
    } catch (error) {
        open.value = false;

        if (error.status === 404) {
            toast.error('This project has already been deleted.');
            emit('deleted');
        } else {
            toast.error(error.message);
        }
    } finally {
        isDeleting.value = false;
    }
}
</script>

<template>
    <BaseModal v-model:open="open" title="Delete project?">
        <template #icon>
            <div class="delete-icon">
                <AppIcon name="trash" :size="22" />
            </div>
        </template>
        <p>
            This will permanently delete <strong>{{ project.project_name }}</strong>. This action cannot be undone.
        </p>
        <template #actions>
            <BaseButton variant="secondary" :disabled="isDeleting" @click="open = false">Cancel</BaseButton>
            <BaseButton variant="destructive" :disabled="isDeleting" @click="confirm">
                {{ isDeleting ? 'Deleting…' : 'Delete Project' }}
            </BaseButton>
        </template>
    </BaseModal>
</template>
