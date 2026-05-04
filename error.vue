<template>
  <div class="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
    <div class="text-center px-4">
      <div class="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-12 h-12 text-[#F03131]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <p class="text-6xl font-black text-[#F03131] mb-2">{{ error?.statusCode || 404 }}</p>
      <h1 class="text-xl font-bold text-gray-800 mb-2">
        {{ error?.statusCode === 404 ? 'Halaman Tidak Ditemukan' : 'Terjadi Kesalahan' }}
      </h1>
      <p class="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
        {{ error?.statusCode === 404
          ? 'Halaman yang kamu cari tidak ada atau sudah dipindahkan.'
          : 'Terjadi kesalahan yang tidak terduga. Coba refresh halaman.' }}
      </p>
      <button @click="handleBack"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F03131] hover:bg-red-600
               text-white text-sm font-medium rounded-lg transition">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Kembali ke Dashboard
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})

const handleBack = () => {
  clearError({ redirect: '/emails' })
}
</script>