// Penjaga rute: SEMUA halaman Watcher wajib login.
// Berjalan sebelum halaman apa pun dirender, jadi konten tidak sempat tampil ke orang yang belum login.
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const { ensureSession } = useAuth()
  const loggedIn = await ensureSession()

  // Halaman login: kalau sesi masih valid, langsung masuk
  if (to.path === '/login') {
    if (loggedIn) return navigateTo(safeRedirect(to.query.redirect) ?? '/emails', { replace: true })
    return
  }

  // Halaman lain (termasuk alamat yang tidak ada): belum login → ke login
  if (!loggedIn) {
    const target = to.fullPath !== '/' ? to.fullPath : undefined
    return navigateTo(
      { path: '/login', query: target ? { redirect: target } : undefined },
      { replace: true }
    )
  }
})
