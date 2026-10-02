import { readonly, ref } from 'vue';

const DISMISS_AFTER_MS = 4000;

const toast = ref(null);
let dismissTimer = null;

function show(message, type) {
    clearTimeout(dismissTimer);
    toast.value = { message, type };
    dismissTimer = setTimeout(dismiss, DISMISS_AFTER_MS);
}

function dismiss() {
    clearTimeout(dismissTimer);
    toast.value = null;
}

export function useToast() {
    return {
        toast: readonly(toast),
        success: (message) => show(message, 'success'),
        error: (message) => show(message, 'error'),
        dismiss,
    };
}
