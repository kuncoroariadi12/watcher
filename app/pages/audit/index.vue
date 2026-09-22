<template>
  <div class="p-6 dark:bg-gray-900 min-h-screen min-w-0">

    <!-- ===== Header ===== -->
    <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">Monitoring Audit</h2>
        <p class="text-sm text-gray-400 mt-0.5">
          Jumlah audit yang dilakukan · target {{ TARGET.bulan }}/bulan &amp; {{ TARGET.quartal }}/quartal
        </p>
      </div>

      <div class="flex items-end gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
        <div class="flex flex-col gap-1 w-full sm:w-auto">
          <label class="text-xs font-medium text-gray-400">Bulan</label>
          <input type="month" v-model="selectedMonth"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-300" />
        </div>

        <button @click="toggleAutoRefresh"
          class="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition"
          :class="autoRefresh
            ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400'
            : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'">
          <span class="w-2 h-2 rounded-full flex-shrink-0"
            :class="autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-300'"></span>
          <span class="sm:hidden">{{ autoRefresh ? 'Auto ON' : 'Auto OFF' }}</span>
          <span class="hidden sm:inline">{{ autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF' }}</span>
        </button>

        <button @click="fetchAudit" :disabled="loading"
          class="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-[#F03131] text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition">
          <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ loading ? 'Memuat...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- ===== Toggle periode ===== -->
    <div class="flex items-center gap-2 mb-5 flex-wrap">
      <button v-for="m in modes" :key="m.value" @click="mode = m.value"
        :class="mode === m.value
          ? 'bg-[#F03131] text-white border-[#F03131]'
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'"
        class="px-4 py-1.5 rounded-full text-sm font-medium border transition">
        {{ m.label }}
      </button>
      <span class="text-xs text-gray-400 ml-1">{{ periodeLabel }}</span>
    </div>

    <!-- ===== Loading ===== -->
    <div v-if="loading" class="py-16 text-center text-gray-400 text-sm">
      Memuat data audit...
    </div>

    <!-- ===== Error ===== -->
    <div v-else-if="error" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm py-16 text-center">
      <svg class="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p class="text-gray-400 text-sm">{{ error }}</p>
      <button @click="fetchAudit" class="mt-3 text-xs font-medium text-[#F03131] hover:underline">Coba Lagi</button>
    </div>

    <template v-else-if="data">

      <!-- Peringatan bentuk response tidak dikenali -->
      <div v-if="warning"
        class="flex items-start gap-2.5 mb-5 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
        <svg class="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{{ warning }}</p>
      </div>

      <!-- ===== KPI Cards ===== -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <StatCard :label="`Total Audit · ${mode === 'bulan' ? 'Bulan Ini' : 'Quartal Ini'}`"
          :value="stat.totalAudit" color="#F03131" :bar="progressPercent" :icon-path="ICON.clipboard" />
        <StatCard label="Tuntas — Semua Subdist Download" :value="stat.totalOk" color="#10B981"
          :bar="stat.totalAudit ? (stat.totalOk / stat.totalAudit) * 100 : 0" :icon-path="ICON.check" />
        <StatCard label="Ada Temuan — Belum Download" :value="stat.totalTemuan" color="#F59E0B"
          :bar="stat.totalAudit ? (stat.totalTemuan / stat.totalAudit) * 100 : 0" :icon-path="ICON.warn" />
      </div>

      <!-- ===== Target + Komposisi ===== -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">

        <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm px-5 pt-5 pb-4">
          <div class="flex items-center justify-between flex-wrap gap-3 mb-3">
            <div>
              <h3 class="font-semibold text-gray-800 dark:text-white">
                🎯 Target Audit {{ mode === 'bulan' ? 'Bulanan' : 'Quartal' }}
              </h3>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ periodeLabel }} · Minimal {{ activeTarget }} audit/{{ mode === 'bulan' ? 'bulan' : 'quartal' }}
              </p>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-black" :class="progressTextColor">{{ stat.totalAudit }}</span>
              <span class="text-lg text-gray-300 dark:text-gray-600">/</span>
              <span class="text-lg font-semibold text-gray-400">{{ activeTarget }}</span>
              <span class="text-xs text-gray-400 ml-1">audit</span>
            </div>
          </div>

          <div class="flex items-center gap-3 mb-3">
            <div class="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700" :class="progressBarColor"
                :style="{ width: `${Math.min(progressPercent, 100)}%` }"></div>
            </div>
            <span class="text-sm font-bold min-w-[3rem] text-right" :class="progressTextColor">
              {{ Math.round(progressPercent) }}%
            </span>
          </div>

          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex gap-4">
              <span v-for="m in [25, 50, 75, 100]" :key="m" class="text-xs font-semibold transition-colors"
                :class="progressPercent >= m ? 'text-[#F03131]' : 'text-gray-300 dark:text-gray-600'">
                {{ m }}%{{ m === 100 ? ' 🏆' : '' }}
              </span>
            </div>
            <p class="text-xs font-medium">
              <span v-if="progressPercent >= 100" class="text-green-500">
                🎉 Target {{ mode === 'bulan' ? 'bulanan' : 'quartal' }} tercapai!
              </span>
              <span v-else class="text-gray-500 dark:text-gray-400">
                📌 Kurang <span class="font-bold text-[#F03131]">{{ activeTarget - stat.totalAudit }}</span> audit lagi
                <span v-if="sisaHariKerja > 0"> · sisa {{ sisaHariKerja }} hari kerja</span>
              </span>
            </p>
          </div>

          <div v-if="progressPercent < 100 && sisaHariKerja > 0"
            class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p class="text-xs text-gray-400">
              Perlu rata-rata <span class="font-bold text-gray-600 dark:text-gray-300">{{ paceNeeded }}</span>
              audit/hari untuk mencapai target.
            </p>
          </div>
        </div>

        <ChartCard title="Komposisi Hasil Audit" :badge="periodeLabel">
          <DonutChart :series="komposisi" :center-value="akurasi.toFixed(1)" center-label="Tuntas"
            legend-unit=" audit" :size="140" />
        </ChartCard>
      </div>

      <!-- ===== Rincian per bulan (mode quartal) ===== -->
      <div v-if="mode === 'quartal'" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mb-5">
        <div class="mb-4">
          <h3 class="font-semibold text-gray-800 dark:text-white text-sm">Rincian per Bulan</h3>
          <p class="text-xs text-gray-400 mt-0.5">
            Tiap bulan dinilai terhadap target {{ TARGET.bulan }} audit · {{ periodeLabel }}
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div v-for="b in perBulan" :key="b.key"
            class="rounded-xl border p-4 transition"
            :class="b.tercapai
              ? 'border-green-200 bg-green-50/50 dark:border-green-800/60 dark:bg-green-900/10'
              : 'border-gray-200 bg-gray-50/60 dark:border-gray-700 dark:bg-gray-700/20'">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ b.label }}</p>
              <span v-if="b.tercapai" class="text-xs font-bold text-green-600 dark:text-green-400">✓</span>
              <span v-else class="text-[11px] font-medium text-gray-400">kurang {{ b.sisa }}</span>
            </div>
            <p class="text-2xl font-black leading-none tracking-tight"
              :class="b.tercapai ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-200'">
              {{ b.totalAudit }}<span class="text-sm font-semibold text-gray-400">/{{ TARGET.bulan }}</span>
            </p>
            <div class="mt-3 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700"
                :class="b.tercapai ? 'bg-green-500' : 'bg-[#F03131]'"
                :style="{ width: Math.min((b.totalAudit / TARGET.bulan) * 100, 100) + '%' }"></div>
            </div>
            <p class="text-[11px] text-gray-400 mt-2">
              {{ b.totalOk }} tuntas · {{ b.totalTemuan }} temuan
            </p>
          </div>
        </div>
      </div>

      <!-- ===== Distribusi harian (mode bulan) ===== -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mb-5">
        <div class="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h3 class="font-semibold text-gray-800 dark:text-white text-sm">Distribusi Audit Harian</h3>
            <p class="text-xs text-gray-400 mt-0.5">Sebaran jumlah audit per tanggal · {{ periodeLabel }}</p>
          </div>
          <div class="flex items-center gap-3 text-[11px] text-gray-400">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-[#F03131]"></span> Ada audit</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-gray-100 dark:bg-gray-700"></span> Kosong</span>
          </div>
        </div>

        <div class="flex items-end gap-[3px] h-28">
          <div v-for="d in dailyDistribution" :key="d.day" class="flex-1 h-full flex flex-col justify-end group relative">
            <div class="w-full rounded-t transition-all duration-700"
              :class="d.count > 0 ? 'bg-[#F03131] group-hover:bg-red-600' : 'bg-gray-100 dark:bg-gray-700'"
              :style="{ height: d.count > 0 ? Math.max((d.count / maxDaily) * 100, 12) + '%' : '4px' }"></div>
            <div
              class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-gray-900 dark:bg-gray-700 text-white text-[11px] rounded-md px-2 py-1 whitespace-nowrap z-10 shadow-lg">
              Tgl {{ d.day }} · {{ d.count }} audit
            </div>
          </div>
        </div>

        <div class="flex gap-[3px] mt-1.5">
          <div v-for="d in dailyDistribution" :key="'l' + d.day" class="flex-1 text-center">
            <span class="text-[9px] text-gray-300 dark:text-gray-600">
              {{ d.day % 5 === 0 || d.day === 1 ? d.day : '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- ===== Tabel Detail ===== -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div class="px-5 pt-5 pb-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 class="font-semibold text-gray-800 dark:text-white">Detail Audit</h3>
            <p class="text-xs text-gray-400 mt-1">
              {{ filteredAudits.length }} dari {{ activeAudits.length }} audit ditampilkan · {{ periodeLabel }}
            </p>
          </div>

          <div class="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <div class="relative w-full sm:w-auto">
              <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input v-model="searchQuery" type="text" placeholder="Cari settingan, kategori..."
                class="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 w-full sm:w-56" />
            </div>

            <button v-for="f in hasilFilters" :key="f.value"
              @click="filterHasil = filterHasil === f.value ? '' : f.value"
              :class="filterHasil === f.value
                ? 'bg-[#F03131] text-white border-[#F03131]'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'"
              class="px-3.5 py-2 rounded-lg text-sm font-medium border transition">
              {{ f.label }}
            </button>
          </div>
        </div>

        <div v-if="filteredAudits.length === 0" class="py-16 text-center">
          <svg class="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-gray-400 text-sm">Tidak ada audit pada periode ini</p>
        </div>

        <!-- ===== MOBILE (< 768px): kartu ===== -->
        <template v-else-if="isMobile">
          <ul class="divide-y divide-gray-100 dark:divide-gray-700 border-t border-gray-100 dark:border-gray-700">
            <li v-for="a in filteredAudits" :key="a.no" class="px-4 py-3.5">
              <div class="flex items-start justify-between gap-3">
                <p class="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug break-words min-w-0">
                  {{ a.settingan || '-' }}
                </p>
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0" :class="getHasilClass(a.hasil)">
                  {{ a.hasil === 'OK' ? 'Tuntas' : 'Temuan' }}
                </span>
              </div>

              <div class="flex items-center gap-1.5 mt-1.5 flex-wrap text-[11px] text-gray-400">
                <span class="px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {{ a.kategori || '-' }}
                </span>
                <span>{{ a.pic }}</span>
                <span>&bull;</span>
                <span>{{ a.tanggal }}</span>
              </div>

              <!-- Progres download subdist -->
              <div class="flex items-center gap-2 mt-2.5">
                <div class="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div class="h-full rounded-full"
                    :class="a.belumDownload > 0 ? 'bg-amber-400' : 'bg-green-500'"
                    :style="{ width: (a.jmlSubdist ? (a.sudahDownload / a.jmlSubdist) * 100 : 0) + '%' }"></div>
                </div>
                <span class="text-[11px] font-semibold text-gray-700 dark:text-gray-200 tabular-nums whitespace-nowrap">
                  {{ a.sudahDownload }}/{{ a.jmlSubdist }} download
                </span>
              </div>
              <p v-if="a.belumDownload > 0" class="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                {{ a.belumDownload }} subdist belum download
              </p>

              <p v-if="a.action" class="text-xs text-gray-500 dark:text-gray-400 mt-2 break-words">
                <span class="text-gray-400">Action:</span> {{ a.action }}
              </p>
            </li>
          </ul>
          <div class="flex items-center justify-between px-4 py-3 border-t-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 rounded-b-xl">
            <span class="text-xs font-medium text-gray-400">TOTAL AUDIT</span>
            <span class="text-sm font-bold text-gray-800 dark:text-white">{{ filteredAudits.length }}</span>
          </div>
        </template>

        <!-- ===== DESKTOP / TABLET: tabel ===== -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-t border-gray-100 dark:border-gray-700">
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400">No</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">PIC</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Tgl Audit</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Settingan Diaudit</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Kategori</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Subdist Download</th>
                <th class="px-3 py-3 text-center text-xs font-medium text-gray-400">Hasil</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in filteredAudits" :key="a.no"
                class="border-t border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <td class="px-4 py-3.5 text-xs text-gray-400 font-medium">{{ a.no }}</td>
                <td class="px-3 py-3.5">
                  <div class="flex items-center gap-2">
                    <div :class="getPicColor(a.pic)"
                      class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {{ a.pic ? a.pic[0] : '?' }}
                    </div>
                    <span class="text-gray-700 dark:text-gray-300 text-xs">{{ a.pic }}</span>
                  </div>
                </td>
                <td class="px-3 py-3.5 text-xs text-gray-400 whitespace-nowrap">{{ a.tanggal }}</td>
                <td class="px-3 py-3.5 max-w-sm">
                  <p class="text-xs text-gray-700 dark:text-gray-200 leading-snug truncate" :title="a.settingan">
                    {{ a.settingan || '-' }}
                  </p>
                </td>
                <td class="px-3 py-3.5">
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {{ a.kategori || '-' }}
                  </span>
                </td>
                <td class="px-3 py-3.5 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold text-gray-700 dark:text-gray-200 tabular-nums">
                      {{ a.sudahDownload }}/{{ a.jmlSubdist }}
                    </span>
                    <div class="w-14 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <div class="h-full rounded-full transition-all"
                        :class="a.belumDownload > 0 ? 'bg-amber-400' : 'bg-green-500'"
                        :style="{ width: (a.jmlSubdist ? (a.sudahDownload / a.jmlSubdist) * 100 : 0) + '%' }"></div>
                    </div>
                  </div>
                  <p v-if="a.belumDownload > 0" class="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                    {{ a.belumDownload }} belum download
                  </p>
                </td>
                <td class="px-3 py-3.5 text-center">
                  <span class="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap" :class="getHasilClass(a.hasil)">
                    {{ a.hasil === 'OK' ? 'Tuntas' : 'Temuan' }}
                  </span>
                </td>
                <td class="px-3 py-3.5 max-w-xs">
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate" :title="a.action">{{ a.action || '-' }}</p>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                <td colspan="6" class="px-4 py-3 text-xs font-medium text-gray-400">TOTAL AUDIT</td>
                <td class="px-3 py-3 text-center text-sm font-bold text-gray-800 dark:text-white">
                  {{ filteredAudits.length }}
                </td>
                <td class="px-3 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <p class="text-right text-xs text-gray-400 mt-3">
        🕐 Terakhir diperbarui: {{ lastUpdated }} ·
        {{ autoRefresh ? 'Auto-refresh setiap 5 menit' : 'Auto-refresh dimatikan' }}
      </p>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import StatCard from '~/components/charts/StatCard.vue'
import ChartCard from '~/components/charts/ChartCard.vue'
import DonutChart from '~/components/charts/DonutChart.vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: 'dashboard' })

const isMobile = useIsMobile()

const { currentUser } = useAuth()

const N8N_BASE_URL = 'https://n8n.devss.my.id'
const WEBHOOK_PATH = '/webhook/monitoring-audit-26'

// Target audit — bukan poin/bobot seperti Daily Activity, murni jumlah baris.
const TARGET = { bulan: 15, quartal: 45 }

const ICON = {
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  warn: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
}

const MONTHS_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

// ─── State ───────────────────────────────────────────────────────────────────
const loading = ref(true)
const error = ref('')
const warning = ref('')
const data = ref<any>(null)
const lastUpdated = ref('')
const autoRefresh = ref(true)
const searchQuery = ref('')
const filterHasil = ref('')
let refreshInterval: ReturnType<typeof setInterval> | null = null

const modes = [
  { value: 'bulan', label: 'Bulanan' },
  { value: 'quartal', label: 'Quartal' },
]
const mode = ref<'bulan' | 'quartal'>('bulan')

const hasilFilters = [
  { value: 'OK', label: 'Tuntas' },
  { value: 'TEMUAN', label: 'Ada Temuan' },
]

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
const selectedMonth = ref(getCurrentMonth())

// PIC selalu = user yang login. Tidak ada opsi melihat PIC lain.
const activePic = computed(() => (currentUser.value?.pic_name || '').toUpperCase().trim())

// ─── Periode ─────────────────────────────────────────────────────────────────
const ym = computed(() => {
  const [y, m] = selectedMonth.value.split('-').map(Number)
  return { year: y || 0, monthIdx: (m || 1) - 1 }
})

const quarterIdx = computed(() => Math.floor(ym.value.monthIdx / 3))
const quarterMonthIdxs = computed(() => [0, 1, 2].map(i => quarterIdx.value * 3 + i))

const monthKey = (y: number, mIdx: number) => `${y}-${String(mIdx + 1).padStart(2, '0')}`

const monthLabel = computed(() => `${MONTHS_FULL[ym.value.monthIdx]} ${ym.value.year}`)
const quarterLabel = computed(() => {
  const a = MONTHS_SHORT[quarterMonthIdxs.value[0]!]
  const b = MONTHS_SHORT[quarterMonthIdxs.value[2]!]
  return `Q${quarterIdx.value + 1} ${ym.value.year} (${a}–${b})`
})
const periodeLabel = computed(() => mode.value === 'bulan' ? monthLabel.value : quarterLabel.value)
const activeTarget = computed(() => mode.value === 'bulan' ? TARGET.bulan : TARGET.quartal)

// ─── Data turunan ────────────────────────────────────────────────────────────
// Semua statistik dihitung ulang dari `audits` (berisi 1 quartal penuh),
// jadi tampilan tetap benar meski agregat dari n8n berubah/hilang.
const allAudits = computed<any[]>(() => data.value?.audits || [])

const auditsBulan = computed(() =>
  allAudits.value.filter(a => a.month === selectedMonth.value)
)

const activeAudits = computed(() =>
  mode.value === 'bulan' ? auditsBulan.value : allAudits.value
)

const hitung = (list: any[]) => ({
  totalAudit: list.length,
  totalOk: list.filter(a => a.hasil === 'OK').length,
  totalTemuan: list.filter(a => a.hasil === 'TEMUAN').length,
})

const stat = computed(() => hitung(activeAudits.value))

const perBulan = computed(() =>
  quarterMonthIdxs.value.map(mIdx => {
    const key = monthKey(ym.value.year, mIdx)
    const list = allAudits.value.filter(a => a.month === key)
    const h = hitung(list)
    return {
      key,
      label: MONTHS_FULL[mIdx],
      ...h,
      sisa: Math.max(TARGET.bulan - h.totalAudit, 0),
      tercapai: h.totalAudit >= TARGET.bulan,
    }
  })
)

const progressPercent = computed(() =>
  activeTarget.value ? (stat.value.totalAudit / activeTarget.value) * 100 : 0
)

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

const akurasi = computed(() =>
  stat.value.totalAudit ? (stat.value.totalOk / stat.value.totalAudit) * 100 : 0
)

const komposisi = computed(() => [
  { label: 'Tuntas', value: stat.value.totalOk, color: '#10B981' },
  { label: 'Ada Temuan', value: stat.value.totalTemuan, color: '#F59E0B' },
])

const daysInMonth = computed(() =>
  new Date(ym.value.year, ym.value.monthIdx + 1, 0).getDate()
)

const dailyDistribution = computed(() => {
  const counts: Record<number, number> = {}
  for (const a of auditsBulan.value) {
    const d = parseInt(String(a.tanggal).slice(0, 2), 10)
    if (!isNaN(d)) counts[d] = (counts[d] || 0) + 1
  }
  return Array.from({ length: daysInMonth.value }, (_, i) => ({
    day: i + 1,
    count: counts[i + 1] || 0,
  }))
})

const maxDaily = computed(() => Math.max(...dailyDistribution.value.map(d => d.count), 1))

// Sisa hari kerja sampai akhir periode aktif (bulan atau quartal)
const sisaHariKerja = computed(() => {
  const now = new Date()
  const endIdx = mode.value === 'bulan' ? ym.value.monthIdx : quarterMonthIdxs.value[2]!
  const end = new Date(ym.value.year, endIdx + 1, 0)
  if (now > end) return 0

  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const periodStartIdx = mode.value === 'bulan' ? ym.value.monthIdx : quarterMonthIdxs.value[0]!
  const periodStart = new Date(ym.value.year, periodStartIdx, 1)
  const cursor = start > periodStart ? start : periodStart

  let count = 0
  for (const d = new Date(cursor); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) count++
  }
  return count
})

const paceNeeded = computed(() => {
  if (sisaHariKerja.value <= 0) return '-'
  const sisa = Math.max(activeTarget.value - stat.value.totalAudit, 0)
  return (sisa / sisaHariKerja.value).toFixed(1)
})

const filteredAudits = computed(() => {
  let rows = activeAudits.value
  if (filterHasil.value) {
    rows = rows.filter((a: any) => (a.hasil || '').toUpperCase() === filterHasil.value)
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    rows = rows.filter((a: any) =>
      [a.settingan, a.kategori, a.action, a.tanggal]
        .some((f: string) => (f || '').toLowerCase().includes(q))
    )
  }
  return rows
})

const endpointUrl = computed(() =>
  `${N8N_BASE_URL}${WEBHOOK_PATH}?user=${activePic.value}&month=${selectedMonth.value}`
)

// ─── Helper ──────────────────────────────────────────────────────────────────
const getHasilClass = (h: string) => {
  const s = (h || '').toUpperCase()
  if (s === 'OK') return 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300'
  if (s === 'TEMUAN') return 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300'
  return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
}

const getPicColor = (pic: string) => {
  const me = (currentUser.value?.pic_name || '').toUpperCase().trim()
  if (me && (pic || '').toUpperCase().trim() === me) {
    return currentUser.value?.color || 'bg-gray-400'
  }
  return 'bg-gray-400'
}

// ─── Fetch ───────────────────────────────────────────────────────────────────
const fetchAudit = async () => {
  if (!activePic.value) return
  loading.value = true
  error.value = ''
  warning.value = ''
  try {
    const res = await fetch(endpointUrl.value)
    if (!res.ok) throw new Error(`Server error: ${res.status}`)

    const raw = await res.json()
    const body = Array.isArray(raw) ? raw[0] : raw

    if (!body || typeof body !== 'object' || !Array.isArray(body.audits)) {
      warning.value =
        'Webhook merespons, tapi isinya tidak berisi field "audits". ' +
        'Cek Code node di n8n — kemungkinan masih memakai kode Daily Activity, ' +
        'atau node HTTP Request menarik sheet yang salah. Field yang diterima: ' +
        (body && typeof body === 'object'
          ? (Object.keys(body).join(', ') || '(kosong)')
          : String(body))
      data.value = { audits: [] }
    } else {
      data.value = body
    }
    lastUpdated.value = new Date().toLocaleTimeString('id-ID')
  } catch (e: any) {
    data.value = null
    error.value = e.message || 'Gagal mengambil data. Pastikan n8n sedang berjalan.'
  } finally {
    loading.value = false
  }
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    refreshInterval = setInterval(fetchAudit, 5 * 60 * 1000)
  } else {
    if (refreshInterval) clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// Ganti bulan -> ambil ulang (quartal ikut berubah otomatis).
// Ganti mode TIDAK perlu fetch: data 1 quartal sudah ada di memori.
watch([activePic, selectedMonth], () => fetchAudit())

onMounted(() => {
  if (activePic.value) {
    fetchAudit()
  } else {
    setTimeout(() => {
      if (!activePic.value) {
        loading.value = false
        error.value = 'Sesi pengguna tidak ditemukan. Silakan login ulang.'
      }
    }, 3000)
  }
  refreshInterval = setInterval(fetchAudit, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>
