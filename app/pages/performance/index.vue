<template>
  <div class="p-6 dark:bg-gray-900 min-h-screen min-w-0">

    <!-- ===== Header ===== -->
    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">Performance</h2>
        <p class="text-sm text-gray-400 mt-0.5">
          Ringkasan performa setting &amp; release · seluruh angka YTD {{ tahun }}
        </p>
      </div>

      <div class="flex items-end gap-3 flex-wrap">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-400">PIC</label>
          <div
            class="flex items-center gap-2.5 px-3 py-[7px] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
            <div :class="currentUser.color"
              class="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
              {{ currentUser.initial }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-800 dark:text-white leading-tight truncate">
                {{ currentUser.name || '—' }}
              </p>
              <p class="text-[11px] text-gray-400 leading-tight truncate">{{ currentUser.title }}</p>
            </div>
          </div>
        </div>

        <button @click="fetchAll" :disabled="loading"
          class="flex items-center gap-2 px-4 py-2 bg-[#F03131] text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition">
          <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ loading ? 'Memuat...' : 'Refresh' }}
        </button>

        <button @click="toggleDark"
          class="p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition">
          <svg v-if="!isDark" class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <svg v-else class="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- ===== Loading ===== -->
    <div v-if="loading" class="py-16 text-center text-gray-400 text-sm">Memuat data performance...</div>

    <!-- ===== Error ===== -->
    <div v-else-if="error" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm py-16 text-center">
      <svg class="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p class="text-gray-400 text-sm">{{ error }}</p>
      <button @click="fetchAll" class="mt-3 text-xs font-medium text-[#F03131] hover:underline">Coba Lagi</button>
    </div>

    <template v-else-if="perf">

      <div v-if="warning"
        class="flex items-start gap-2.5 mb-5 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
        <svg class="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{{ warning }}</p>
      </div>

      <!-- ===== KPI Cards ===== -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
        <StatCard label="Total Setting" :value="fmt(kartu.totalSetting)" color="#F03131" :icon-path="ICON.chart" />
        <StatCard label="Akurasi Setting" :value="kartu.akurasiSetting.toFixed(2)" suffix="%" color="#10B981"
          :bar="kartu.akurasiSetting" :icon-path="ICON.check" />
        <StatCard label="Akurasi Release" :value="kartu.akurasiRelease.toFixed(2)" suffix="%" color="#3B82F6"
          :bar="kartu.akurasiRelease" :icon-path="ICON.send" />
        <StatCard label="Total Bobot" :value="fmt(kartu.totalBobot)" color="#8B5CF6" :icon-path="ICON.scale" />
        <StatCard label="Total Dokumen" :value="fmt(kartu.totalDokumen)" color="#F59E0B" :icon-path="ICON.doc" />
      </div>

      <!-- ===== Charts ===== -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <ChartCard title="SL Setting" subtitle="Setting vs Konfirmasi" :badge="badgeYTD">
          <DonutChart :series="slSetting" :center-value="slSetting[0].value.toFixed(2)" center-label="0-1 Hari" />
        </ChartCard>

        <ChartCard title="SL Release" subtitle="Release vs Setting" :badge="badgeYTD">
          <DonutChart :series="slRelease" :center-value="slRelease[0].value.toFixed(2)" center-label="0-1 Hari" />
        </ChartCard>

        <ChartCard title="Akurasi Settingan" subtitle="Status Controller" :badge="badgeYTD">
          <DonutChart :series="akurasi" :center-value="akurasi[0].value.toFixed(2)" center-label="Status OK" />
        </ChartCard>

        <div class="lg:col-span-3">
          <ChartCard title="Average Weekly Jumlah Settingan YTD"
            subtitle="Total JML Setting dibagi jumlah hari aktif pada minggu tersebut"
            :badge="`W1 – W${weekly.labels.length}`">
            <LineChart :labels="weekly.labels" :values="weekly.values" color="#F03131" x-label="Week" />

            <div class="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex-wrap">
              <div v-for="s in weeklyStats" :key="s.label" class="flex items-center gap-2">
                <span class="w-1.5 h-8 rounded-full" :style="{ backgroundColor: s.color }"></span>
                <div>
                  <p class="text-sm font-bold text-gray-800 dark:text-white leading-none">{{ s.value }}</p>
                  <p class="text-[11px] text-gray-400 mt-1">{{ s.label }}</p>
                </div>
              </div>
            </div>
            <p class="text-[11px] text-gray-400 mt-3">
              Minggu Senin–Minggu, bulan mengikuti kalender operasional Mayora.
              Hari libur nasional, cuti bersama, dan hari Minggu tidak dihitung sebagai hari aktif —
              tapi settingan yang dikerjakan pada tanggal tersebut tetap masuk hitungan.
            </p>
          </ChartCard>
        </div>

        <div class="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-4">

          <ChartCard title="Report Audit By Periode" subtitle="Jumlah audit settingan"
            :badge="auditMode === 'bulan' ? `Min ${AUDIT_TARGET}/bln` : `Min ${AUDIT_TARGET * 3}/quartal`">

            <!-- kontrol: mode + bulan -->
            <div class="flex items-center gap-2 mb-4 flex-wrap">
              <button v-for="m in auditModes" :key="m.value" @click="auditMode = m.value"
                :class="auditMode === m.value
                  ? 'bg-[#F03131] text-white border-[#F03131]'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'"
                class="px-3 py-1 rounded-full text-xs font-medium border transition">
                {{ m.label }}
              </button>
              <input type="month" v-model="auditMonth"
                class="ml-auto px-2.5 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>

            <div v-if="auditLoading" class="text-center text-xs text-gray-400 py-12">Memuat data audit...</div>

            <template v-else-if="auditPeriode.length">
              <BarChart :items="auditPeriode" :height="190" :bar-width="90"
                :max="Math.max(AUDIT_TARGET, ...auditPeriode.map(a => a.value))" show-legend />
              <p class="text-[11px] mt-3" :class="auditTercapai ? 'text-green-600 dark:text-green-400' : 'text-gray-400'">
                {{ auditRingkas }}
              </p>
            </template>

            <p v-else class="text-center text-xs text-gray-400 py-12">
              {{ auditError || 'Belum ada data audit pada periode ini.' }}
            </p>
          </ChartCard>

          <ChartCard title="Kerumitan Settingan" subtitle="Req doc vs Total Setting" :badge="badgeYTD">
            <BarChart :items="kerumitan" :height="200" :bar-width="90" />

            <div class="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div v-for="k in kerumitan" :key="k.label"
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/40">
                <span class="w-2.5 h-2.5 rounded-sm flex-shrink-0" :style="{ backgroundColor: k.color }"></span>
                <div class="min-w-0">
                  <p class="text-sm font-bold text-gray-800 dark:text-white leading-none tabular-nums">
                    {{ fmt(k.value) }}
                  </p>
                  <p class="text-[11px] text-gray-400 mt-1 truncate">{{ k.label }}</p>
                </div>
              </div>
            </div>

            <p class="text-[11px] text-gray-400 mt-3">
              Rasio kerumitan <span class="font-bold text-gray-600 dark:text-gray-300">{{ rasioKerumitan }}x</span>
              — rata-rata jumlah setting per dokumen.
            </p>
          </ChartCard>
        </div>

      </div>

      <p class="text-right text-xs text-gray-400 mt-4">
        🕐 {{ lastUpdated }} · {{ activePic || '—' }} · YTD {{ tahun }}
      </p>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import StatCard from '~/components/charts/StatCard.vue'
