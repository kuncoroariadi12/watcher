import { supabase } from './useSupabase'

// Shape user yang dipakai di seluruh app
export interface WatcherUser {
  id: string
  employee_id: string
  name: string
  role: string
  title: string
  divisi: string[]
  initial: string
  color: string
  pic_name: string
}

// Default user kosong untuk SSR (tidak ada session di server)
const EMPTY_USER: WatcherUser = {
  id: '', employee_id: '', name: '', role: '',
  title: '', divisi: [], initial: '', color: '', pic_name: '',
}

// State global persistent — satu instance untuk seluruh app
const _currentUser = ref<WatcherUser>(EMPTY_USER)
const _isLoggedIn  = ref(false)

// ─── Login via Supabase ───────────────────────────────────────────────────────
export const loginWithCredentials = async (
  employeeId: string,
  password: string
): Promise<{ ok: boolean; error?: string }> => {
  // Normalisasi: uppercase employee_id supaya mg138690 / MG138690 / Mg138690 semua match
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('employee_id', employeeId.toUpperCase())
    .eq('password', password)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return { ok: false, error: 'Employee ID atau password salah' }
  }

  const user: WatcherUser = {
    id:          data.id,
    employee_id: data.employee_id,
    name:        data.name,
    role:        data.role,
    title:       data.title,
    divisi:      data.divisi ?? [],
    initial:     data.initial,
    color:       data.color,
    pic_name:    data.pic_name,
  }

  // Simpan ke sessionStorage
  if (process.client) {
    sessionStorage.setItem('watcher_user', JSON.stringify(user))
  }

  _currentUser.value = user
  _isLoggedIn.value  = true

  return { ok: true }
}

// ─── Composable ──────────────────────────────────────────────────────────────
export const useAuth = () => {

  // Load session dari sessionStorage saat client mount
  onMounted(() => {
    if (!_isLoggedIn.value) {
      const stored = sessionStorage.getItem('watcher_user')
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as WatcherUser
          if (parsed?.id) {
            _currentUser.value = parsed
            _isLoggedIn.value  = true
          }
        } catch { /* skip */ }
      }
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
    _currentUser.value = EMPTY_USER
    _isLoggedIn.value  = false
    navigateTo('/login')
  }

  return {
    currentUser: _currentUser,
    isLoggedIn:  _isLoggedIn,
    greeting,
    logout,
  }
}