<script setup>
import { optionLabel, STATUS_OPTIONS } from '../constants';

defineProps({
    status: { type: String, required: true },
});
</script>

<template>
    <span class="badge" :class="status.replaceAll('_', '-')">
        <span class="dot" />
        {{ optionLabel(STATUS_OPTIONS, status) }}
    </span>
</template>
