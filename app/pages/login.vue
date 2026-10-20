<template>
  <div class="relative min-h-screen min-h-[100dvh] flex items-center justify-center overflow-hidden px-4 py-10">

    <!-- Latar: foto kantor (letakkan di public/images/login-bg.jpg), diredupkan.
         Kalau fotonya belum ada, otomatis tampil gradasi biru tua Watcher. -->
    <div class="login-bg absolute inset-0" aria-hidden="true"></div>
    <div class="absolute inset-0 bg-[#0A1642]/55 backdrop-blur-[10px]" aria-hidden="true"></div>
    <div class="login-vignette absolute inset-0" aria-hidden="true"></div>

    <main class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-9">

      <!-- Brand -->
      <div class="flex items-center gap-3.5 mb-7">
        <img src="/images/logo-watcher.png" alt="Logo Watcher"
             width="46" height="48" decoding="async" fetchpriority="high"
             class="h-12 w-auto shrink-0" />
        <div>
          <p class="login-wordmark text-[26px] leading-none text-[#0A1642]">Watcher</p>
          <div class="flex items-center gap-1.5 mt-2">
            <span class="h-[3px] w-5 rounded-full bg-[#C6232B]"></span>
            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 leading-none">MDM Portal</p>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h1 class="text-xl font-bold text-gray-900">Selamat datang di Watcher</h1>
        <p class="text-sm text-gray-500 mt-1">
          Silahkan masuk dengan akun MG Anda untuk mengakses Watcher
        </p>
      </div>

      <div v-if="expired" role="status"
        class="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-800">
        Sesi Anda sudah berakhir. Silakan masuk kembali.
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin" novalidate>

        <div>
          <label for="employeeId" class="block text-sm font-medium text-gray-700 mb-1">
            Employee ID <span class="text-red-500">*</span>
          </label>
          <input
            id="employeeId"
            v-model="form.employeeId"
            type="text"
            placeholder="Contoh: MG139999"
            autocomplete="username"
            autocapitalize="off"
            spellcheck="false"
            :disabled="loading"
            :class="inputClass"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Password <span class="text-red-500">*</span>
          </label>
          <UiPasswordInput
            id="password"
            v-model="form.password"
            placeholder="Masukkan password Anda"
            autocomplete="current-password"
            :disabled="loading"
            :input-class="inputClass"
          />
        </div>

        <div>
          <label class="flex items-center gap-2 cursor-pointer w-fit">
            <input v-model="form.remember" type="checkbox"
              class="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-400 cursor-pointer" />
            <span class="text-sm text-gray-600">Ingat saya</span>
          </label>
        </div>

        <div v-if="errorMsg" role="alert"
          class="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-600 flex items-start gap-2">
          <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <span>{{ errorMsg }}</span>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-[#F03131] hover:bg-red-600 active:bg-red-700 text-white font-medium py-2.5
                 rounded-lg text-sm transition duration-150 mt-2 flex items-center justify-center gap-2
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400
                 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {{ loading ? 'Memverifikasi...' : 'Masuk' }}
        </button>

      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()

const form = reactive({
  employeeId : '',
  password   : '',
  remember   : true,
})

const errorMsg = ref('')
const loading  = ref(false)
const expired  = computed(() => route.query.expired === '1')

// text-base di HP mencegah iPhone zoom otomatis saat input difokuskan
const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-base sm:text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 ' +
  'focus:border-transparent transition disabled:bg-gray-50 disabled:text-gray-400'

const handleLogin = async () => {
  if (loading.value) return
  errorMsg.value = ''

  if (!form.employeeId.trim() || !form.password) {
    errorMsg.value = 'Employee ID dan password wajib diisi'
    return
  }

  loading.value = true
  const result = await loginWithCredentials(form.employeeId.trim(), form.password, form.remember)
  loading.value = false

  if (!result.ok) {
    errorMsg.value = result.error ?? 'Login gagal, coba lagi'
    form.password = ''
    return
  }

  await navigateTo(safeRedirect(route.query.redirect) ?? '/emails', { replace: true })
}
</script>

<style>
@font-face {
  font-family: 'Watcher Brand';
  src: url('/fonts/montserrat-800-watcher.woff2') format('woff2');
  font-weight: 800;
  font-style: normal;
  font-display: swap;
}

.login-wordmark {
  font-family: 'Watcher Brand', ui-sans-serif, system-ui, sans-serif;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* Foto kantor di lapisan paling bawah; gradasi jadi cadangan bila foto belum ada. */
.login-bg {
  background-image:
    url('/images/login-bg.jpg'),
    linear-gradient(135deg, #0A1642 0%, #13224f 55%, #2b1220 100%);
  background-size: cover;
  background-position: center;
}

/* Tepi layar sedikit lebih gelap supaya mata tertuju ke kartu login */
.login-vignette {
  background: radial-gradient(ellipse at center, rgba(5, 10, 30, 0) 40%, rgba(5, 10, 30, 0.45) 100%);
}
</style>