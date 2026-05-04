import { supabase } from './useSupabase'

// State global persistent
const _emails  = ref<any[]>([])
const _loading = ref(false)
const _error   = ref<string | null>(null)
const _readIds = ref<Set<string>>(new Set())
const _fetched = ref(false)
const _channel = ref<any>(null)

export const useEmails = () => {
  const isRead = (messageId: string) => _readIds.value.has(messageId)

  const markAsRead = (messageId: string) => {
    if (!_readIds.value.has(messageId)) {
      _readIds.value = new Set([..._readIds.value, messageId])
    }
  }

  const markAsUnread = (messageId: string) => {
    const newSet = new Set(_readIds.value)
    newSet.delete(messageId)
    _readIds.value = newSet
  }

  const fetchEmails = async () => {
    if (_fetched.value) return
    _loading.value = true
    _error.value   = null
    try {
      const { data, error: sbError } = await supabase
        .from('emails')
        .select('*')
        .order('received_at', { ascending: false })
      if (sbError) throw sbError
      _emails.value  = data || []
      _fetched.value = true
    } catch (e) {
      _error.value = 'Gagal memuat data dari Supabase'
      console.error(e)
    } finally {
      _loading.value = false
    }
  }

  const refreshEmails = async () => {
    _fetched.value = false
    await fetchEmails()
  }

  // Update status email di Supabase dan local state
  const updateEmailStatus = async (messageId: string, status: string) => {
    try {
      const { error: sbError } = await supabase
        .from('emails')
        .update({ setting_status: status })
        .eq('message_id', messageId)
      if (sbError) throw sbError
      // Update local state
      const idx = _emails.value.findIndex(e => e.message_id === messageId)
      if (idx !== -1) {
        _emails.value[idx] = { ..._emails.value[idx], setting_status: status }
        _emails.value = [..._emails.value]
      }
    } catch (e) {
      console.error('Failed to update status:', e)
    }
  }

  const subscribeRealtime = () => {
    if (_channel.value) return
    _channel.value = supabase
      .channel('emails-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emails' },
        (payload) => { _emails.value = [payload.new, ..._emails.value] }
      )
      .subscribe()
  }

  return {
    emails: _emails,
    loading: _loading,
    error: _error,
    isRead,
    markAsRead,
    markAsUnread,
    fetchEmails,
    refreshEmails,
    updateEmailStatus,
    subscribeRealtime,
  }
}