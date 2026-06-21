<template>
  <div class="p-6 dark:bg-gray-900 min-h-screen min-w-0">

    <!-- Header -->
    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">Master Subdist</h2>
        <p class="text-sm text-gray-400 mt-0.5">Kelola kode area harga produk per subdist</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="toggleDark"
          class="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition">
          <svg v-if="!isDark" class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
          <svg v-else class="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- ===== M1-M5/MT Divisi Tabs ===== -->
    <div class="flex items-center gap-2 mb-5 flex-wrap">
      <button v-for="tab in divisiTabs" :key="tab.value"
        @click="activeDivisi = tab.value"
        :class="activeDivisi === tab.value
          ? 'bg-[#F03131] text-white border-[#F03131]'
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'"
        class="px-4 py-1.5 rounded-full text-sm font-medium border transition">
        {{ tab.label }}
      </button>
    </div>

    <!-- ===== UNDER MAINTENANCE (selain M3) ===== -->
    <div v-if="activeDivisi !== 'M3'" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm py-20 text-center">
      <div class="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg class="w-10 h-10 text-[#F03131]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"/>
        </svg>
      </div>
      <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-1">Under Maintenance</h3>
      <p class="text-gray-400 text-sm">
        Master Subdist untuk <span class="font-medium text-gray-600 dark:text-gray-300">{{ activeDivisi }}</span> sedang dalam pengembangan.
      </p>
    </div>

    <!-- ===== KONTEN M3 ===== -->
    <template v-else>

      <!-- Toolbar -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm min-w-0">
        <div class="px-5 pt-5 pb-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 class="font-semibold text-gray-800 dark:text-white">Daftar Subdist · M3</h3>
            <p class="text-xs text-gray-400 mt-1">{{ filteredSubdist.length }} dari {{ subdist.length }} subdist ditampilkan</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <!-- Search -->
            <div class="relative">
              <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input v-model="searchQuery" type="text" placeholder="Cari kode, nama, area..."
                class="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-red-300 w-56"/>
            </div>

            <!-- Filter Wilayah -->
            <div class="relative">
              <button @click="showFilterMenu = !showFilterMenu; showColumnMenu = false; showLockMenu = false; openHeaderMenu = null"
                class="flex items-center gap-2 px-3.5 py-2 border rounded-lg text-sm font-medium transition"
                :class="filterWilGrsm
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600 text-[#F03131] ring-1 ring-red-200 dark:ring-red-800'
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                </svg>
                {{ filterWilGrsm || 'Filter Wilayah' }}
              </button>

              <div v-if="showFilterMenu" class="fixed inset-0 z-30" @click="showFilterMenu = false"></div>
              <div v-if="showFilterMenu"
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 z-40 max-h-72 overflow-y-auto">
                <button @click="filterWilGrsm = ''; showFilterMenu = false"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  :class="!filterWilGrsm ? 'text-[#F03131] font-semibold bg-red-50/60 dark:bg-red-900/10' : 'text-gray-600 dark:text-gray-300'">
                  Semua Wilayah
                </button>
                <button v-for="w in wilGrsmOptions" :key="w" @click="filterWilGrsm = w; showFilterMenu = false"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  :class="filterWilGrsm === w ? 'text-[#F03131] font-semibold bg-red-50/60 dark:bg-red-900/10' : 'text-gray-600 dark:text-gray-300'">
                  {{ w }}
                </button>
              </div>
            </div>

            <!-- Pilih Kolom -->
            <div class="relative">
              <button @click="showColumnMenu = !showColumnMenu; showFilterMenu = false; showLockMenu = false; openHeaderMenu = null"
                class="flex items-center gap-2 px-3.5 py-2 border rounded-lg text-sm font-medium transition"
                :class="showColumnMenu
                  ? 'bg-gray-50 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-white'
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
                </svg>
                Kolom
                <span class="bg-red-100 dark:bg-red-900/40 text-[#F03131] text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {{ visibleColumns.length }}
                </span>
              </button>

              <div v-if="showColumnMenu" class="fixed inset-0 z-30" @click="showColumnMenu = false"></div>
              <div v-if="showColumnMenu"
                class="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 w-72 z-40 max-h-[28rem] flex flex-col">
                <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                  <p class="text-sm font-semibold text-gray-800 dark:text-white">Tampilkan Kolom</p>
                  <div class="flex items-center gap-3">
                    <button @click="visibleColumns = SUBDIST_COLUMNS.map(c => c.key)" class="text-xs text-[#F03131] hover:underline font-medium">Semua</button>
                    <button @click="visibleColumns = [...DEFAULT_VISIBLE_COLUMNS]" class="text-xs text-gray-400 hover:underline font-medium">Reset</button>
                  </div>
                </div>
                <div class="overflow-y-auto py-2 flex-1">
                  <p class="px-4 pt-1 pb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Identitas</p>
                  <label v-for="col in identityColumns" :key="col.key"
                    class="flex items-center gap-2.5 px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer">
                    <input type="checkbox" :value="col.key" v-model="visibleColumns"
                      :disabled="lockedColumns.includes(col.key)"
                      class="w-4 h-4 rounded accent-[#F03131] disabled:opacity-50"/>
                    <span class="text-sm text-gray-700 dark:text-gray-200">{{ col.label }}</span>
                    <span v-if="lockedColumns.includes(col.key)" class="text-[10px] text-gray-400 ml-auto">terkunci</span>
                  </label>

                  <p class="px-4 pt-3 pb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Wilayah</p>
                  <label v-for="col in wilayahColumns" :key="col.key"
                    class="flex items-center gap-2.5 px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer">
                    <input type="checkbox" :value="col.key" v-model="visibleColumns"
                      :disabled="lockedColumns.includes(col.key)"
                      class="w-4 h-4 rounded accent-[#F03131] disabled:opacity-50"/>
                    <span class="text-sm text-gray-700 dark:text-gray-200">{{ col.label }}</span>
                    <span v-if="lockedColumns.includes(col.key)" class="text-[10px] text-gray-400 ml-auto">terkunci</span>
                  </label>

                  <p class="px-4 pt-3 pb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Produk (Kode Area Harga)</p>
                  <label v-for="col in produkColumns" :key="col.key"
                    class="flex items-center gap-2.5 px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer">
                    <input type="checkbox" :value="col.key" v-model="visibleColumns"
                      :disabled="lockedColumns.includes(col.key)"
                      class="w-4 h-4 rounded accent-[#F03131] disabled:opacity-50"/>
                    <span class="text-sm text-gray-700 dark:text-gray-200">{{ col.label }}</span>
                    <span v-if="lockedColumns.includes(col.key)" class="text-[10px] text-gray-400 ml-auto">terkunci</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Kunci Kolom -->
            <div class="relative">
              <button @click="showLockMenu = !showLockMenu; showFilterMenu = false; showColumnMenu = false; openHeaderMenu = null"
                class="flex items-center gap-2 px-3.5 py-2 border rounded-lg text-sm font-medium transition"
                :class="lockedColumns.length
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800'
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                Kunci Kolom
                <span v-if="lockedColumns.length" class="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {{ lockedColumns.length }}
                </span>
              </button>

              <div v-if="showLockMenu" class="fixed inset-0 z-30" @click="showLockMenu = false"></div>
              <div v-if="showLockMenu"
                class="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 w-64 z-40 max-h-96 flex flex-col">
                <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                  <p class="text-sm font-semibold text-gray-800 dark:text-white">Kunci Kolom (Freeze)</p>
                  <p class="text-xs text-gray-400 mt-0.5">Kolom terkunci tetap terlihat saat scroll ke kanan</p>
                </div>
                <div class="overflow-y-auto py-2">
                  <label v-for="col in visibleColumnDefs" :key="col.key"
                    class="flex items-center gap-2.5 px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer">
                    <input type="checkbox" :value="col.key" v-model="lockedColumns"
                      class="w-4 h-4 rounded accent-blue-500"/>
                    <span class="text-sm text-gray-700 dark:text-gray-200">{{ col.label }}</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Tambah Subdist -->
            <button @click="openCreateModal"
              class="flex items-center gap-2 px-4 py-2 bg-[#F03131] hover:bg-red-600 text-white text-sm font-medium rounded-lg transition">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Tambah Subdist
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="py-16 text-center text-gray-400 text-sm">
          Memuat data subdist...
        </div>

        <!-- Error -->
        <div v-else-if="error" class="py-16 text-center">
          <svg class="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <p class="text-gray-400 text-sm">{{ error }}</p>
          <button @click="refreshSubdist" class="mt-3 text-xs font-medium text-[#F03131] hover:underline">Coba Lagi</button>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto subdist-table-wrap">
          <table class="text-sm border-collapse" style="min-width: 100%;">
            <thead>
              <tr class="border-t border-gray-100 dark:border-gray-700">
                <th v-for="col in visibleColumnDefs" :key="col.key"
                  class="relative px-3 py-2.5 text-left text-xs font-medium text-gray-400 whitespace-nowrap bg-gray-50 dark:bg-gray-800"
                  :class="[
                    lockedColumns.includes(col.key) ? 'sticky z-20 subdist-sticky-cell' : '',
                    isLastLockedColumn(col.key) ? 'subdist-lock-boundary' : '',
                  ]"
                  :style="cellStyle(col.key, true)">
                  <div class="flex items-center gap-1">
                    <span class="truncate">{{ col.label }}</span>

                    <!-- Tombol sort cepat -->
                    <button @click="toggleSort(col.key)"
                      class="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition flex-shrink-0"
                      :class="sortState.column === col.key ? 'text-[#F03131]' : 'text-gray-400'"
                      title="Urutkan">
                      <svg v-if="sortState.column === col.key && sortState.direction === 'asc'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/>
                      </svg>
                      <svg v-else-if="sortState.column === col.key && sortState.direction === 'desc'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                      </svg>
                      <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
                      </svg>
                    </button>

                    <!-- Tombol buka menu filter (search + checklist) -->
                    <button @click="toggleHeaderMenu(col.key)"
                      class="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition flex-shrink-0"
                      :class="columnFilters[col.key] && columnFilters[col.key]!.size > 0 ? 'text-[#F03131]' : 'text-gray-400'"
                      title="Filter">
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 01.8 1.6l-4.8 6.4v4a1 1 0 01-.4.8l-2 1.5A1 1 0 018 16.5V11L3.2 4.6A1 1 0 013 4z"/>
                      </svg>
                    </button>
                  </div>

                  <!-- Dropdown: nempel di kolom ini, ikut scroll natural (bukan fixed) -->
                  <div v-if="openHeaderMenu === col.key" class="fixed inset-0 z-[55]" @click="closeHeaderMenu"></div>
                  <div v-if="openHeaderMenu === col.key"
                    class="absolute top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[60] w-60 flex flex-col max-h-80 normal-case font-normal"
                    :class="isRightSideColumn(col.key) ? 'right-0' : 'left-0'">

                    <!-- Sort di dalam dropdown (sesuai contoh Excel) -->
                    <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                      <button @click="setSort(col.key, 'asc')"
                        class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        :class="sortState.column === col.key && sortState.direction === 'asc' ? 'text-[#F03131] font-semibold bg-red-50/60 dark:bg-red-900/10' : 'text-gray-600 dark:text-gray-300'">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9M3 12h5m6 8V4m0 16l-4-4m4 4l4-4"/>
                        </svg>
                        Urutkan A &rarr; Z
                      </button>
                      <button @click="setSort(col.key, 'desc')"
                        class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        :class="sortState.column === col.key && sortState.direction === 'desc' ? 'text-[#F03131] font-semibold bg-red-50/60 dark:bg-red-900/10' : 'text-gray-600 dark:text-gray-300'">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h5M3 8h9M3 12h13m-4-8v16m0 0l-4-4m4 4l4-4"/>
                        </svg>
                        Urutkan Z &rarr; A
                      </button>
                    </div>

                    <!-- Search box dalam dropdown -->
                    <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                      <input v-model="headerSearchText" type="text" placeholder="Cari nilai..."
                        class="w-full px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-xs
                               focus:outline-none focus:ring-2 focus:ring-red-300"/>
                    </div>

                    <!-- Checklist nilai unik -->
                    <div class="overflow-y-auto py-1.5 flex-1">
                      <label class="flex items-center gap-2 px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer">
                        <input type="checkbox" :checked="isAllValuesChecked(col.key)"
                          @change="toggleAllValues(col.key)"
                          class="w-3.5 h-3.5 rounded accent-[#F03131]"/>
                        <span class="text-xs font-medium text-gray-700 dark:text-gray-200">(Pilih Semua)</span>
                      </label>
                      <label v-for="val in columnUniqueValues(col.key)" :key="val"
                        class="flex items-center gap-2 px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer">
                        <input type="checkbox" :checked="isValueChecked(col.key, val)"
                          @change="toggleValueChecked(col.key, val)"
                          class="w-3.5 h-3.5 rounded accent-[#F03131]"/>
                        <span class="text-xs text-gray-600 dark:text-gray-300 truncate">{{ val }}</span>
                      </label>
                      <p v-if="columnUniqueValues(col.key).length === 0" class="text-xs text-gray-400 px-3 py-2">
                        Tidak ada nilai cocok
                      </p>
                    </div>

                    <!-- Footer aksi -->
                    <div class="px-3 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                      <button @click="clearColumnFilter(col.key)" class="text-xs text-gray-400 hover:underline font-medium">
                        Hapus Filter
                      </button>
                      <button @click="closeHeaderMenu" class="text-xs px-3 py-1.5 bg-[#F03131] hover:bg-red-600 text-white rounded-lg font-medium transition">
                        Terapkan
                      </button>
                    </div>
                  </div>
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-400 w-12 bg-gray-50 dark:bg-gray-800"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in pagedSubdist" :key="row.id"
                @contextmenu.prevent="openRowMenu($event, row)"
                class="subdist-row border-t border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition group">

                <td v-for="col in visibleColumnDefs" :key="col.key"
                  class="relative px-3 py-3 whitespace-nowrap text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/40"
                  :class="[
                    lockedColumns.includes(col.key) ? 'sticky z-10 subdist-sticky-cell' : '',
                    isLastLockedColumn(col.key) ? 'subdist-lock-boundary' : '',
                    col.key === 'kode_subdist' ? 'font-semibold text-gray-900 dark:text-white' : '',
                    col.key === 'nama_distributor' ? 'font-medium' : '',
                  ]"
                  :style="cellStyle(col.key, false)"
                  @dblclick="col.key !== 'kode_subdist' ? openCellEdit($event, row, col.key) : null">
                  <span v-if="editingCell && editingCell.id === row.id && editingCell.field === col.key"
                    class="invisible">{{ row[col.key] ?? '—' }}</span>
                  <span v-else class="block truncate" :title="String(row[col.key] ?? '')">
                    {{ row[col.key] ?? '—' }}
                  </span>

                  <!-- Popup edit inline: nempel ke sel ini, ikut scroll natural, auto-flip kalau dekat tepi -->
                  <div v-if="editingCell && editingCell.id === row.id && editingCell.field === col.key" class="fixed inset-0 z-[55]" @click="cancelCellEdit"></div>
                  <div v-if="editingCell && editingCell.id === row.id && editingCell.field === col.key"
                    class="absolute z-[60] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 p-3 w-64"
                    :class="cellEditFlipLeft ? 'right-0' : 'left-0'"
                    style="top: calc(100% + 6px)">
                    <p class="text-xs font-medium text-gray-400 mb-1.5">
                      Edit {{ getColumnLabel(editingCell.field) }} &middot; {{ editingCell.kodeSubdist }}
                    </p>
                    <div class="flex items-center gap-2">
                      <input :ref="(el) => { if (editingCell?.id === row.id && editingCell?.field === col.key) cellEditInput = el as HTMLInputElement }"
                        v-model="cellEditValue" type="text"
                        @keyup.enter="saveCellEdit" @keyup.esc="cancelCellEdit"
                        class="flex-1 min-w-0 px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-red-300"/>
                      <button @click="saveCellEdit"
                        class="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex-shrink-0" title="Simpan">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                        </svg>
                      </button>
                      <button @click="cancelCellEdit"
                        class="p-1.5 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-200 rounded-lg transition flex-shrink-0" title="Batal">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </td>

                <td class="px-3 py-3 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/40" @click.stop>
                  <button @click="openRowMenuFromButton($event, row)"
                    class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition opacity-0 group-hover:opacity-100">
                    <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                    </svg>
                  </button>
                </td>
              </tr>

              <tr v-if="filteredSubdist.length === 0">
                <td :colspan="visibleColumnDefs.length + 1" class="py-16 text-center">
                  <svg class="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9.75 9.75L14.25 14.25M14.25 9.75L9.75 14.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-gray-400 text-sm">Tidak ada subdist ditemukan</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="!loading && !error && filteredSubdist.length > 0"
          class="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between flex-wrap gap-3">
          <p class="text-xs text-gray-400">
            Menampilkan {{ pageStart + 1 }}–{{ Math.min(pageStart + pageSize, filteredSubdist.length) }} dari {{ filteredSubdist.length }}
          </p>
          <div class="flex items-center gap-1.5">
            <button @click="page = Math.max(1, page - 1)" :disabled="page === 1"
              class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              Sebelumnya
            </button>
            <span class="text-xs text-gray-500 px-2">Hal {{ page }} / {{ totalPages }}</span>
            <button @click="page = Math.min(totalPages, page + 1)" :disabled="page === totalPages"
              class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ===================== ROW CONTEXT MENU ===================== -->
    <Teleport to="body">
      <div v-if="rowMenuTarget" class="fixed inset-0 z-[55]" @click="closeRowMenu"></div>
      <div v-if="rowMenuTarget"
        class="fixed z-[60] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 w-44"
        :style="{ top: rowMenuPos.y + 'px', left: rowMenuPos.x + 'px' }">
        <button @click="copySelectedText"
          class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left">
          <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
          Salin
        </button>
        <div class="my-1 border-t border-gray-100 dark:border-gray-700"></div>
        <button @click="openEditModal(rowMenuTarget!)"
          class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left">
          <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          Edit
        </button>
        <button @click="confirmDelete(rowMenuTarget!)"
          class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-left">
          <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Hapus
        </button>
      </div>
    </Teleport>

    <!-- Toast: berhasil edit kolom -->
    <Teleport to="body">
      <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="toastMessage"
          class="fixed bottom-6 right-6 z-[70] bg-gray-900 dark:bg-gray-700 text-white text-sm px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5">
          <svg class="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
          </svg>
          {{ toastMessage }}
        </div>
      </transition>
    </Teleport>

    <!-- ===================== CREATE / EDIT MODAL ===================== -->
    <SubdistFormModal
      v-if="showFormModal"
      :mode="formMode"
      :initial-data="formInitialData"
      :saving="formSaving"
      :error="formError"
      @close="closeFormModal"
      @submit="handleFormSubmit"
    />

    <!-- ===================== DELETE CONFIRM MODAL ===================== -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="deleteTarget = null">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <div class="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-[#F03131]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3 class="font-bold text-gray-800 dark:text-white mb-1.5">Hapus Subdist?</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Subdist <span class="font-semibold text-gray-700 dark:text-gray-200">{{ deleteTarget.kode_subdist }} — {{ deleteTarget.nama_distributor }}</span>
            akan dihapus permanen dan tidak bisa dikembalikan.
          </p>
          <div class="flex items-center gap-2 justify-end">
            <button @click="deleteTarget = null"
              class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
              Batal
            </button>
            <button @click="performDelete" :disabled="deleting"
              class="px-4 py-2 text-sm font-medium bg-[#F03131] hover:bg-red-600 text-white rounded-lg transition disabled:opacity-60">
              {{ deleting ? 'Menghapus...' : 'Ya, Hapus' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useSubdist } from '~/composables/useSubdist'
import { useDarkMode } from '~/composables/useDarkMode'
import { useAuth } from '~/composables/useAuth'
import {
  SUBDIST_COLUMNS, DEFAULT_VISIBLE_COLUMNS, DEFAULT_LOCKED_COLUMNS,
} from '~/types/subdist'
import type { Subdist } from '~/types/subdist'
import SubdistFormModal from '~/components/subdist/SubdistFormModal.vue'

definePageMeta({ layout: 'dashboard' })

const { subdist, loading, error, fetchSubdist, refreshSubdist, createSubdist, updateSubdist, updateSubdistField, deleteSubdist, subscribeRealtime } = useSubdist()
const { isDark, toggle: toggleDark } = useDarkMode()
const { currentUser } = useAuth()

onMounted(() => {
  fetchSubdist()
  subscribeRealtime()
})

// ===================== DIVISI TABS =====================
const divisiTabs = [
  { label: 'M1', value: 'M1' }, { label: 'M2', value: 'M2' },
  { label: 'M3', value: 'M3' }, { label: 'M4', value: 'M4' },
  { label: 'M5', value: 'M5' }, { label: 'MT', value: 'MT' },
]
const activeDivisi = ref('M3')

// ===================== SEARCH & FILTER (toolbar) =====================
const searchQuery   = ref('')
const filterWilGrsm = ref('')
const showFilterMenu = ref(false)

const wilGrsmOptions = computed(() => {
  const set = new Set(subdist.value.map(s => s.wil_grsm).filter(Boolean) as string[])
  return Array.from(set).sort()
})

// ===================== SORT (header kolom) =====================
const sortState = ref<{ column: keyof Subdist | null; direction: 'asc' | 'desc' | null }>({
  column: null, direction: null,
})

const setSort = (column: keyof Subdist, direction: 'asc' | 'desc') => {
  sortState.value = { column, direction }
  closeHeaderMenu()
}

const toggleSort = (column: keyof Subdist) => {
  if (sortState.value.column !== column) {
    sortState.value = { column, direction: 'asc' }
  } else if (sortState.value.direction === 'asc') {
    sortState.value = { column, direction: 'desc' }
  } else {
    sortState.value = { column: null, direction: null } // kembali ke urutan default
  }
}

// ===================== FILTER PER KOLOM (header dropdown, gaya Excel AutoFilter) =====================
const openHeaderMenu   = ref<keyof Subdist | null>(null)
const headerSearchText = ref('')
// Map kolom -> Set nilai yang DIPILIH untuk ditampilkan. Kolom tanpa entry = tidak difilter (tampilkan semua).
const columnFilters = ref<Partial<Record<keyof Subdist, Set<string>>>>({})

const toggleHeaderMenu = (col: keyof Subdist) => {
  if (openHeaderMenu.value === col) {
    closeHeaderMenu()
    return
  }
  showFilterMenu.value = false
  showColumnMenu.value = false
  showLockMenu.value = false
  openHeaderMenu.value = col
  headerSearchText.value = ''
}
const closeHeaderMenu = () => {
  openHeaderMenu.value = null
  headerSearchText.value = ''
}

// Dropdown dibuka ke kiri (bukan ke kanan) untuk kolom-kolom yang ada di paruh kanan
// tabel, supaya tidak overflow keluar tepi kanan layar.
const isRightSideColumn = (key: keyof Subdist) => {
  const idx = visibleColumnDefs.value.findIndex(c => c.key === key)
  return idx >= 0 && idx >= Math.ceil(visibleColumnDefs.value.length / 2)
}

// Nilai unik yang tersedia untuk sebuah kolom, dihitung dari data SEBELUM filter kolom itu sendiri
// (supaya checklist tetap menampilkan semua opsi yang relevan), lalu disaring oleh search box dropdown.
const columnUniqueValues = (col: keyof Subdist): string[] => {
  const baseRows = subdist.value
  const set = new Set<string>()
  for (const row of baseRows) {
    const v = row[col]
    if (v !== null && v !== undefined && String(v).trim() !== '') set.add(String(v))
  }
  let values = Array.from(set).sort()
  if (headerSearchText.value.trim()) {
    const q = headerSearchText.value.toLowerCase()
    values = values.filter(v => v.toLowerCase().includes(q))
  }
  return values
}

const isValueChecked = (col: keyof Subdist, val: string) => {
  const f = columnFilters.value[col]
  return !f || f.has(val) // kalau belum ada filter sama sekali = semua dianggap tercentang
}

const isAllValuesChecked = (col: keyof Subdist) => {
  const visible = columnUniqueValues(col)
  return visible.every(v => isValueChecked(col, v))
}

const toggleValueChecked = (col: keyof Subdist, val: string) => {
  const allValues = new Set(
    subdist.value.map(r => r[col]).filter(v => v !== null && v !== undefined && String(v).trim() !== '').map(v => String(v))
  )
  let current = columnFilters.value[col] ? new Set(columnFilters.value[col]) : new Set(allValues)
  if (current.has(val)) current.delete(val)
  else current.add(val)
  columnFilters.value = { ...columnFilters.value, [col]: current }
}

const toggleAllValues = (col: keyof Subdist) => {
  const visible = columnUniqueValues(col)
  const allChecked = isAllValuesChecked(col)
  const allValues = new Set(
    subdist.value.map(r => r[col]).filter(v => v !== null && v !== undefined && String(v).trim() !== '').map(v => String(v))
  )
  let current = columnFilters.value[col] ? new Set(columnFilters.value[col]) : new Set(allValues)
  if (allChecked) {
    // uncheck semua yang sedang terlihat di hasil pencarian dropdown
    for (const v of visible) current.delete(v)
  } else {
    for (const v of visible) current.add(v)
  }
  columnFilters.value = { ...columnFilters.value, [col]: current }
}

const clearColumnFilter = (col: keyof Subdist) => {
  const updated = { ...columnFilters.value }
  delete updated[col]
  columnFilters.value = updated
  closeHeaderMenu()
}

const filteredSubdist = computed(() => {
  let result = subdist.value

  if (filterWilGrsm.value) {
    result = result.filter(s => s.wil_grsm === filterWilGrsm.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(s =>
      String(s.kode_subdist).includes(q) ||
      s.nama_distributor?.toLowerCase().includes(q) ||
      s.area?.toLowerCase().includes(q) ||
      s.region?.toLowerCase().includes(q) ||
      s.wil_grsm?.toLowerCase().includes(q)
    )
  }

  // Filter checklist per kolom (Excel AutoFilter style)
  for (const [col, allowedSet] of Object.entries(columnFilters.value) as [keyof Subdist, Set<string> | undefined][]) {
    if (!allowedSet) continue
    result = result.filter(s => {
      const v = s[col]
      const str = v === null || v === undefined ? '' : String(v)
      return allowedSet.has(str)
    })
  }

  // Sort
  if (sortState.value.column && sortState.value.direction) {
    const col = sortState.value.column
    const dir = sortState.value.direction === 'asc' ? 1 : -1
    result = [...result].sort((a, b) => {
      const va = a[col]
      const vb = b[col]
      if (va === null || va === undefined) return 1
      if (vb === null || vb === undefined) return -1
      // Angka dibandingkan numerik kalau keduanya numerik, selain itu string
      const na = Number(va), nb = Number(vb)
      if (!isNaN(na) && !isNaN(nb) && va !== '' && vb !== '') {
        return (na - nb) * dir
      }
      return String(va).localeCompare(String(vb), 'id') * dir
    })
  }

  return result
})

// ===================== PAGINATION =====================
const page = ref(1)
const pageSize = 25
const totalPages = computed(() => Math.max(1, Math.ceil(filteredSubdist.value.length / pageSize)))
const pageStart = computed(() => (page.value - 1) * pageSize)
const pagedSubdist = computed(() => filteredSubdist.value.slice(pageStart.value, pageStart.value + pageSize))

watch([searchQuery, filterWilGrsm, columnFilters, sortState], () => { page.value = 1 }, { deep: true })

// ===================== COLUMN PICKER =====================
const visibleColumns = ref<(keyof Subdist)[]>([...DEFAULT_VISIBLE_COLUMNS])
const lockedColumns  = ref<(keyof Subdist)[]>([...DEFAULT_LOCKED_COLUMNS])
const showColumnMenu = ref(false)
const showLockMenu   = ref(false)

const identityColumns = SUBDIST_COLUMNS.filter(c => c.group === 'identitas')
const wilayahColumns  = SUBDIST_COLUMNS.filter(c => c.group === 'wilayah')
const produkColumns   = SUBDIST_COLUMNS.filter(c => c.group === 'produk')

const visibleColumnDefs = computed(() =>
  SUBDIST_COLUMNS.filter(c => visibleColumns.value.includes(c.key))
)

// Lebar tetap per kolom (px) — supaya offset sticky bisa dihitung presisi.
// Kolom dengan teks panjang (nama distributor, email) diberi lebar lebih.
const colWidth = (key: keyof Subdist): number => {
  if (key === 'kode_subdist') return 130
  if (key === 'nama_distributor') return 260
  if (key === 'area' || key === 'region' || key === 'wil_grsm') return 160
  if (key === 'email') return 220
  if (key === 'sub_region_1' || key === 'sub_region_2') return 150
  return 130 // kolom produk (kode area harga)
}

// Style per sel: lebar tetap selalu, plus offset 'left' jika kolom ini dikunci.
// Background solid & garis batas freeze ditangani lewat CSS class (lihat <style> di bawah),
// bukan inline, supaya tetap bisa react terhadap hover state baris.
const isLastLockedColumn = (key: keyof Subdist) => {
  if (!lockedColumns.value.includes(key)) return false
  const lockedInOrder = visibleColumnDefs.value
    .map(c => c.key)
    .filter(k => lockedColumns.value.includes(k))
  return lockedInOrder[lockedInOrder.length - 1] === key
}

const cellStyle = (key: keyof Subdist, isHeader: boolean) => {
  const width = colWidth(key)
  const style: Record<string, string> = {
    width: width + 'px',
    minWidth: width + 'px',
    maxWidth: width + 'px',
  }
  if (lockedColumns.value.includes(key)) {
    let offset = 0
    for (const col of visibleColumnDefs.value) {
      if (col.key === key) break
      if (lockedColumns.value.includes(col.key)) offset += colWidth(col.key)
    }
    style.left = offset + 'px'
  }
  return style
}

const getColumnLabel = (key: keyof Subdist) => SUBDIST_COLUMNS.find(c => c.key === key)?.label || key

// ===================== ROW CONTEXT MENU (klik kanan) =====================
const rowMenuTarget = ref<Subdist | null>(null)
const rowMenuPos = ref({ x: 0, y: 0 })
const rowMenuSelectedText = ref('')

const openRowMenu = (e: MouseEvent, row: Subdist) => {
  // Tangkap teks yang sedang di-block/seleksi TEPAT saat klik kanan terjadi,
  // sebelum menu custom kita render (yang bisa membuat seleksi browser hilang).
  rowMenuSelectedText.value = window.getSelection()?.toString().trim() || ''

  rowMenuTarget.value = row
  const menuW = 176, menuH = 140
  let x = e.clientX, y = e.clientY
  if (x + menuW > window.innerWidth) x = window.innerWidth - menuW - 8
  if (y + menuH > window.innerHeight) y = window.innerHeight - menuH - 8
  rowMenuPos.value = { x, y }
}
const openRowMenuFromButton = (e: MouseEvent, row: Subdist) => {
  rowMenuSelectedText.value = ''
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  rowMenuTarget.value = row
  rowMenuPos.value = { x: rect.right - 176, y: rect.bottom + 4 }
}
const closeRowMenu = () => { rowMenuTarget.value = null }

const copySelectedText = async () => {
  // Kalau ada teks yang di-block, salin itu. Kalau tidak ada seleksi sama sekali
  // (klik kanan tanpa block), salin Kode Subdist sebagai fallback yang paling berguna.
  const textToCopy = rowMenuSelectedText.value || String(rowMenuTarget.value?.kode_subdist ?? '')
  if (!textToCopy) {
    closeRowMenu()
    return
  }
  try {
    await navigator.clipboard.writeText(textToCopy)
    showToast(`Disalin: ${textToCopy}`)
  } catch {
    showToast('Gagal menyalin ke clipboard')
  }
  closeRowMenu()
}

// ===================== INLINE CELL EDIT (double click) =====================
const editingCell = ref<{ id: string; field: keyof Subdist; kodeSubdist: number } | null>(null)
const cellEditValue = ref('')
const cellEditFlipLeft = ref(false) // true = popup dibuka ke kiri (sel terlalu dekat tepi kanan layar)
const cellEditInput = ref<HTMLInputElement | null>(null)
const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

const showToast = (msg: string) => {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMessage.value = '' }, 2800)
}

