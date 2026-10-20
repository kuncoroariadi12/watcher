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

interface StoredSession {
  token: string
  expiresAt: number // epoch ms
  user: WatcherUser
}

type ValidateResult =
  | { status: 'ok'; expiresAt: number; user: WatcherUser }
  | { status: 'invalid' }
  | { status: 'error' }

const STORAGE_KEY = 'watcher_session'
const LEGACY_KEYS = ['watcher_user'] // format lama (sessionStorage, tanpa token)

const EMPTY_USER: WatcherUser = {
  id: '', employee_id: '', name: '', role: '',
  title: '', divisi: [], initial: '', color: '', pic_name: '',
}

// ─── State global (satu instance untuk seluruh app) ───────────────────────────
const _currentUser = ref<WatcherUser>(EMPTY_USER)
const _isLoggedIn  = ref(false)
const _expiresAt   = ref<number | null>(null)
let _token: string | null = null
let _persistent = true
let _restorePromise: Promise<boolean> | null = null
let _watcherStarted = false
let _lastServerCheck = 0

// ─── Penyimpanan sesi di browser ──────────────────────────────────────────────
// "Ingat saya" dicentang  → localStorage  (tetap ada setelah browser ditutup)
// "Ingat saya" tidak      → sessionStorage (hilang saat tab ditutup)
const readStored = (): { session: StoredSession; persistent: boolean } | null => {
  if (!import.meta.client) return null
  const stores: Array<[Storage, boolean]> = [[localStorage, true], [sessionStorage, false]]
  for (const [store, persistent] of stores) {
    try {
      const raw = store.getItem(STORAGE_KEY)
      if (!raw) continue
      const s = JSON.parse(raw)
      if (s && typeof s.token === 'string' && typeof s.expiresAt === 'number' && s.user) {
        return { session: s as StoredSession, persistent }
      }
    } catch { /* abaikan data rusak */ }
  }
  return null
}

const clearStored = () => {
  if (!import.meta.client) return
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* skip */ }
  try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* skip */ }
  for (const k of LEGACY_KEYS) {
    try { sessionStorage.removeItem(k) } catch { /* skip */ }
  }
}

const normalizeUser = (u: any): WatcherUser => ({
  id:          u?.id ?? '',
  employee_id: u?.employee_id ?? '',
  name:        u?.name ?? '',
  role:        u?.role ?? '',
  title:       u?.title ?? '',
  divisi:      Array.isArray(u?.divisi) ? u.divisi : [],
  initial:     u?.initial ?? '',
  color:       u?.color ?? '',
  pic_name:    u?.pic_name ?? '',
})

const applySession = (s: StoredSession, persistent: boolean) => {
  _token = s.token
  _persistent = persistent
  _currentUser.value = normalizeUser(s.user)
  _expiresAt.value = s.expiresAt
  _isLoggedIn.value = true
  if (import.meta.client) {
    clearStored()
    try {
      (persistent ? localStorage : sessionStorage)
        .setItem(STORAGE_KEY, JSON.stringify({ ...s, user: _currentUser.value }))
    } catch { /* storage penuh / diblokir: sesi tetap hidup di memori */ }
  }
}

const clearSession = () => {
  _token = null
  _currentUser.value = EMPTY_USER
  _expiresAt.value = null
  _isLoggedIn.value = false
  _restorePromise = null
  clearStored()
}

const isExpiredLocally = () =>
  _expiresAt.value !== null && Date.now() >= _expiresAt.value

// Token sesi untuk dikirim ke fungsi server (dipakai composable lain)
export const getSessionToken = () => _token

// ─── Validasi sesi ke server ──────────────────────────────────────────────────
const callValidate = async (token: string): Promise<ValidateResult> => {
  try {
    const { data, error } = await supabase.rpc('watcher_validate_session', { p_token: token })
    if (error) return { status: 'error' }
    if (data?.ok) {
      return { status: 'ok', expiresAt: Date.parse(data.expires_at), user: normalizeUser(data.user) }
    }
    return { status: 'invalid' }
  } catch {
    return { status: 'error' }
  }
}

const restoreSession = async (): Promise<boolean> => {
  if (!import.meta.client) return false

  const stored = readStored()
  if (!stored) { clearStored(); return false }

  // Sudah lewat batas harian → langsung buang
  if (Date.now() >= stored.session.expiresAt) { clearSession(); return false }

  const res = await callValidate(stored.session.token)

  if (res.status === 'ok') {
    applySession({ token: stored.session.token, expiresAt: res.expiresAt, user: res.user }, stored.persistent)
    return true
  }
  if (res.status === 'invalid') {
    clearSession()
    return false
  }
  // Server tidak terjangkau (jaringan): pakai sesi lokal yang belum kadaluarsa.
  // Data tetap dilindungi server, jadi ini tidak membuka akses apa pun.
  applySession(stored.session, stored.persistent)
  return true
}

