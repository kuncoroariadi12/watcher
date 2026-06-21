import { supabase } from './useSupabase'
import type { Subdist } from '~/types/subdist'

// State global persistent — satu instance untuk seluruh app (pola sama seperti useEmails)
const _subdist  = ref<Subdist[]>([])
const _loading  = ref(false)
const _error    = ref<string | null>(null)
const _fetched  = ref(false)
const _channel  = ref<any>(null)

export const useSubdist = () => {

  const fetchSubdist = async () => {
    if (_fetched.value) return
    _loading.value = true
    _error.value   = null
    try {
      const { data, error: sbError } = await supabase
        .from('subdist')
        .select('*')
        .order('kode_subdist', { ascending: true })
      if (sbError) throw sbError
      _subdist.value = data || []
      _fetched.value = true
    } catch (e) {
      _error.value = 'Gagal memuat data Subdist dari Supabase'
      console.error(e)
    } finally {
      _loading.value = false
    }
  }

  const refreshSubdist = async () => {
    _fetched.value = false
    await fetchSubdist()
  }

  // ─── CREATE ──────────────────────────────────────────────────────────────
  const createSubdist = async (
    payload: Partial<Subdist>
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const { data, error: sbError } = await supabase
        .from('subdist')
        .insert(payload)
        .select()
        .single()
      if (sbError) throw sbError
      // Realtime channel akan menambahkan row otomatis, tapi tambahkan
      // langsung juga supaya terasa instan kalau realtime sedikit delay
      if (data && !_subdist.value.some(s => s.id === data.id)) {
        _subdist.value = [..._subdist.value, data].sort((a, b) => a.kode_subdist - b.kode_subdist)
      }
      return { ok: true }
    } catch (e: any) {
      const msg = e?.code === '23505'
        ? 'Kode Subdist sudah terdaftar, gunakan kode lain'
        : (e?.message || 'Gagal menyimpan Subdist baru')
      return { ok: false, error: msg }
    }
  }

  // ─── UPDATE (satu baris penuh, dari form edit) ──────────────────────────
  const updateSubdist = async (
    id: string,
    payload: Partial<Subdist>,
    updatedBy?: string
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const { data, error: sbError } = await supabase
        .from('subdist')
        .update({ ...payload, updated_by: updatedBy || null })
        .eq('id', id)
        .select()
        .single()
      if (sbError) throw sbError
      const idx = _subdist.value.findIndex(s => s.id === id)
      if (idx !== -1 && data) {
        _subdist.value[idx] = data
        _subdist.value = [..._subdist.value]
      }
      return { ok: true }
    } catch (e: any) {
      const msg = e?.code === '23505'
        ? 'Kode Subdist sudah terdaftar, gunakan kode lain'
        : (e?.message || 'Gagal memperbarui Subdist')
      return { ok: false, error: msg }
    }
  }

  // ─── UPDATE (satu kolom saja, dari inline cell edit) ────────────────────
  const updateSubdistField = async (
    id: string,
    field: keyof Subdist,
    value: any,
    updatedBy?: string
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const { data, error: sbError } = await supabase
        .from('subdist')
        .update({ [field]: value, updated_by: updatedBy || null })
        .eq('id', id)
        .select()
        .single()
      if (sbError) throw sbError
      const idx = _subdist.value.findIndex(s => s.id === id)
      if (idx !== -1 && data) {
        _subdist.value[idx] = data
        _subdist.value = [..._subdist.value]
      }
      return { ok: true }
    } catch (e: any) {
      const msg = e?.code === '23505'
        ? 'Kode Subdist sudah terdaftar, gunakan kode lain'
        : (e?.message || 'Gagal memperbarui data')
      return { ok: false, error: msg }
    }
  }

  // ─── DELETE ──────────────────────────────────────────────────────────────
  const deleteSubdist = async (id: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const { error: sbError } = await supabase
        .from('subdist')
        .delete()
        .eq('id', id)
      if (sbError) throw sbError
      _subdist.value = _subdist.value.filter(s => s.id !== id)
      return { ok: true }
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Gagal menghapus Subdist' }
    }
  }

  // ─── REALTIME ────────────────────────────────────────────────────────────
  const subscribeRealtime = () => {
    if (_channel.value) return
    _channel.value = supabase
      .channel('subdist-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'subdist' },
        (payload) => {
          if (!_subdist.value.some(s => s.id === (payload.new as any).id)) {
            _subdist.value = [..._subdist.value, payload.new as Subdist]
              .sort((a, b) => a.kode_subdist - b.kode_subdist)
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'subdist' },
        (payload) => {
          const idx = _subdist.value.findIndex(s => s.id === (payload.new as any).id)
          if (idx !== -1) {
            _subdist.value[idx] = payload.new as Subdist
            _subdist.value = [..._subdist.value]
          }
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'subdist' },
        (payload) => {
          _subdist.value = _subdist.value.filter(s => s.id !== (payload.old as any).id)
        }
      )
      .subscribe()
  }

  return {
    subdist: _subdist,
    loading: _loading,
    error: _error,
    fetchSubdist,
    refreshSubdist,
    createSubdist,
    updateSubdist,
    updateSubdistField,
    deleteSubdist,
    subscribeRealtime,
  }
}
