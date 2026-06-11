<template>
  <div class="p-6 dark:bg-gray-900 min-h-screen">

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">Daily Activity</h2>
        <p class="text-sm text-gray-400 mt-0.5">Rekap produktivitas harian Anda</p>
      </div>
      <div class="flex items-end gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-400">Tanggal</label>
          <input
            type="date"
            v-model="selectedDate"
            @change="fetchActivity"
            class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-300"
          />
        </div>
        <button
          @click="toggleAutoRefresh"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition"
          :class="autoRefresh
            ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400'
            : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'"
        >
          <span class="w-2 h-2 rounded-full flex-shrink-0" :class="autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-300'"></span>
          {{ autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF' }}
        </button>
        <button
          @click="fetchActivity"
          :disabled="loading"
          class="flex items-center gap-2 px-4 py-2 bg-[#F03131] text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          {{ loading ? 'Memuat...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-16 text-center text-gray-400 text-sm">
      Memuat data aktivitas...
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm py-16 text-center">
      <svg class="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
      <p class="text-gray-400 text-sm">{{ error }}</p>
      <button @click="fetchActivity" class="mt-3 text-xs font-medium text-[#F03131] hover:underline">Coba Lagi</button>
    </div>

    <template v-else-if="data">

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-[#F03131]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div>
            <p class="text-xl font-bold text-gray-800 dark:text-white">{{ data.totalPoin }}</p>
            <p class="text-xs text-gray-400">Total Setting</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>
            </svg>
          </div>
          <div>
            <p class="text-xl font-bold text-gray-800 dark:text-white">{{ formatNumber(data.totalBobot) }}</p>
            <p class="text-xs text-gray-400">Total Bobot</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div>
            <p class="text-xl font-bold text-gray-800 dark:text-white">{{ data.activities.length }}</p>
            <p class="text-xs text-gray-400">Jumlah Aktivitas</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center gap-3">
          <div :class="currentUser.color" class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {{ currentUser.initial }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-gray-800 dark:text-white truncate">{{ currentUser.name }}</p>
            <p class="text-xs text-gray-400">{{ currentUser.title }}</p>
          </div>
        </div>
      </div>

      <!-- Productivity Target -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm px-5 pt-5 pb-4 mb-6">
        <div class="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div>
            <h3 class="font-semibold text-gray-800 dark:text-white">🎯 Target Produktivitas Harian</h3>
            <p class="text-xs text-gray-400 mt-0.5">{{ data.date }} · Standar {{ data.target }} setting/hari</p>
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-3xl font-black" :class="progressTextColor">{{ data.totalPoin }}</span>
            <span class="text-lg text-gray-300 dark:text-gray-600">/</span>
            <span class="text-lg font-semibold text-gray-400">{{ data.target }}</span>
            <span class="text-xs text-gray-400 ml-1">setting</span>
          </div>
        </div>

        <div class="flex items-center gap-3 mb-3">
          <div class="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700"
              :class="progressBarColor"
              :style="{ width: `${Math.min(progressPercent, 100)}%` }"
            ></div>
          </div>
          <span class="text-sm font-bold min-w-[3rem] text-right" :class="progressTextColor">{{ progressPercent }}%</span>
        </div>

        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex gap-4">
            <span v-for="m in [25, 50, 75, 100]" :key="m"
              class="text-xs font-semibold transition-colors"
              :class="progressPercent >= m ? 'text-[#F03131]' : 'text-gray-300 dark:text-gray-600'">
              {{ m }}%{{ m === 100 ? ' 🏆' : '' }}
            </span>
          </div>
          <p class="text-xs font-medium">
            <span v-if="progressPercent >= 100" class="text-green-500">🎉 Target tercapai! Luar biasa!</span>
            <span v-else-if="progressPercent >= 75" class="text-yellow-500">💪 Hampir sampai! Kurang {{ data.target - data.totalPoin }} lagi</span>
            <span v-else-if="progressPercent >= 50" class="text-blue-500">⚡ Sudah setengah jalan! Terus semangat!</span>
            <span v-else-if="progressPercent >= 25" class="text-purple-500">🚀 Masih {{ data.target - data.totalPoin }} lagi menuju target</span>
            <span v-else class="text-gray-400">📌 Standar produktivitas: {{ data.target }} setting/hari</span>
          </p>
        </div>
      </div>

      <!-- Activity Table -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div class="px-5 pt-5 pb-4 flex items-center justify-between">
          <h3 class="font-semibold text-gray-800 dark:text-white">Detail Aktivitas</h3>
          <span class="text-xs text-gray-400">{{ data.activities.length }} aktivitas ditemukan</span>
        </div>

        <!-- Empty -->
        <div v-if="data.activities.length === 0" class="py-16 text-center">
          <svg class="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <p class="text-gray-400 text-sm">Tidak ada aktivitas pada tanggal ini</p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-t border-gray-100 dark:border-gray-700">
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400">No</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">PIC</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Tanggal</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Type</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Deskripsi / Aktivitas</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Sub Div</th>
                <th class="px-3 py-3 text-center text-xs font-medium text-gray-400">Jml Setting</th>
                <th class="px-3 py-3 text-center text-xs font-medium text-gray-400">Bobot</th>
                <th class="px-3 py-3 text-center text-xs font-medium text-gray-400">Total</th>
                <th class="px-3 py-3 text-center text-xs font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="act in data.activities" :key="act.no"
                class="border-t border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <td class="px-4 py-3.5 text-xs text-gray-400 font-medium">{{ act.no }}</td>
                <td class="px-3 py-3.5">
                  <div class="flex items-center gap-2">
                    <div :class="getPicColor(act.pic)"
                      class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {{ act.pic ? act.pic[0] : '?' }}
                    </div>
                    <span class="text-gray-700 dark:text-gray-300 text-xs">{{ act.pic }}</span>
                  </div>
                </td>
                <td class="px-3 py-3.5 text-xs text-gray-400 whitespace-nowrap">{{ act.tanggal }}</td>
                <td class="px-3 py-3.5">
                  <span class="px-2.5 py-1 rounded-full text-xs font-medium"
                    :class="{
                      'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300': act.type === 'SETTING',
                      'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300': act.type === 'RELEASE',
                      'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300': act.type === 'SETTING & RELEASE'
                    }">
                    {{ act.type }}
                  </span>
                </td>
                <td class="px-3 py-3.5 max-w-xs">
                  <p class="font-semibold text-gray-800 dark:text-gray-100 text-xs leading-snug truncate" :title="act.deskripsi">
                    {{ act.deskripsi }}
                  </p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ act.kodeAP }}</p>
                </td>
                <td class="px-3 py-3.5 text-xs text-gray-400 whitespace-nowrap">{{ act.subDiv }}</td>
                <td class="px-3 py-3.5 text-center text-sm font-medium text-gray-700 dark:text-gray-300">{{ act.jmlSetting }}</td>
                <td class="px-3 py-3.5 text-center text-sm font-medium text-gray-700 dark:text-gray-300">{{ act.bobotSetting }}</td>
                <td class="px-3 py-3.5 text-center text-sm font-bold text-gray-800 dark:text-white">{{ formatNumber(act.totalSetting) }}</td>
                <td class="px-3 py-3.5 text-center">
                  <span class="px-3 py-1 rounded-full text-xs font-medium"
                    :class="getStatusClass(act.status)">
                    {{ act.status || '-' }}
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                <td colspan="6" class="px-4 py-3 text-xs font-medium text-gray-400">TOTAL</td>
                <td class="px-3 py-3 text-center text-sm font-bold text-gray-800 dark:text-white">{{ data.totalPoin }}</td>
                <td class="px-3 py-3"></td>
                <td class="px-3 py-3 text-center text-sm font-bold text-gray-800 dark:text-white">{{ formatNumber(data.totalBobot) }}</td>
                <td class="px-3 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Last Updated -->
      <p class="text-right text-xs text-gray-400 mt-3">
        🕐 Terakhir diperbarui: {{ lastUpdated }} · {{ autoRefresh ? "Auto-refresh setiap 3 menit" : "Auto-refresh dimatikan" }}
      </p>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: 'dashboard' })

