<script setup>
import BaseButton from '../components/BaseButton.vue';
</script>

<template>
    <div class="surface empty-state">
        <h2>Page not found</h2>
        <p>The page you are looking for does not exist.</p>
        <BaseButton :to="{ name: 'projects.index' }">Back to projects</BaseButton>
    </div>
</template>
