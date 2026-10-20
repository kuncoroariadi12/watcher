// Hanya izinkan redirect ke halaman di dalam Watcher (cegah open redirect ke situs lain)
export const safeRedirect = (value: unknown): string | null => {
  const v = Array.isArray(value) ? value[0] : value
  if (typeof v !== 'string') return null
  if (!v.startsWith('/') || v.startsWith('//') || v.startsWith('/\\')) return null
  if (v === '/login' || v.startsWith('/login?')) return null
  return v
}
