<template>
  <div class="p-6 dark:bg-gray-900 min-h-screen">

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">
          {{ greeting }}, {{ currentUser.name.split(' ')[0] }}!
        </h2>
        <p class="text-sm text-gray-400 mt-0.5">{{ currentDateTime }}</p>
      </div>
      <div class="flex items-center gap-2">
        <!-- Notif -->
        <button class="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition">
          <svg class="w-5 h-5 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </button>
        <!-- Dark mode toggle -->
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

    <!-- Reminder Banner -->
    <div v-if="pendingInMyDivision.length > 0"
      class="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-4 mb-6 flex items-start gap-3">
      <svg class="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
      <div>
        <p class="text-sm font-semibold text-amber-800 dark:text-amber-300">Reminder!</p>
        <p class="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
          Terdapat
          <span class="font-bold text-[#F03131]">{{ pendingInMyDivision.length }} Email</span>
          dari Divisi {{ currentUser.divisi.join(' & ') }} yang belum diproses lebih dari 1 Hari.
        </p>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div class="px-5 pt-5 pb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 class="font-semibold text-gray-800 dark:text-white">Daftar Email</h3>
          <div class="flex items-center gap-2 mt-3 flex-wrap">
            <button v-for="tab in tabs" :key="tab.value"
              @click="activeTab = tab.value"
              :class="activeTab === tab.value
                ? 'bg-[#F03131] text-white border-[#F03131]'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50'"
              class="px-4 py-1.5 rounded-full text-sm font-medium border transition">
              {{ tab.label }}
            </button>
          </div>
        </div>
        <div class="relative">
          <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input v-model="searchQuery" type="text" placeholder="Cari sesuatu..."
            class="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-red-300 w-52"/>
        </div>
      </div>

      <div v-if="loading" class="py-16 text-center text-gray-400 text-sm">
        Memuat data email...
      </div>

      <div v-else class="overflow-visible">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-t border-gray-100 dark:border-gray-700">
              <th class="px-4 py-3 w-6"></th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Tanggal/Waktu</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Pengirim</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Subject</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Divisi</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Kategori</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Status</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">PIC</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="email in filteredEmails" :key="email.message_id"
              @click="openDetail(email)"
              :class="[
                'border-t border-gray-50 dark:border-gray-700 transition cursor-pointer',
                isRead(email.message_id)
                  ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  : 'hover:bg-red-50/40 dark:hover:bg-red-900/10'
              ]">

              <td class="px-4 py-3.5 text-center">
                <span v-if="!isRead(email.message_id)"
                  class="w-2 h-2 rounded-full bg-[#F03131] inline-block"/>
              </td>

              <td class="px-3 py-3.5 whitespace-nowrap"
                :class="isRead(email.message_id) ? 'text-gray-400 font-normal' : 'text-gray-700 dark:text-gray-200 font-semibold'">
                {{ formatDate(email.received_at) }}
              </td>

              <td class="px-3 py-3.5"
                :class="isRead(email.message_id) ? 'text-gray-500 font-normal' : 'text-gray-900 dark:text-white font-semibold'">
                {{ email.sender_name }}
              </td>

              <td class="px-3 py-3.5 max-w-xs"
                :class="isRead(email.message_id) ? 'text-gray-400 font-normal' : 'text-gray-800 dark:text-gray-100 font-semibold'">
                <span class="truncate block" :title="email.subject">
                  {{ truncate(email.subject, 45) }}
                </span>
              </td>

              <td class="px-3 py-3.5">
                <span v-if="email.divisi"
                  :class="getDivisiBadgeClass(email.divisi)"
                  class="px-2.5 py-1 rounded-full text-xs font-medium">
                  {{ email.divisi }}
                </span>
                <span v-else class="text-gray-400 text-xs">-</span>
              </td>

              <td class="px-3 py-3.5"
                :class="isRead(email.message_id) ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'">
                {{ getKategoriLabel(email.kategori) }}
              </td>

              <td class="px-3 py-3.5">
                <span :class="getStatusClass(email.setting_status)"
                  class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ getStatusLabel(email.setting_status) }}
                </span>
              </td>

              <td class="px-3 py-3.5">
                <div v-if="email.pic" class="flex items-center gap-2">
                  <div :class="getPicColor(email.pic)"
                    class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {{ email.pic[0] }}
                  </div>
                  <span :class="isRead(email.message_id) ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'" class="text-sm">
                    {{ email.pic }}
                  </span>
                </div>
                <span v-else class="text-gray-400 text-sm italic">Open</span>
              </td>

              <!-- Action button -->
              <td class="px-3 py-3.5" @click.stop>
                <button @click="toggleActionMenu($event, email)"
                  class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition">
                  <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="1.5"/>
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="12" cy="19" r="1.5"/>
                  </svg>
                </button>
              </td>
            </tr>

            <tr v-if="filteredEmails.length === 0">
              <td colspan="9" class="py-16 text-center">
                <svg class="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <p class="text-gray-400 text-sm">Tidak ada email ditemukan</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===================== ACTION DROPDOWN (Teleported) ===================== -->
    <Teleport to="body">
      <div v-if="activeMenu && activeMenuEmail"
        class="fixed z-[60]"
        :style="{ top: menuPos.y + 'px', left: menuPos.x + 'px' }">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 w-52">

          <button v-if="!isRead(activeMenuEmail.message_id)"
            @click="handleMarkRead(activeMenuEmail)"
            class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left">
            <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0L9.75 14.5"/>
            </svg>
            Mark As Read
          </button>
          <button v-else
            @click="handleMarkUnread(activeMenuEmail)"
            class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left">
            <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
            Tandai Belum Dibaca
          </button>

          <div class="border-t border-gray-100 dark:border-gray-700 my-1"></div>

          <button v-if="activeMenuEmail.setting_status !== 'OPG' && activeMenuEmail.setting_status !== 'DONE'"
            @click="handleStatusChange(activeMenuEmail, 'OPG')"
            class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left">
            <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            On-Progress
          </button>

          <button v-if="activeMenuEmail.setting_status !== 'DONE'"
            @click="handleStatusChange(activeMenuEmail, 'DONE')"
            class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left">
            <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Done
          </button>

          <button v-if="activeMenuEmail.setting_status === 'OPG'"
            @click="handleStatusChange(activeMenuEmail, 'PENDING')"
            class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-left">
            <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Cancel Progress
          </button>
        </div>
      </div>
    </Teleport>

    <!-- ===================== EMAIL DETAIL POPUP ===================== -->
    <Teleport to="body">
      <div v-if="selectedEmail"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeDetail">

        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

        <!-- Modal -->
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">

          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 dark:text-white text-base leading-snug">
                {{ selectedEmail.subject || '(Tanpa Subject)' }}
              </h3>
              <div class="flex items-center gap-3 mt-2 flex-wrap">
                <span :class="getDivisiBadgeClass(selectedEmail.divisi)"
                  v-if="selectedEmail.divisi"
                  class="px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ selectedEmail.divisi }}
                </span>
                <span :class="getStatusClass(selectedEmail.setting_status)"
                  class="px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ getStatusLabel(selectedEmail.setting_status) }}
                </span>
                <span class="text-xs text-gray-400">
                  {{ getKategoriLabel(selectedEmail.kategori) }}
                </span>
              </div>
            </div>
            <button @click="closeDetail"
              class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition flex-shrink-0">
              <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Sender Info -->
          <div class="px-6 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-[#F03131] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {{ (selectedEmail.sender_name || '?')[0].toUpperCase() }}
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800 dark:text-white">{{ selectedEmail.sender_name }}</p>
                  <p class="text-xs text-gray-400">{{ selectedEmail.sender_email }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-400">{{ formatDate(selectedEmail.received_at) }}</p>
                <p v-if="selectedEmail.kode_ap" class="text-xs font-medium text-[#F03131] mt-0.5">
                  {{ selectedEmail.kode_ap }}
                </p>
              </div>
            </div>
          </div>

          <!-- Email Body -->
          <div class="px-6 py-4 overflow-y-auto flex-1">
            <div class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {{ selectedEmail.body || '(Tidak ada isi email)' }}
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span v-if="selectedEmail.pic" class="text-xs text-gray-500 dark:text-gray-400">
                PIC:
                <span class="font-medium text-gray-700 dark:text-gray-200">{{ selectedEmail.pic }}</span>
              </span>
              <span v-else class="text-xs text-gray-400 italic">Belum ada PIC</span>
            </div>
            <div class="flex items-center gap-2">
              <button v-if="selectedEmail.setting_status !== 'DONE'"
                @click="handleStatusChange(selectedEmail, 'DONE'); closeDetail()"
                class="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition">
                Tandai Done
              </button>
              <button @click="closeDetail"
                class="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-lg transition">
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Click outside to close action menu -->
    <div v-if="activeMenu" class="fixed inset-0 z-[55]" @click="activeMenu = null; activeMenuEmail = null"></div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { currentUser, greeting } = useAuth()
const { emails, loading, isRead, markAsRead, markAsUnread, fetchEmails, refreshEmails, updateEmailStatus, subscribeRealtime } = useEmails()
const { isDark, toggle: toggleDark } = useDarkMode()

onMounted(() => {
  fetchEmails()
  subscribeRealtime()
  const refreshTimer = setInterval(() => refreshEmails(), 5 * 60 * 1000)
  const clockTimer   = setInterval(() => updateTime(), 60000)
  window.addEventListener('scroll', onScroll, true)
  onUnmounted(() => {
    clearInterval(refreshTimer)
    clearInterval(clockTimer)
    window.removeEventListener('scroll', onScroll, true)
  })
})

// Waktu realtime
const currentDateTime = ref('')
const updateTime = () => {
  currentDateTime.value = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}
updateTime()

// Reminder
const pendingInMyDivision = computed(() =>
  emails.value.filter(e =>
    e.setting_status === 'PENDING' && e.divisi &&
    currentUser.value.divisi.includes(e.divisi)
  )
)

// Tabs & filter
const tabs = [
  { label: 'Semua', value: 'ALL' },
  { label: 'M1', value: 'M1' }, { label: 'M2', value: 'M2' },
  { label: 'M3', value: 'M3' }, { label: 'M4', value: 'M4' },
  { label: 'M5', value: 'M5' }, { label: 'MT', value: 'MT' },
  { label: 'Lain-Lain', value: 'OTHER' },
]
const activeTab   = ref('ALL')
const searchQuery = ref('')

const filteredEmails = computed(() => {
  let result = emails.value
  if (activeTab.value !== 'ALL') {
    if (activeTab.value === 'OTHER') {
      result = result.filter(e => !e.divisi || !['M1','M2','M3','M4','M5','MT'].includes(e.divisi))
    } else {
      result = result.filter(e => e.divisi === activeTab.value)
    }
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(e =>
      e.subject?.toLowerCase().includes(q) ||
      e.sender_name?.toLowerCase().includes(q) ||
      e.kode_ap?.toLowerCase().includes(q)
    )
  }
  return result
})

// ===================== DETAIL POPUP =====================
const selectedEmail = ref<any>(null)

const openDetail = (email: any) => {
  selectedEmail.value = email
  markAsRead(email.message_id)
  activeMenu.value = null
}

const closeDetail = () => {
  selectedEmail.value = null
}

// ===================== ACTION MENU =====================
const activeMenu      = ref<string | null>(null)
const activeMenuEmail = ref<any>(null)
const menuPos         = ref({ x: 0, y: 0 })
const activeMenuBtn   = ref<HTMLElement | null>(null)

const updateMenuPosition = () => {
  if (!activeMenuBtn.value) return
  const rect = activeMenuBtn.value.getBoundingClientRect()
  const dropdownH = 160
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  const showAbove = spaceBelow < dropdownH && spaceAbove > spaceBelow

  menuPos.value = {
    x: rect.right - 208, // koordinat viewport langsung (position: fixed)
    y: showAbove ? rect.top - dropdownH - 4 : rect.bottom + 4,
  }
}

const onScroll = () => {
  if (activeMenu.value) {
    activeMenu.value      = null
    activeMenuEmail.value = null
    activeMenuBtn.value   = null
  }
}

const toggleActionMenu = (event: MouseEvent, email: any) => {
  if (activeMenu.value === email.message_id) {
    activeMenu.value      = null
    activeMenuEmail.value = null
    activeMenuBtn.value   = null
    return
  }

  activeMenuBtn.value = event.currentTarget as HTMLElement
  updateMenuPosition()

  activeMenu.value      = email.message_id
  activeMenuEmail.value = email
}

const handleMarkRead = (email: any) => {
  markAsRead(email.message_id)
  activeMenu.value      = null
  activeMenuEmail.value = null
}

const handleMarkUnread = (email: any) => {
  markAsUnread(email.message_id)
  activeMenu.value      = null
  activeMenuEmail.value = null
}

const handleStatusChange = async (email: any, status: string) => {
  await updateEmailStatus(email.message_id, status)
  activeMenu.value      = null
  activeMenuEmail.value = null
}

// Row click → open detail
const handleRowClick = (email: any) => openDetail(email)

// ===================== HELPERS =====================
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const truncate = (str: string, len: number) =>
  str?.length > len ? str.substring(0, len) + '...' : str

const getKategoriLabel = (k: string) => {
  const map: Record<string, string> = {
    AP: 'Setting', MB: 'Master Barang', LB: 'Launch Brief',
    INC: 'Incentive', SPT: 'Support', ANO: 'Lain-Lain'
  }
  return map[k] || k
}

const getStatusLabel = (s: string) => {
  const map: Record<string, string> = {
    PENDING: 'Pending', OPG: 'On-Progress', DONE: 'Done'
  }
  return map[s] || s
}

const getDivisiBadgeClass = (divisi: string) => {
  const map: Record<string, string> = {
    M1: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300',
    M2: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
    M3: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300',
    M4: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    M5: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300',
    MT: 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300',
  }
  return map[divisi] || 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
}

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    PENDING : 'bg-red-100 text-red-500 dark:bg-red-800/30 dark:text-red-500',
    OPG     : 'bg-blue-100 text-blue-500 dark:bg-blue-900/40 dark:text-blue-300',
    DONE    : 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300',
  }
  return map[status] || 'bg-gray-100 text-gray-500'
}

const getPicColor = (pic: string) => {
  const map: Record<string, string> = {
    Kuncoro: 'bg-red-500', Irhandy: 'bg-green-500',
    Mechell: 'bg-orange-500', Wira: 'bg-purple-500',
    Lia: 'bg-pink-500', Maulana: 'bg-blue-500',
  }
  return map[pic] || 'bg-gray-400'
}
</script>