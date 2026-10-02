<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isMobileMenuOpen = ref(false);

watch(
    () => route.fullPath,
    () => {
        isMobileMenuOpen.value = false;
    },
);
</script>

<template>
    <div class="app-shell">
        <aside id="sidebar" class="sidebar" :class="{ 'mobile-open': isMobileMenuOpen }">
            <RouterLink :to="{ name: 'projects.index' }" class="brand">
                <span class="brand-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                </span>
                Pace
            </RouterLink>

            <nav class="sidebar-nav" aria-label="Main">
                <p class="nav-label">WORKSPACE</p>
                <RouterLink :to="{ name: 'projects.index' }" class="nav-item" :class="{ active: route.path.startsWith('/projects') }">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                    </svg>
                    Projects
                </RouterLink>
            </nav>
        </aside>

        <div class="main-shell">
            <header class="topbar">
                <div class="breadcrumb">
                    <button
                        type="button"
                        class="icon-button mobile-menu"
                        aria-controls="sidebar"
                        :aria-expanded="isMobileMenuOpen"
                        aria-label="Toggle navigation"
                        @click="isMobileMenuOpen = !isMobileMenuOpen"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span class="mobile-brand">Pace</span>
                    <span class="desktop-breadcrumb">
                        <span>Workspace</span>
                        <span class="breadcrumb-slash">/</span>
                    </span>
                    <span class="breadcrumb-current">{{ route.meta.title }}</span>
                </div>
            </header>

            <main class="main-content">
                <slot />
            </main>
        </div>
    </div>
</template>
