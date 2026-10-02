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
    pause: ['M6 4h4v16H6z', 'M14 4h4v16h-4z'],
    calendar: ['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z'],
    pencil: ['M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'],
    trash: ['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'],
    refresh: ['M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', 'M8 16H3v5'],
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
