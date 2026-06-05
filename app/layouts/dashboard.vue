<template>
  <div class="flex min-h-screen bg-[#F5F6FA] dark:bg-gray-900">

    <!-- SIDEBAR -->
    <aside class="w-52 bg-white dark:bg-gray-800 flex flex-col fixed h-full shadow-sm z-10">
      <div class="px-5 pt-6 pb-4">
        <h1 class="text-2xl font-bold text-[#F03131]">Watcher</h1>
        <p class="text-xs text-gray-400 mt-0.5">MDM Portal</p>
      </div>

      <nav class="flex-1 px-3 space-y-1 mt-2">
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

      <div class="px-4 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3">
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

    <!-- MAIN CONTENT -->
    <main class="ml-52 flex-1">
      <slot />
    </main>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { currentUser, logout } = useAuth()
</script>