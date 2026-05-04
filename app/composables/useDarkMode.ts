// Dark mode global state
const _isDark = ref(false)

export const useDarkMode = () => {
  const init = () => {
    if (process.client) {
      const stored = localStorage.getItem('watcher_dark')
      _isDark.value = stored === 'true'
      applyDark(_isDark.value)
    }
  }

  const applyDark = (dark: boolean) => {
    if (process.client) {
      document.documentElement.classList.toggle('dark', dark)
    }
  }

  const toggle = () => {
    _isDark.value = !_isDark.value
    applyDark(_isDark.value)
    if (process.client) {
      localStorage.setItem('watcher_dark', String(_isDark.value))
    }
  }

  return { isDark: _isDark, toggle, init }
}