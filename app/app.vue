<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { init } = useDarkMode()
const { startSessionWatcher } = useAuth()

onMounted(() => {
  init()
  startSessionWatcher()
})
</script>
