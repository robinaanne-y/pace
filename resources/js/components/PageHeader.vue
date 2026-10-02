<script setup>
defineProps({
    title: { type: String, required: true },
    eyebrow: { type: String, default: '' },
    description: { type: String, default: '' },
});
</script>

<template>
    <div class="page-heading">
        <div>
            <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
            <h1>{{ title }}</h1>
            <p v-if="description">{{ description }}</p>
        </div>
        <slot name="actions" />
    </div>
</template>
