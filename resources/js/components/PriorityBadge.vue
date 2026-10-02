<script setup>
import { optionLabel, PRIORITY_OPTIONS } from '../constants';

defineProps({
    priority: { type: String, required: true },
});
</script>

<template>
    <span class="priority" :class="priority">
        <span class="dot" />
        {{ optionLabel(PRIORITY_OPTIONS, priority) }}
    </span>
</template>
