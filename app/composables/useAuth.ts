export const USERS = [
  {
    id: 'kuncoro', name: 'Kuncoro Ariadi', username: 'kuncoro', password: '123',
    role: 'setter', title: 'MDM Setter', divisi: ['M2', 'M3'],
    initial: 'KA', color: 'bg-red-500',
  },
  {
    id: 'maulana', name: 'Maulana', username: 'maulana', password: '123',
    role: 'section_head', title: 'Section Head', divisi: ['M1','M2','M3','M4','M5','MT'],
    initial: 'ML', color: 'bg-blue-500',
  },
  {
    id: 'wira', name: 'Wira', username: 'wira', password: '123',
    role: 'setter', title: 'MDM Setter', divisi: ['M5'],
    initial: 'WR', color: 'bg-purple-500',
  },
  {
    id: 'lia', name: 'Lia', username: 'lia', password: '123',
    role: 'setter', title: 'MDM Setter', divisi: ['MT'],
    initial: 'LI', color: 'bg-pink-500',
  },
  {
    id: 'mechell', name: 'Mechell', username: 'mechell', password: '123',
    role: 'setter', title: 'MDM Setter', divisi: ['M1', 'M4'],
    initial: 'MC', color: 'bg-orange-500',
  },
  {
    id: 'irhandy', name: 'Irhandy', username: 'irhandy', password: '123',
    role: 'setter', title: 'MDM Setter', divisi: ['M3'],
    initial: 'IH', color: 'bg-green-500',
  },
]

// Default user untuk SSR (server tidak punya sessionStorage)
const DEFAULT_USER = USERS.find(u => u.id === 'kuncoro')!

// State global persistent
const _currentUser = ref<any>(DEFAULT_USER)

export const useAuth = () => {
  // Hanya load dari sessionStorage di client
  onMounted(() => {
    const stored = sessionStorage.getItem('watcher_user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.id) {
          _currentUser.value = parsed
        }
      } catch { /* skip */ }
    }
  })

  const greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 11) return 'Selamat Pagi'
    if (hour < 15) return 'Selamat Siang'
    if (hour < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  })

  const logout = () => {
    if (process.client) {
      sessionStorage.removeItem('watcher_user')
    }
    _currentUser.value = DEFAULT_USER
    navigateTo('/login')
  }

  return {
    USERS,
    currentUser: _currentUser,
    greeting,
    logout,
  }
}