import ChartCard from '~/components/charts/ChartCard.vue'
import DonutChart from '~/components/charts/DonutChart.vue'
import BarChart from '~/components/charts/BarChart.vue'
import LineChart from '~/components/charts/LineChart.vue'
import { useDarkMode } from '~/composables/useDarkMode'
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: 'dashboard' })

const { isDark, toggle: toggleDark, init } = useDarkMode()
const { currentUser } = useAuth()

const N8N_BASE_URL = 'https://n8n.devss.my.id'
const PERF_PATH = '/webhook/performance'
const AUDIT_PATH = '/webhook/monitoring-audit-26'
const AUDIT_TARGET = 15

const ICON = {
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  send: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
  scale: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
  doc: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
}

const loading = ref(true)
const error = ref('')
const warning = ref('')
const auditError = ref('')
const auditLoading = ref(false)

// Report Audit: per bulan atau per quartal (3 bulan) — bukan YTD
const auditModes = [
  { value: 'bulan', label: 'Per Bulan' },
  { value: 'quartal', label: 'Per Quartal' },
]
const auditMode = ref<'bulan' | 'quartal'>('bulan')
const auditMonth = ref(
  `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
)
const perf = ref<any>(null)
const audit = ref<any>(null)
const lastUpdated = ref('')

const tahun = new Date().getFullYear()
const badgeYTD = computed(() => `YTD ${tahun}`)
const activePic = computed(() => (currentUser.value?.pic_name || '').toUpperCase().trim())

const perfUrl = computed(() => `${N8N_BASE_URL}${PERF_PATH}?user=${activePic.value}`)
const auditUrl = computed(() =>
  `${N8N_BASE_URL}${AUDIT_PATH}?user=${activePic.value}&month=${auditMonth.value}`)

const fmt = (n: number) => (n == null ? '0' : Number(n).toLocaleString('id-ID'))

// ─── Mapping ke bentuk yang dipakai komponen chart ──────────────────────────
const kartu = computed(() => ({
  totalSetting: perf.value?.kartu?.totalSetting ?? 0,
  totalDokumen: perf.value?.kartu?.totalDokumen ?? 0,
  totalBobot: perf.value?.kartu?.totalBobot ?? 0,
  akurasiSetting: perf.value?.kartu?.akurasiSetting ?? 0,
  akurasiRelease: perf.value?.kartu?.akurasiRelease ?? 0,
}))

const slSeries = (src: any) => {
  const p = src?.persen || {}
  return [
    { label: '0-1 Hari', value: p['0-1'] ?? 0, color: '#10B981' },
    { label: '2 Hari', value: p['2'] ?? 0, color: '#F59E0B' },
    { label: '>= 3 Hari', value: p['>=3'] ?? 0, color: '#F03131' },
  ]
}
const slSetting = computed(() => slSeries(perf.value?.slSetting))
const slRelease = computed(() => {
  const s = slSeries(perf.value?.slRelease)
  s[0]!.color = '#3B82F6'
  return s
})

const akurasi = computed(() => {
  const p = perf.value?.akurasiSetting?.persen || {}
  return [
    { label: 'OK', value: p.OK ?? 0, color: '#10B981' },
    { label: 'REV', value: p.REV ?? 0, color: '#F59E0B' },
    { label: 'REV2', value: p.REV2 ?? 0, color: '#F03131' },
  ]
})

const weekly = computed(() => {
  const list: any[] = perf.value?.weekly || []
  return {
    labels: list.map(w => w.week),
    values: list.map(w => w.rataRata),
  }
})

const weeklyStats = computed(() => {
  const v = weekly.value.values
  if (!v.length) return []
  const avg = v.reduce((a, b) => a + b, 0) / v.length
  const max = Math.max(...v)
  const min = Math.min(...v)
  return [
    { label: 'Rata-rata', value: avg.toFixed(1), color: '#F03131' },
    { label: `Tertinggi (W${v.indexOf(max) + 1})`, value: max.toFixed(1), color: '#10B981' },
    { label: `Terendah (W${v.indexOf(min) + 1})`, value: min.toFixed(1), color: '#F59E0B' },
    { label: 'Minggu terakhir', value: (v[v.length - 1] ?? 0).toFixed(1), color: '#3B82F6' },
  ]
})

const PALET = ['#06B6D4', '#F03131', '#8B5CF6']

// Mode bulan   -> 1 batang (bulan terpilih)
// Mode quartal -> 3 batang (3 bulan dalam quartal tsb)
// Dua-duanya sudah tersedia dari satu panggilan webhook.
const auditPeriode = computed(() => {
  const perBulan: any[] = audit.value?.perBulan || []
  if (!perBulan.length) return []

  if (auditMode.value === 'quartal') {
    return perBulan.map((b, i) => ({
      label: b.label,
      value: b.totalAudit ?? 0,
      color: PALET[i % PALET.length]!,
    }))
  }

  const b = perBulan.find(x => x.key === auditMonth.value) || perBulan[0]
  return b ? [{ label: b.label, value: b.totalAudit ?? 0, color: '#06B6D4' }] : []
})

const auditTotal = computed(() =>
  auditPeriode.value.reduce((s, a) => s + a.value, 0)
)
const auditTargetAktif = computed(() =>
  auditMode.value === 'bulan' ? AUDIT_TARGET : AUDIT_TARGET * 3
)
const auditTercapai = computed(() => auditTotal.value >= auditTargetAktif.value)
const auditRingkas = computed(() => {
  const t = auditTotal.value, g = auditTargetAktif.value
  const periode = auditMode.value === 'bulan'
    ? (auditPeriode.value[0]?.label || 'bulan ini')
    : (audit.value?.quarterLabel || 'quartal ini')
  return t >= g
    ? `${periode}: ${t}/${g} audit — target tercapai`
    : `${periode}: ${t}/${g} audit — kurang ${g - t} lagi`
})

const kerumitan = computed(() => [
  { label: 'Total Dokumen', value: kartu.value.totalDokumen, color: '#3B82F6' },
  { label: 'Total Bobot', value: kartu.value.totalBobot, color: '#F59E0B' },
])

const rasioKerumitan = computed(() => {
  const dok = kartu.value.totalDokumen || 1
  return (kartu.value.totalBobot / dok).toFixed(2)
})

// ─── Fetch ───────────────────────────────────────────────────────────────────
const ambil = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Server error: ${res.status}`)
  const raw = await res.json()
  return Array.isArray(raw) ? raw[0] : raw
}

