<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex flex-col">
    <div class="flex items-start justify-between gap-3 mb-1">
      <div class="min-w-0">
        <h3 class="font-semibold text-gray-800 dark:text-white text-sm">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-gray-400 mt-0.5 italic truncate">"{{ subtitle }}"</p>
      </div>
      <span v-if="badge"
        class="text-[11px] font-medium px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 flex-shrink-0 whitespace-nowrap">
        {{ badge }}
      </span>
    </div>

    <div class="flex-1 flex flex-col justify-center pt-3">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  badge?: string
}>()
</script>
