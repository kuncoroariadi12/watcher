<template>
  <div class="min-h-screen bg-[#EEF0F5] flex items-center justify-center">
    <div class="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md mx-4">

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-xl font-bold text-gray-900">
          Selamat datang di Watcher
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Silahkan masuk dengan User MDM Anda untuk mengakses Watcher
        </p>
      </div>

      <!-- Form -->
      <div class="space-y-4">

        <!-- Username -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Username <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.username"
            type="text"
            placeholder="Masukkan Username Anda"
            @keyup.enter="handleLogin"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                   placeholder:text-gray-400 focus:outline-none focus:ring-2
                   focus:ring-red-400 focus:border-transparent transition"
          />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Password <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Masukkan password Anda"
              @keyup.enter="handleLogin"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                     placeholder:text-gray-400 focus:outline-none focus:ring-2
                     focus:ring-red-400 focus:border-transparent transition pr-10"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                     hover:text-gray-600 transition"
            >
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244
                     19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45
                     10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523
                     10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65
                     3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0
                     0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36
                     4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431
                     0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638
                     0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Ingat Saya -->
        <div class="flex items-center gap-2">
          <input
            v-model="form.remember"
            type="checkbox"
            id="remember"
            class="w-4 h-4 rounded border-gray-300 text-red-500
                   focus:ring-red-400 cursor-pointer"
          />
          <label for="remember" class="text-sm text-gray-600 cursor-pointer">
            Ingat saya
          </label>
        </div>

        <!-- Error Message -->
        <div v-if="errorMsg"
          class="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5
                 text-sm text-red-600 flex items-center gap-2">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          {{ errorMsg }}
        </div>

        <!-- Tombol Masuk -->
        <button
          @click="handleLogin"
          class="w-full bg-[#F03131] hover:bg-red-600 active:bg-red-700
                 text-white font-medium py-2.5 rounded-lg text-sm
                 transition duration-150 mt-2"
        >
          Masuk
        </button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { USERS } = useAuth()

const form = reactive({
  username : '',
  password : '',
  remember : false,
})

const showPassword = ref(false)
const errorMsg     = ref('')

const handleLogin = () => {
  errorMsg.value = ''

  if (!form.username || !form.password) {
    errorMsg.value = 'Username dan password wajib diisi'
    return
  }

  const user = USERS.find(
    u => u.username === form.username.toLowerCase() &&
         u.password === form.password
  )

  if (!user) {
    errorMsg.value = 'Username atau password salah'
    return
  }

  // Simpan user ke sessionStorage
  if (process.client) {
    sessionStorage.setItem('watcher_user', JSON.stringify(user))
  }

  navigateTo('/emails')
}
</script>