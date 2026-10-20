<template>
  <div class="p-6 dark:bg-gray-900 min-h-screen">

    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-800 dark:text-white">Settings</h2>
      <p class="text-sm text-gray-400 mt-0.5">Profil akun dan keamanan</p>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-5 gap-6 max-w-6xl">

      <!-- ===== PROFIL ===== -->
      <section class="xl:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div class="px-5 pt-5 pb-4 flex items-center gap-4">
          <div :class="currentUser.color || 'bg-gray-400'"
            class="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {{ currentUser.initial }}
          </div>
          <div class="min-w-0">
            <h3 class="font-semibold text-gray-800 dark:text-white truncate">{{ currentUser.name }}</h3>
            <p class="text-sm text-gray-400 truncate">{{ currentUser.title }}</p>
          </div>
        </div>

        <dl class="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700">
          <div v-for="row in profileRows" :key="row.label"
            class="px-5 py-3.5 grid grid-cols-3 gap-3 items-center">
            <dt class="text-xs font-medium text-gray-400">{{ row.label }}</dt>
            <dd class="col-span-2 text-sm text-gray-800 dark:text-gray-100 break-words">
              <template v-if="Array.isArray(row.value)">
                <span v-if="row.value.length === 0" class="text-gray-300">-</span>
                <span v-for="d in row.value" :key="d"
                  class="inline-block mr-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                         bg-red-50 text-[#F03131] dark:bg-red-900/20 dark:text-red-300">{{ d }}</span>
              </template>
              <template v-else>{{ row.value || '-' }}</template>
            </dd>
          </div>
        </dl>
      </section>

      <!-- ===== GANTI PASSWORD ===== -->
      <section class="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm self-start">
        <div class="px-5 pt-5 pb-4">
          <h3 class="font-semibold text-gray-800 dark:text-white">Ganti password</h3>
          <p class="text-xs text-gray-400 mt-0.5">
            Setelah berhasil, perangkat lain yang sedang login akan dikeluarkan.
          </p>
        </div>

        <form class="px-5 pb-5 space-y-4" @submit.prevent="submit" novalidate>
          <div v-for="f in fields" :key="f.key">
            <label :for="`pw-${f.key}`" class="block text-xs font-medium text-gray-500 dark:text-gray-300 mb-1">
              {{ f.label }}
            </label>
            <UiPasswordInput
              :id="`pw-${f.key}`"
              v-model="form[f.key]"
              :autocomplete="f.autocomplete"
              :disabled="saving"
              :input-class="inputClass"
            />
            <p v-if="f.hint" class="text-xs text-gray-400 mt-1">{{ f.hint }}</p>
          </div>

          <div v-if="errorMsg" role="alert"
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2.5 text-sm text-red-600 dark:text-red-300">
            {{ errorMsg }}
          </div>
          <div v-if="successMsg" role="status"
            class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2.5 text-sm text-green-700 dark:text-green-300">
            {{ successMsg }}
          </div>

          <button type="submit" :disabled="saving || !canSubmit"
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F03131] text-white text-sm font-medium
                   rounded-lg hover:bg-red-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                   focus-visible:ring-red-400 disabled:opacity-60 disabled:cursor-not-allowed">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ saving ? 'Menyimpan...' : 'Simpan password' }}
          </button>
        </form>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { currentUser, expiresAt, changePassword, logout } = useAuth()

// ── Profil ───────────────────────────────────────────────────────────────
const profileRows = computed(() => [
  { label: 'Nama',        value: currentUser.value.name },
  { label: 'Employee ID', value: currentUser.value.employee_id },
  { label: 'PIC',         value: currentUser.value.pic_name },
  { label: 'Jabatan',     value: currentUser.value.title },
  { label: 'Role',        value: currentUser.value.role },
  { label: 'Divisi',      value: currentUser.value.divisi as string[] | string },
])

const sessionEndText = computed(() => {
  if (!expiresAt.value) return ''
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(expiresAt.value)) + ' WIB'
})

// ── Ganti password ───────────────────────────────────────────────────────
type FieldKey = 'old' | 'next' | 'confirm'

const fields: Array<{ key: FieldKey; label: string; autocomplete: string; hint?: string }> = [
  { key: 'old',     label: 'Password lama',            autocomplete: 'current-password' },
  { key: 'next',    label: 'Password baru',            autocomplete: 'new-password', hint: 'Minimal 8 karakter' },
  { key: 'confirm', label: 'Konfirmasi password baru', autocomplete: 'new-password' },
]

const form = reactive<Record<FieldKey, string>>({ old: '', next: '', confirm: '' })
const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const canSubmit = computed(() => !!form.old && !!form.next && !!form.confirm)

const inputClass =
  'w-full px-3 py-2 text-base sm:text-sm border border-gray-200 dark:border-gray-600 rounded-lg ' +
  'bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-red-300 transition disabled:opacity-60'

const submit = async () => {
  if (saving.value) return
  errorMsg.value = ''
  successMsg.value = ''

  if (form.next.length < 8) { errorMsg.value = 'Password baru minimal 8 karakter'; return }
  if (form.next !== form.confirm) { errorMsg.value = 'Konfirmasi password tidak sama dengan password baru'; return }
  if (form.next === form.old) { errorMsg.value = 'Password baru harus berbeda dari password lama'; return }

  saving.value = true
  const res = await changePassword(form.old, form.next)
  saving.value = false

  if (!res.ok) {
    if (res.code === 'session') { await logout(); return }
    errorMsg.value = res.error ?? 'Gagal mengganti password. Coba lagi.'
    if (res.code === 'wrong_old') form.old = ''
    return
  }

  form.old = ''
  form.next = ''
  form.confirm = ''
  successMsg.value = 'Password berhasil diubah. Perangkat lain telah dikeluarkan.'
}
</script>
