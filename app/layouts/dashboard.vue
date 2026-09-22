<template>
  <div class="flex min-h-screen bg-[#F5F6FA] dark:bg-gray-900">

    <!-- ===== TOP BAR (mobile & tablet saja, < 1024px) ===== -->
    <header
      class="lg:hidden fixed top-0 inset-x-0 z-30 h-14 pt-[env(safe-area-inset-top)] box-content
             bg-white/95 dark:bg-gray-800/95 backdrop-blur border-b border-gray-100 dark:border-gray-700
             flex items-center gap-3 px-3">
      <button type="button" @click="sidebarOpen = true"
        class="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Buka menu" :aria-expanded="sidebarOpen" aria-controls="watcher-sidebar">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <img src="/images/logo-watcher.png" alt="" width="27" height="28"
           class="h-7 w-auto dark:hidden" />
      <img src="/images/logo-watcher-dark.png" alt="" width="27" height="28" loading="lazy"
           class="h-7 w-auto hidden dark:block" />
      <span class="brand-wordmark text-[17px] leading-none text-[#0A1642] dark:text-white">Watcher</span>

      <span class="ml-auto text-xs font-medium text-gray-500 dark:text-gray-400 truncate max-w-[40%]">
        {{ pageTitle }}
      </span>
    </header>

    <!-- ===== BACKDROP (mobile, saat menu terbuka) ===== -->
    <Transition
      enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200" leave-to-class="opacity-0">
      <div v-if="sidebarOpen" class="lg:hidden fixed inset-0 z-40 bg-black/40"
           @click="sidebarOpen = false" aria-hidden="true"></div>
    </Transition>

    <!-- ===== SIDEBAR =====
         Desktop (>= 1024px): selalu tampil, fixed di kiri.
         Mobile: laci (drawer) yang geser dari kiri. -->
    <aside id="watcher-sidebar"
      class="w-64 lg:w-52 bg-white dark:bg-gray-800 flex flex-col fixed inset-y-0 left-0 shadow-sm
             z-50 lg:z-10 transition-transform duration-200 ease-out
             pt-[env(safe-area-inset-top)] lg:pt-0 lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'">

      <!-- BRAND -->
      <div class="flex items-center gap-3 px-5 pt-6 pb-4">
        <img src="/images/logo-watcher.png" alt="Logo Watcher"
             width="39" height="40" decoding="async" fetchpriority="high"
             class="h-10 w-auto shrink-0 dark:hidden" />
        <img src="/images/logo-watcher-dark.png" alt="" aria-hidden="true"
             width="39" height="40" decoding="async" loading="lazy"
             class="h-10 w-auto shrink-0 hidden dark:block" />

        <div class="min-w-0 flex-1">
          <h1 class="brand-wordmark text-[20px] leading-none text-[#0A1642] dark:text-white">
            Watcher
          </h1>
          <div class="flex items-center gap-1.5 mt-1.5">
            <span class="h-[3px] w-5 rounded-full bg-[#C6232B]"></span>
            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 leading-none">
              MDM Portal
            </p>
          </div>
        </div>

        <!-- Tombol tutup: hanya di mobile -->
        <button type="button" @click="sidebarOpen = false"
          class="lg:hidden -mr-2 p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Tutup menu">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <nav class="flex-1 px-3 space-y-1 mt-2 overflow-y-auto" aria-label="Menu utama">
        <NuxtLink to="/emails"
          :class="route.path === '/emails'
            ? 'bg-[#F03131] text-white'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          Emails
        </NuxtLink>

        <NuxtLink to="/activity"
          :class="route.path === '/activity'
            ? 'bg-[#F03131] text-white'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
          </svg>
          Daily Activity
        </NuxtLink>

        <NuxtLink to="/performance"
          :class="route.path.startsWith('/performance')
            ? 'bg-[#F03131] text-white'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/>
          </svg>
          Performance
        </NuxtLink>

        <NuxtLink to="/audit"
          :class="route.path.startsWith('/audit')
            ? 'bg-[#F03131] text-white'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"/>
          </svg>
          Audit
        </NuxtLink>

        <NuxtLink to="/subdist"
          :class="route.path === '/subdist'
            ? 'bg-[#F03131] text-white'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819"/>
          </svg>
          Subdist
        </NuxtLink>

        <NuxtLink to="/settings"
          :class="route.path === '/settings'
            ? 'bg-[#F03131] text-white'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Settings
        </NuxtLink>

        <button @click="logout"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                 font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Exit
        </button>
      </nav>

      <div class="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-gray-100 dark:border-gray-700 flex items-center gap-3">
        <div :class="currentUser.color"
          class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {{ currentUser.initial }}
        </div>
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-800 dark:text-white truncate">{{ currentUser.name }}</p>
          <p class="text-xs text-gray-400 truncate">
            {{ currentUser.title }} - {{ currentUser.divisi.join(', ') }}
          </p>
        </div>
      </div>
    </aside>

    <!-- ===== MAIN CONTENT ===== -->
    <main class="watcher-main lg:ml-52 flex-1 min-w-0 overflow-x-hidden
                 pt-[calc(3.5rem+env(safe-area-inset-top))] lg:pt-0">
      <slot />
    </main>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { currentUser, logout } = useAuth()

