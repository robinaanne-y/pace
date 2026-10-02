<script setup>
const paths = {
    activity: ['M22 12h-4l-3 9L9 3l-3 9H2'],
    folder: ['M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'],
    menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
    plus: ['M5 12h14', 'M12 5v14'],
    'arrow-left': ['m12 19-7-7 7-7', 'M19 12H5'],
    x: ['M18 6 6 18', 'm6 6 12 12'],
    check: ['M20 6 9 17l-5-5'],
    alert: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 8v4', 'M12 16h.01'],
};

defineProps({
    name: { type: String, required: true },
    size: { type: Number, default: 16 },
    strokeWidth: { type: Number, default: 2 },
});
</script>

<template>
    <svg
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path v-for="path in paths[name]" :key="path" :d="path" />
    </svg>
</template>
