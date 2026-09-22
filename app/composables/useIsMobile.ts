// Deteksi layar HP (< 768px, sama dengan breakpoint `md` Tailwind).
// Dipakai untuk memilih tampilan kartu (HP) atau tabel (tablet/desktop),
// supaya hanya SATU versi yang dirender -> DOM tetap ringan.
const _isMobile = ref(false)
let _mq: MediaQueryList | null = null
let _users = 0

const onChange = (e: MediaQueryListEvent) => { _isMobile.value = e.matches }

export const useIsMobile = () => {
  onMounted(() => {
    if (!_mq) {
      _mq = window.matchMedia('(max-width: 767px)')
      _mq.addEventListener('change', onChange)
    }
    _isMobile.value = _mq.matches
    _users++
  })

  onBeforeUnmount(() => {
    _users--
    if (_users <= 0 && _mq) {
      _mq.removeEventListener('change', onChange)
      _mq = null
      _users = 0
    }
  })

  return _isMobile
}
