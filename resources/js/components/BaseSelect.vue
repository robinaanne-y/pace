<script setup>
import { useId } from 'vue';

defineOptions({ inheritAttrs: false });

defineProps({
    label: { type: String, required: true },
    options: { type: Array, required: true },
    placeholder: { type: String, default: '' },
    required: { type: Boolean, default: false },
    error: { type: String, default: '' },
});

const model = defineModel({ type: String, default: '' });
const id = useId();
</script>

<template>
    <div class="field">
        <label :for="id">
            {{ label }}
            <span v-if="required" class="required" aria-hidden="true">*</span>
        </label>
        <select
            :id="id"
            v-model="model"
            :required="required"
            :aria-invalid="error ? 'true' : undefined"
            :aria-describedby="error ? `${id}-error` : undefined"
            v-bind="$attrs"
        >
            <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
            <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <p v-if="error" :id="`${id}-error`" class="field-error">{{ error }}</p>
    </div>
</template>
