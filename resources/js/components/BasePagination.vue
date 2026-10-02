<script setup>
import { computed } from 'vue';
import AppIcon from './AppIcon.vue';

const props = defineProps({
    pageCount: { type: Number, required: true },
});

const page = defineModel('page', { type: Number, required: true });

// Shows every page when there are few; otherwise the first, the last and the pages around the current one.
const items = computed(() => {
    const all = Array.from({ length: props.pageCount }, (_, index) => index + 1);

    if (props.pageCount <= 7) {
        return all;
    }

    const shown = all.filter((number) => number === 1 || number === props.pageCount || Math.abs(number - page.value) <= 1);

    return shown.flatMap((number, index) => (index > 0 && number - shown[index - 1] > 1 ? ['…', number] : [number]));
});
</script>

<template>
    <nav class="pagination" aria-label="Pagination">
        <button type="button" class="page-button" aria-label="Previous page" :disabled="page === 1" @click="page--">
            <AppIcon name="chevron-left" :size="14" />
        </button>
        <template v-for="(item, index) in items" :key="index">
            <span v-if="item === '…'" class="page-gap">…</span>
            <button
                v-else
                type="button"
                class="page-button"
                :class="{ active: item === page }"
                :aria-label="`Page ${item}`"
                :aria-current="item === page ? 'page' : undefined"
                @click="page = item"
            >
                {{ item }}
            </button>
        </template>
        <button type="button" class="page-button" aria-label="Next page" :disabled="page === pageCount" @click="page++">
            <AppIcon name="chevron-right" :size="14" />
        </button>
    </nav>
</template>
