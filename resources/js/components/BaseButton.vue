<script setup>
import { RouterLink } from 'vue-router';

defineProps({
    variant: { type: String, default: 'primary', validator: (variant) => ['primary', 'secondary', 'destructive'].includes(variant) },
    type: { type: String, default: 'button' },
    to: { type: [String, Object], default: null },
});
</script>

<template>
    <component :is="to ? RouterLink : 'button'" :to="to ?? undefined" :type="to ? undefined : type" class="button" :class="variant">
        <slot />
    </component>
</template>