const fetchAll = async () => {
  if (!activePic.value) return
  loading.value = true
  error.value = ''
  warning.value = ''
  auditError.value = ''

  try {
    const body = await ambil(perfUrl.value)
    if (!body || typeof body !== 'object' || !body.kartu || !Array.isArray(body.weekly)) {
      warning.value =
        'Webhook performance merespons, tapi bentuknya tidak dikenali. ' +
        'Pastikan Code node memakai pullPerformanceCode.js. Field diterima: ' +
        (body && typeof body === 'object' ? (Object.keys(body).join(', ') || '(kosong)') : String(body))
      perf.value = { kartu: {}, weekly: [] }
    } else {
      perf.value = body
      const hilang = body?._debug?.kolomTidakDitemukan
      if (Array.isArray(hilang) && hilang.length) {
        warning.value = 'Kolom berikut tidak ada di sheet: ' + hilang.join(' · ') +
          '. Sesuaikan konstanta COL di Code node.'
      }
    }
    lastUpdated.value = new Date().toLocaleTimeString('id-ID')
  } catch (e: any) {
    perf.value = null
    error.value = e.message || 'Gagal mengambil data performance.'
    loading.value = false
    return
  }

  loading.value = false
  fetchAudit()
}

// Audit dipisah: kalau gagal, chart lain tetap tampil
const fetchAudit = async () => {
  if (!activePic.value) return
  auditLoading.value = true
  auditError.value = ''
  try {
    const body = await ambil(auditUrl.value)
    audit.value = (body && Array.isArray(body.perBulan)) ? body : null
    if (!audit.value) auditError.value = 'Bentuk data audit tidak dikenali.'
  } catch {
    audit.value = null
    auditError.value = 'Data audit tidak dapat diambil.'
  } finally {
    auditLoading.value = false
  }
}

watch(auditMonth, () => fetchAudit())

onMounted(() => {
  init()
  if (activePic.value) fetchAll()
  else setTimeout(() => {
    if (!activePic.value) { loading.value = false; error.value = 'Sesi pengguna tidak ditemukan. Silakan login ulang.' }
    else fetchAll()
  }, 1500)
})
</script>
