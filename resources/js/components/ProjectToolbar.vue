<script setup>
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../constants';
import { SORT_OPTIONS } from '../projectFilters';
import AppIcon from './AppIcon.vue';
import FilterDropdown from './FilterDropdown.vue';

const search = defineModel('search', { type: String, default: '' });
const status = defineModel('status', { type: String, default: '' });
const priority = defineModel('priority', { type: String, default: '' });
const sort = defineModel('sort', { type: String, default: 'newest' });

const statusOptions = [{ value: '', label: 'All statuses' }, ...STATUS_OPTIONS];
const priorityOptions = [{ value: '', label: 'All priorities' }, ...PRIORITY_OPTIONS];
</script>

<template>
    <div class="toolbar">
        <label class="search-field">
            <AppIcon name="search" />
            <input v-model="search" type="search" placeholder="Search projects..." aria-label="Search projects" />
        </label>
        <div class="filters">
            <FilterDropdown v-model="status" label="Status" :options="statusOptions" />
            <FilterDropdown v-model="priority" label="Priority" :options="priorityOptions" />
            <span class="filter-divider" />
            <FilterDropdown v-model="sort" label="Sort" :options="SORT_OPTIONS" default-value="newest" selection-prefix="Sort: " />
        </div>
    </div>
</template>