const formatNumber = (n: number) => {
  return n % 1 === 0 ? n.toString() : n.toFixed(1)
}

const { currentUser } = useAuth()

const N8N_BASE_URL = 'https://n8n.devss.my.id'

const loading = ref(false)
const error = ref('')
const data = ref<any>(null)
const lastUpdated = ref('')
const autoRefresh = ref(true)
let refreshInterval: ReturnType<typeof setInterval> | null = null

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    refreshInterval = setInterval(fetchActivity, 3 * 60 * 1000)
  } else {
    if (refreshInterval) clearInterval(refreshInterval)
    refreshInterval = null
  }
}

const getLocalDateString = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const selectedDate = ref(getLocalDateString())

const progressPercent = computed(() => {
  if (!data.value) return 0
  return Math.round((data.value.totalPoin / data.value.target) * 100)
})

const progressTextColor = computed(() => {
  const p = progressPercent.value
  if (p >= 100) return 'text-green-500'
  if (p >= 75) return 'text-yellow-500'
  if (p >= 50) return 'text-blue-500'
  return 'text-[#F03131]'
})

const progressBarColor = computed(() => {
  const p = progressPercent.value
  if (p >= 100) return 'bg-green-500'
  if (p >= 75) return 'bg-yellow-400'
  if (p >= 50) return 'bg-blue-500'
  return 'bg-[#F03131]'
})

const getStatusClass = (status: string) => {
  const s = (status || '').toUpperCase()
  if (s === 'OK') return 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300'
  if (s === 'REV') return 'bg-red-100 text-red-500 dark:bg-red-800/30 dark:text-red-400'
  return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
}

const getPicColor = (pic: string) => {
  const map: Record<string, string> = {
    KUNCORO: 'bg-red-500', IRHANDY: 'bg-green-500',
    MECHELL: 'bg-orange-500', WIRA: 'bg-purple-500',
    LIA: 'bg-pink-500', MAULANA: 'bg-blue-500',
  }
  return map[(pic || '').toUpperCase()] || 'bg-gray-400'
}

const fetchActivity = async () => {
  loading.value = true
  error.value = ''
  try {
    const username = currentUser.value?.username || currentUser.value?.id || 'kuncoro'
    const res = await fetch(
      `${N8N_BASE_URL}/webhook/daily-activity?user=${encodeURIComponent(username)}&date=${selectedDate.value}`
    )
    if (!res.ok) throw new Error(`Server error: ${res.status}`)
    data.value = await res.json()
    lastUpdated.value = new Date().toLocaleTimeString('id-ID')
  } catch (e: any) {
    error.value = e.message || 'Gagal mengambil data. Pastikan n8n sedang berjalan.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchActivity()
  refreshInterval = setInterval(fetchActivity, 3 * 60 * 1000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>