const openCellEdit = async (event: MouseEvent, row: Subdist, field: keyof Subdist) => {
  if (field === 'kode_subdist') return // kode subdist tidak diedit inline, lewat form edit saja
  rowMenuTarget.value = null
  editingCell.value = { id: row.id, field, kodeSubdist: row.kode_subdist }
  cellEditValue.value = (row[field] as string) ?? ''

  // Popup ditempel secara relatif ke sel (lihat template <td>) sehingga otomatis
  // ikut scroll bersama sel-nya. Kita hanya perlu tahu apakah harus dibuka ke kiri
  // (kalau sel terlalu dekat tepi kanan layar, popup w-64/256px akan overflow ke kanan).
  const cellEl = (event.currentTarget as HTMLElement)
  const rect = cellEl.getBoundingClientRect()
  const popupW = 256
  cellEditFlipLeft.value = (rect.left + popupW > window.innerWidth - 12)

  await nextTick()
  cellEditInput.value?.focus()
}

const cancelCellEdit = () => { editingCell.value = null }

const saveCellEdit = async () => {
  if (!editingCell.value) return
  const { id, field, kodeSubdist } = editingCell.value
  const result = await updateSubdistField(id, field, cellEditValue.value.trim() || null, currentUser.value.name)
  editingCell.value = null
  if (result.ok) {
    showToast(`Berhasil mengubah ${getColumnLabel(field)} pada subdist ${kodeSubdist}`)
  } else {
    showToast(result.error || 'Gagal menyimpan perubahan')
  }
}

