<template>
  <div>
    <!-- plot area -->
    <div class="relative" :style="{ height: height + 'px' }">
      <!-- gridlines -->
      <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
        <div v-for="i in 5" :key="i" class="border-t border-dashed border-gray-100 dark:border-gray-700/60"></div>
      </div>

      <!-- bars -->
      <div class="relative h-full flex items-end gap-3 px-1">
        <div v-for="(it, i) in items" :key="i" class="relative flex-1 h-full group">
          <!-- value label -->
          <span
            class="absolute left-1/2 -translate-x-1/2 text-xs font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap tabular-nums transition-all duration-700"
            :style="{ bottom: `calc(${pct(it.value)}% + 6px)` }">
            {{ fmt(it.value) }}{{ unit }}
          </span>

          <!-- bar -->
          <div
            class="absolute bottom-0 left-1/2 -translate-x-1/2 w-full rounded-t-lg transition-all duration-1000 ease-out group-hover:brightness-110"
            :style="{
              height: pct(it.value) + '%',
              maxWidth: barWidth + 'px',
              minHeight: it.value > 0 ? '4px' : '0px',
              background: `linear-gradient(180deg, ${it.color} 0%, ${it.color}B3 100%)`,
            }">
            <title>{{ it.label }}: {{ fmt(it.value) }}{{ unit }}</title>
          </div>
        </div>
      </div>
    </div>

    <!-- x axis -->
    <div class="flex gap-3 px-1 pt-2 border-t border-gray-100 dark:border-gray-700">
      <div v-for="(it, i) in items" :key="i" class="flex-1 text-center">
        <span class="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-tight block">{{ it.label }}</span>
      </div>
    </div>

    <!-- legend -->
    <div v-if="showLegend" class="mt-3 space-y-1.5">
      <div v-for="(it, i) in items" :key="i"
        class="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
        <span class="w-2.5 h-2.5 rounded-sm flex-shrink-0" :style="{ backgroundColor: it.color }"></span>
        <span class="text-gray-500 dark:text-gray-400 flex-1 truncate">{{ it.label }}</span>
        <span class="font-bold text-gray-700 dark:text-gray-200 tabular-nums">{{ fmt(it.value) }}{{ unit }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Item { label: string; value: number; color: string }

const props = withDefaults(defineProps<{
  items: Item[]
  unit?: string
  height?: number
  barWidth?: number
  showLegend?: boolean
  max?: number
}>(), {
  unit: '',
  height: 190,
  barWidth: 70,
  showLegend: false,
})

// bar max 88% supaya label nilai di atasnya tidak terpotong
const maxValue = computed(() => props.max ?? Math.max(...props.items.map(i => i.value), 1))
const pct = (v: number) => (v / maxValue.value) * 88

const fmt = (n: number) => {
  if (n % 1 === 0) return n.toLocaleString('id-ID')
  return n.toFixed(2)
}
</script>