// Dipanggil route middleware di setiap navigasi.
// Validasi ke server hanya sekali per pemuatan halaman; selanjutnya cukup cek batas waktu lokal.
const ensureSession = async (): Promise<boolean> => {
  if (!import.meta.client) return false
  if (_isLoggedIn.value) {
    if (isExpiredLocally()) { clearSession(); return false }
    return true
  }
  if (!_restorePromise) _restorePromise = restoreSession()
  return _restorePromise
}

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginWithCredentials = async (
  employeeId: string,
  password: string,
  remember = true
): Promise<{ ok: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('watcher_login', {
      p_employee_id: employeeId,
      p_password: password,
    })

    if (error || !data) {
      return { ok: false, error: 'Tidak dapat terhubung ke server. Coba lagi sebentar.' }
    }

    if (!data.ok) {
      if (data.error === 'locked') {
        const minutes = Math.max(1, Math.ceil((data.retry_after_seconds ?? 900) / 60))
        return { ok: false, error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${minutes} menit.` }
      }
      return { ok: false, error: 'Employee ID atau password salah' }
    }

    applySession(
      { token: data.token, expiresAt: Date.parse(data.expires_at), user: normalizeUser(data.user) },
      remember
    )
    return { ok: true }
  } catch {
    return { ok: false, error: 'Tidak dapat terhubung ke server. Coba lagi sebentar.' }
  }
}

// ─── Composable ──────────────────────────────────────────────────────────────
export const useAuth = () => {

  const greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 11) return 'Selamat Pagi'
    if (hour < 15) return 'Selamat Siang'
    if (hour < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  })

  const logout = async () => {
    const token = _token
    clearSession()
    // Hapus sesi di server juga (tidak perlu ditunggu)
    if (token) supabase.rpc('watcher_logout', { p_token: token }).then(() => {}, () => {})
    await navigateTo('/login', { replace: true })
  }

  const changePassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<{ ok: boolean; code?: string; error?: string }> => {
    if (!_token) return { ok: false, code: 'session', error: 'Sesi tidak valid. Silakan masuk kembali.' }
    try {
      const { data, error } = await supabase.rpc('watcher_change_password', {
        p_token: _token,
        p_old: oldPassword,
        p_new: newPassword,
      })
      if (error || !data) {
        return { ok: false, code: 'network', error: 'Tidak dapat terhubung ke server. Coba lagi sebentar.' }
      }
      if (data.ok) return { ok: true }

      switch (data.error) {
        case 'wrong_old':
          return { ok: false, code: 'wrong_old', error: 'Password lama salah' }
        case 'too_short':
          return { ok: false, code: 'too_short', error: 'Password baru minimal 8 karakter' }
        case 'same_as_old':
          return { ok: false, code: 'same_as_old', error: 'Password baru harus berbeda dari password lama' }
        case 'locked': {
          const minutes = Math.max(1, Math.ceil((data.retry_after_seconds ?? 900) / 60))
          return { ok: false, code: 'locked', error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${minutes} menit.` }
        }
        case 'session':
          return { ok: false, code: 'session', error: 'Sesi berakhir. Silakan masuk kembali.' }
        default:
          return { ok: false, code: 'unknown', error: 'Gagal mengganti password. Coba lagi.' }
      }
    } catch {
      return { ok: false, code: 'network', error: 'Tidak dapat terhubung ke server. Coba lagi sebentar.' }
    }
  }

  // Dipasang sekali dari app.vue: menutup sesi otomatis saat melewati batas harian,
  // saat sesi dicabut server, atau saat logout di tab lain.
  const startSessionWatcher = () => {
    if (!import.meta.client || _watcherStarted) return
    _watcherStarted = true
    const router = useRouter()

    const expire = async () => {
      const back = router.currentRoute.value.fullPath
      clearSession()
      await navigateTo(
        { path: '/login', query: { expired: '1', ...(back && back !== '/' ? { redirect: back } : {}) } },
        { replace: true }
      )
    }

    const revalidate = async () => {
      if (!_isLoggedIn.value || !_token) return
      if (isExpiredLocally()) return expire()
      const now = Date.now()
      if (now - _lastServerCheck < 30_000) return
      _lastServerCheck = now
      const res = await callValidate(_token)
      if (res.status === 'invalid') expire()
    }

    setInterval(() => {
      if (_isLoggedIn.value && isExpiredLocally()) expire()
    }, 30_000)

    setInterval(revalidate, 5 * 60_000)

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') revalidate()
    })

    // Logout / sesi habis di tab lain → tab ini ikut keluar
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue === null && _isLoggedIn.value && _persistent) {
        clearSession()
        navigateTo('/login', { replace: true })
      }
    })
  }

  return {
    currentUser: _currentUser,
    isLoggedIn:  _isLoggedIn,
    expiresAt:   _expiresAt,
    greeting,
    logout,
    changePassword,
    ensureSession,
    startSessionWatcher,
  }
}