// ===================== CREATE / EDIT FORM MODAL =====================
const showFormModal   = ref(false)
const formMode        = ref<'create' | 'edit'>('create')
const formInitialData = ref<Partial<Subdist> | null>(null)
const formEditId      = ref<string | null>(null)
const formSaving      = ref(false)
const formError       = ref('')

const openCreateModal = () => {
  formMode.value = 'create'
  formInitialData.value = { divisi: 'M3' }
  formEditId.value = null
  formError.value = ''
  showFormModal.value = true
}

const openEditModal = (row: Subdist) => {
  formMode.value = 'edit'
  formInitialData.value = { ...row }
  formEditId.value = row.id
  formError.value = ''
  showFormModal.value = true
  closeRowMenu()
}

const closeFormModal = () => {
  showFormModal.value = false
  formInitialData.value = null
  formEditId.value = null
  formError.value = ''
}

const handleFormSubmit = async (payload: Partial<Subdist>) => {
  formSaving.value = true
  formError.value = ''
  let result
  if (formMode.value === 'create') {
    result = await createSubdist({ ...payload, divisi: 'M3' })
  } else {
    result = await updateSubdist(formEditId.value as string, payload, currentUser.value.name)
  }
  formSaving.value = false
  if (result.ok) {
    showToast(formMode.value === 'create' ? 'Subdist baru berhasil ditambahkan' : 'Subdist berhasil diperbarui')
    closeFormModal()
  } else {
    formError.value = result.error || 'Gagal menyimpan data'
  }
}

