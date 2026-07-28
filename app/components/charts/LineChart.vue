<template>
  <div class="relative w-full">
    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto block">
      <defs>
        <linearGradient :id="gid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.28" />
          <stop offset="100%" :stop-color="color" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- gridlines + y labels -->
      <g>
        <template v-for="(t, i) in ticks" :key="i">
          <line :x1="PAD_L" :y1="yOf(t)" :x2="W - PAD_R" :y2="yOf(t)"
            class="stroke-gray-100 dark:stroke-gray-700/70" stroke-width="1" stroke-dasharray="3 4" />
          <text :x="PAD_L - 8" :y="yOf(t) + 4" text-anchor="end"
            class="fill-gray-400 text-[11px]" style="font-size:11px">{{ t }}</text>
        </template>
      </g>

      <!-- area + line -->
      <path :d="areaPath" :fill="`url(#${gid})`" />
      <path :d="linePath" fill="none" :stroke="color" stroke-width="2.5"
        stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />

      <!-- points -->
      <circle v-for="(v, i) in values" :key="'p' + i"
        :cx="xOf(i)" :cy="yOf(v)" :r="hoverIdx === i ? 5 : 0"
        :fill="color" stroke="#fff" stroke-width="2" class="transition-all" />

      <!-- hover guide -->
      <line v-if="hoverIdx !== null" :x1="xOf(hoverIdx)" :y1="PAD_T" :x2="xOf(hoverIdx)" :y2="H - PAD_B"
        :stroke="color" stroke-width="1" stroke-dasharray="3 3" opacity="0.5" />

      <!-- hit areas -->
      <rect v-for="(v, i) in values" :key="'h' + i"
        :x="xOf(i) - slotW / 2" :y="PAD_T" :width="slotW" :height="H - PAD_T - PAD_B"
        fill="transparent" @mouseenter="hoverIdx = i" @mouseleave="hoverIdx = null" />

      <!-- x labels -->
      <text v-for="(l, i) in labels" :key="'x' + i"
        :x="xOf(i)" :y="H - 6" text-anchor="middle"
        :class="hoverIdx === i ? 'fill-gray-700 dark:fill-gray-200 font-bold' : 'fill-gray-400'"
        style="font-size:10px">{{ l }}</text>
    </svg>

    <!-- tooltip -->
    <div v-if="hoverIdx !== null"
      class="absolute -translate-x-1/2 -translate-y-full pointer-events-none bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap z-10"
      :style="{ left: (xOf(hoverIdx) / W * 100) + '%', top: `calc(${(yOf(values[hoverIdx]) / H * 100).toFixed(2)}% - 8px)` }">
      <span class="text-gray-300">{{ xLabel }} {{ labels[hoverIdx] }} · </span>
      <span class="font-bold">{{ values[hoverIdx].toFixed(1) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  labels: (string | number)[]
  values: number[]
  color?: string
  xLabel?: string
}>(), {
  color: '#F03131',
  xLabel: 'W',
})

const gid = `lg-${Math.random().toString(36).slice(2, 9)}`

const W = 1000
const H = 300
const PAD_L = 42
const PAD_R = 12
const PAD_T = 16
const PAD_B = 26

const hoverIdx = ref<number | null>(null)

const maxV = computed(() => {
  const m = Math.max(...props.values, 1)
  const step = Math.pow(10, Math.floor(Math.log10(m))) / 2
  return Math.ceil(m / step) * step
})

const ticks = computed(() => {
  const n = 5
  return Array.from({ length: n + 1 }, (_, i) => Math.round((maxV.value / n) * i))
})

const xOf = (i: number) => {
  const n = props.values.length
  if (n <= 1) return PAD_L
  return PAD_L + (i * (W - PAD_L - PAD_R)) / (n - 1)
}
const yOf = (v: number) => PAD_T + (1 - v / maxV.value) * (H - PAD_T - PAD_B)

const slotW = computed(() => (W - PAD_L - PAD_R) / Math.max(props.values.length - 1, 1))

const linePath = computed(() =>
  props.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(' ')
)

const areaPath = computed(() => {
  if (!props.values.length) return ''
  const base = H - PAD_B
  return `${linePath.value} L${xOf(props.values.length - 1).toFixed(1)},${base} L${PAD_L},${base} Z`
})
</script>
