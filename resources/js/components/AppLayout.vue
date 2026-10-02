<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppIcon from './AppIcon.vue';
import AppSidebar from './AppSidebar.vue';
import AppToast from './AppToast.vue';

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
        <AppSidebar :open="isMobileMenuOpen" />

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
                        <AppIcon name="menu" :size="20" />
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

        <AppToast />
    </div>
</template>
