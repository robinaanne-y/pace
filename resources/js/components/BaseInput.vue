<script setup>
import { useId } from 'vue';

defineOptions({ inheritAttrs: false });

defineProps({
    label: { type: String, required: true },
    type: { type: String, default: 'text' },
    multiline: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    optional: { type: Boolean, default: false },
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
            <span v-if="optional" class="optional">(optional)</span>
        </label>
        <textarea
            v-if="multiline"
            :id="id"
            v-model="model"
            :required="required"
            :aria-invalid="error ? 'true' : undefined"
            :aria-describedby="error ? `${id}-error` : undefined"
            v-bind="$attrs"
        />
        <input
            v-else
            :id="id"
            v-model="model"
            :type="type"
            :required="required"
            :aria-invalid="error ? 'true' : undefined"
            :aria-describedby="error ? `${id}-error` : undefined"
            v-bind="$attrs"
        />
        <p v-if="error" :id="`${id}-error`" class="field-error">{{ error }}</p>
    </div>
</template>
