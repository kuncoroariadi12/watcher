import { supabase } from './useSupabase'

export interface MdmPic {
  pic_name: string
  name: string
  initial: string
  color: string
}

// Cache global — cukup 1x query untuk seluruh app
const _pics = ref<MdmPic[]>([])
const _loaded = ref(false)
const _loading = ref(false)

export const useMdmUsers = () => {

  const load = async () => {
    if (_loaded.value || _loading.value) return
    _loading.value = true
    try {
      const { data, error } = await supabase
        .from('users')
        .select('pic_name, name, initial, color')
        .eq('is_active', true)
        .order('pic_name')

      if (!error && data) {
        // buang duplikat & baris tanpa pic_name
        const seen = new Set<string>()
        _pics.value = data
          .filter((u: any) => {
            const p = (u.pic_name || '').toUpperCase().trim()
            if (!p || seen.has(p)) return false
            seen.add(p)
            return true
          })
          .map((u: any) => ({
            pic_name: (u.pic_name || '').toUpperCase().trim(),
            name: u.name || u.pic_name,
            initial: u.initial || (u.pic_name || '?')[0],
            color: u.color || 'bg-gray-400',
          }))
        _loaded.value = true
      }
    } catch {
      /* biarkan kosong — halaman fallback ke user yang login saja */
    } finally {
      _loading.value = false
    }
  }

  // Warna avatar berdasarkan data Supabase, bukan hardcode
  const picColor = (pic: string) => {
    const found = _pics.value.find(p => p.pic_name === (pic || '').toUpperCase().trim())
    return found?.color || 'bg-gray-400'
  }

  return {
    pics: _pics,
    loading: _loading,
    load,
    picColor,
  }
}