// ── Drawer menu mobile ─────────────────────────────────────────────
const sidebarOpen = ref(false)

// Judul halaman di top bar mobile
const TITLES: Record<string, string> = {
  '/emails': 'Emails',
  '/activity': 'Daily Activity',
  '/performance': 'Performance',
  '/audit': 'Audit',
  '/subdist': 'Subdist',
  '/settings': 'Settings',
}
const pageTitle = computed(() => {
  const key = Object.keys(TITLES).find(k => route.path.startsWith(k))
  return key ? TITLES[key] : ''
})

// Tutup menu otomatis setelah pindah halaman
watch(() => route.fullPath, () => { sidebarOpen.value = false })

// Kunci scroll halaman di belakang saat menu terbuka
watch(sidebarOpen, (open) => {
  if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
})

// Tutup dengan tombol Escape; reset kalau layar dilebarkan ke desktop
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') sidebarOpen.value = false }
let mq: MediaQueryList | null = null
const onMq = (e: MediaQueryListEvent) => { if (e.matches) sidebarOpen.value = false }

onMounted(() => {
  window.addEventListener('keydown', onKey)
  mq = window.matchMedia('(min-width: 1024px)')
  mq.addEventListener('change', onMq)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  mq?.removeEventListener('change', onMq)
  document.body.style.overflow = ''
})
</script>

<style>
/* ── Wordmark Watcher ─────────────────────────────────────────────
   Montserrat ExtraBold, di-subset hanya huruf W A T C H E R.
   Kalau nanti teks brand diubah, font perlu di-subset ulang. */
@font-face {
  font-family: 'Watcher Brand';
  src: url('/fonts/montserrat-800-watcher.woff2') format('woff2');
  font-weight: 800;
  font-style: normal;
  font-display: swap;
}

.brand-wordmark {
  font-family: 'Watcher Brand', ui-sans-serif, system-ui, sans-serif;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* ── Penyesuaian mobile untuk SEMUA halaman ───────────────────────
   Berlaku otomatis tanpa perlu mengubah tiap halaman. */
@media (max-width: 639px) {
  /* Padding halaman p-6 (24px) terlalu boros di HP -> 16px */
  .watcher-main > div {
    padding: 1rem;
  }
}

@media (max-width: 1023px) {
  /* Tinggi minimum dikurangi tinggi top bar supaya tidak ada scroll kosong */
  .watcher-main > div.min-h-screen {
    min-height: calc(100dvh - 3.5rem - env(safe-area-inset-top));
  }

  /* iPhone otomatis zoom kalau font input < 16px. Ini mencegahnya. */
  .watcher-main input:not([type="checkbox"]):not([type="radio"]),
  .watcher-main select,
  .watcher-main textarea {
    font-size: 16px;
  }

  /* Tabel lebar: jangan dipaksa sempit, biarkan bisa di-scroll ke samping */
  .watcher-main table th,
  .watcher-main table td {
    white-space: nowrap;
  }
}

/* Baris yang bisa digeser (mis. tab divisi di HP) tanpa scrollbar kelihatan */
.no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }

@media (prefers-reduced-motion: reduce) {
  #watcher-sidebar { transition: none; }
}
</style>
