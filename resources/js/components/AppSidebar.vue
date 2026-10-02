<script setup>
import { useRoute } from 'vue-router';
import AppIcon from './AppIcon.vue';

defineProps({
    open: { type: Boolean, default: false },
});

const route = useRoute();
</script>

<template>
    <aside id="sidebar" class="sidebar" :class="{ 'mobile-open': open }">
        <RouterLink :to="{ name: 'projects.index' }" class="brand">
            <span class="brand-icon">
                <AppIcon name="activity" :size="18" :stroke-width="2.2" />
            </span>
            Pace
        </RouterLink>

        <nav class="sidebar-nav" aria-label="Main">
            <p class="nav-label">WORKSPACE</p>
            <RouterLink :to="{ name: 'projects.index' }" class="nav-item" :class="{ active: route.path.startsWith('/projects') }">
                <AppIcon name="folder" :size="18" />
                Projects
            </RouterLink>
        </nav>
    </aside>
</template>
