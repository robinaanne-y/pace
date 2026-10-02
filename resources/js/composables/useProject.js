import { onMounted, ref } from 'vue';
import { getProject } from '../api/projects';

export function useProject(id) {
    const project = ref(null);
    const isLoading = ref(true);
    const isNotFound = ref(false);
    const loadError = ref('');

    async function load() {
        isLoading.value = true;
        isNotFound.value = false;
        loadError.value = '';

        try {
            project.value = await getProject(id);
        } catch (error) {
            isNotFound.value = error.status === 404;
            loadError.value = error.message;
        } finally {
            isLoading.value = false;
        }
    }

    onMounted(load);

    return { project, isLoading, isNotFound, loadError, load };
}
