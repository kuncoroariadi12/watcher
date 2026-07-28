<template>
  <div class="flex flex-col items-center">
    <div class="relative" :style="{ width: size + 'px', height: size + 'px' }">
      <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="-rotate-90">
        <!-- track -->
        <circle
          :cx="c" :cy="c" :r="r"
          fill="none"
          :stroke-width="thickness"
          class="stroke-gray-100 dark:stroke-gray-700"
        />
        <!-- segments -->
        <circle
          v-for="(seg, i) in segments" :key="i"
          :cx="c" :cy="c" :r="r"
          fill="none"
          :stroke="seg.color"
          :stroke-width="thickness"
          stroke-linecap="round"
          :stroke-dasharray="`${seg.len} ${circumference}`"
          :stroke-dashoffset="-seg.offset"
          class="transition-all duration-1000 ease-out"
        >
          <title>{{ seg.label }}: {{ fmt(seg.value) }}{{ legendUnit ?? unit }}</title>
        </circle>
      </svg>

      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-2xl font-black text-gray-800 dark:text-white leading-none tracking-tight">
          {{ centerValue }}<span class="text-sm font-bold text-gray-400">{{ unit }}</span>
        </span>
        <span class="text-[10px] text-gray-400 mt-1 font-medium uppercase tracking-wide">{{ centerLabel }}</span>
      </div>
    </div>

    <!-- legend -->
    <div class="w-full mt-4 space-y-1.5">
      <div v-for="(s, i) in series" :key="i"
        class="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
        <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: s.color }"></span>
        <span class="text-gray-500 dark:text-gray-400 flex-1 truncate">{{ s.label }}</span>
        <span class="font-bold text-gray-700 dark:text-gray-200 tabular-nums">{{ fmt(s.value) }}{{ legendUnit ?? unit }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Serie { label: string; value: number; color: string }

const props = withDefaults(defineProps<{
  series: Serie[]
  centerValue: string | number
  centerLabel: string
  unit?: string
  legendUnit?: string   // dipakai kalau satuan legend beda dgn angka tengah
  size?: number
  thickness?: number
}>(), {
  unit: '%',
  size: 150,
  thickness: 16,
})

const c = computed(() => props.size / 2)
const r = computed(() => props.size / 2 - props.thickness / 2 - 2)
const circumference = computed(() => 2 * Math.PI * r.value)

const total = computed(() => props.series.reduce((s, x) => s + x.value, 0) || 1)

const segments = computed(() => {
  let offset = 0
  return props.series
    .filter(s => s.value > 0)
    .map(s => {
      const len = (s.value / total.value) * circumference.value
      const seg = { ...s, len, offset }
      offset += len
      return seg
    })
})

const fmt = (n: number) => (n % 1 === 0 ? n.toString() : n.toFixed(2))
</script>
