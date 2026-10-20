<template>
  <div />
</template>

<script setup lang="ts">
// Penjaga login (auth.global) sudah berjalan lebih dulu; halaman ini hanya meneruskan ke Emails.
definePageMeta({
  layout: false,
  middleware: () => navigateTo('/emails', { replace: true }),
})
</script>
