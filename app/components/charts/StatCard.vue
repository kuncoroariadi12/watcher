<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 relative overflow-hidden group">
    <!-- accent glow -->
    <div class="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-[0.07] group-hover:opacity-[0.12] transition"
      :style="{ backgroundColor: color }"></div>

    <div class="flex items-start justify-between gap-2 relative">
      <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        :style="{ backgroundColor: color + '1A' }">
        <svg class="w-5 h-5" :style="{ color }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath" />
        </svg>
      </div>

      <span v-if="trend !== undefined"
        class="text-[11px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5"
        :class="trend >= 0
          ? 'text-green-600 bg-green-50 dark:bg-green-900/25 dark:text-green-400'
          : 'text-red-500 bg-red-50 dark:bg-red-900/25 dark:text-red-400'">
        <svg class="w-3 h-3" :class="{ 'rotate-180': trend < 0 }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
        </svg>
        {{ Math.abs(trend) }}%
      </span>
    </div>

    <p class="text-2xl font-bold text-gray-800 dark:text-white mt-3 leading-none tracking-tight">
      {{ value }}<span v-if="suffix" class="text-base font-semibold text-gray-400 ml-0.5">{{ suffix }}</span>
    </p>
    <p class="text-xs text-gray-400 mt-1.5">{{ label }}</p>

    <!-- mini bar -->
    <div v-if="bar !== undefined" class="mt-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
      <div class="h-full rounded-full transition-all duration-1000"
        :style="{ width: Math.min(bar, 100) + '%', backgroundColor: color }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  suffix?: string
  color: string
  iconPath: string
  trend?: number
  bar?: number
}>()
</script>
