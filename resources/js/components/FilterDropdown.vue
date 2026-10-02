<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import AppIcon from './AppIcon.vue';

const props = defineProps({
    label: { type: String, required: true },
    options: { type: Array, required: true },
    defaultValue: { type: String, default: '' },
    selectionPrefix: { type: String, default: '' },
});

const model = defineModel({ type: String, default: '' });
const root = useTemplateRef('root');
const isOpen = ref(false);

const isChanged = computed(() => model.value !== props.defaultValue);
const buttonText = computed(() => {
    if (!isChanged.value) {
        return props.label;
    }

    return props.selectionPrefix + props.options.find((option) => option.value === model.value)?.label;
});

function select(value) {
    model.value = value;
    isOpen.value = false;
}

function closeWhenOutside(event) {
    if (!root.value.contains(event.target)) {
        isOpen.value = false;
    }
}

function closeWhenFocusLeaves(event) {
    if (event.relatedTarget && !root.value.contains(event.relatedTarget)) {
        isOpen.value = false;
    }
}

onMounted(() => document.addEventListener('pointerdown', closeWhenOutside));
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeWhenOutside));
</script>

<template>
    <div ref="root" class="dropdown" @focusout="closeWhenFocusLeaves" @keydown.esc="isOpen = false">
        <button type="button" class="filter-button" :class="{ 'is-filtered': isChanged }" aria-haspopup="menu" :aria-expanded="isOpen" @click="isOpen = !isOpen">
            {{ buttonText }}
            <AppIcon name="chevron-down" :size="14" />
        </button>
        <div v-if="isOpen" class="dropdown-menu" role="menu" :aria-label="label">
            <button
                v-for="option in options"
                :key="option.value"
                type="button"
                role="menuitemradio"
                :aria-checked="option.value === model"
                :class="{ selected: option.value === model }"
                @click="select(option.value)"
            >
                {{ option.label }}
                <AppIcon v-if="option.value === model" name="check" :size="14" />
            </button>
        </div>
    </div>
</template>