// ===================== DELETE =====================
const deleteTarget = ref<Subdist | null>(null)
const deleting = ref(false)

const confirmDelete = (row: Subdist) => {
  deleteTarget.value = row
  closeRowMenu()
}

const performDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  const result = await deleteSubdist(deleteTarget.value.id)
  deleting.value = false
  if (result.ok) {
    showToast(`Subdist ${deleteTarget.value.kode_subdist} berhasil dihapus`)
    deleteTarget.value = null
  } else {
    showToast(result.error || 'Gagal menghapus subdist')
  }
}

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<style scoped>
/* Variabel warna untuk kolom yang dikunci (sticky) — solid, bukan transparan,
   supaya kolom di belakangnya tidak "bocor"/tembus saat di-scroll. */
.subdist-table-wrap {
  --subdist-th-bg: #F9FAFB;
  --subdist-td-bg: #FFFFFF;
  --subdist-td-bg-hover: #F9FAFB;
  --subdist-lock-border: #D1D5DB;
}
</style>

<style>
/* Override dark mode di stylesheet GLOBAL (bukan scoped) supaya selector ".dark .subdist-table-wrap"
   tetap utuh satu kesatuan saat di-compile, bukan terpecah jadi ".dark" + ".subdist-table-wrap[data-v-xxx]"
   terpisah (yang menyebabkan specificity-nya kalah dan dark mode gagal ter-apply). */
.dark .subdist-table-wrap {
  --subdist-th-bg: #1F2937;
  --subdist-td-bg: #1F2937;
  --subdist-td-bg-hover: #283548;
  --subdist-lock-border: #4B5563;
}
</style>

<!-- <style scoped>
/* Sel sticky butuh background SOLID (bukan transparan) agar konten kolom
   lain yang di-scroll di baliknya benar-benar tertutup, bukan transparan. */
.subdist-sticky-cell {
  background-color: var(--subdist-td-bg) !important;
}
.subdist-row:hover .subdist-sticky-cell {
  background-color: var(--subdist-td-bg-hover) !important;
}

/* Garis pemisah tegas: sampai mana batas kolom yang dikunci (freeze) */
.subdist-lock-boundary {
  border-right: 2px solid var(--subdist-lock-border);
}
</style> -->