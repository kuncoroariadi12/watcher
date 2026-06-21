<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col">

        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white text-base">
              {{ mode === 'create' ? 'Tambah Subdist Baru' : 'Edit Subdist' }}
            </h3>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ mode === 'create' ? 'Kode Subdist dan Nama Distributor wajib diisi' : `Kode Subdist ${initialData?.kode_subdist}` }}
            </p>
          </div>
          <button @click="$emit('close')"
            class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition flex-shrink-0">
            <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Body (scrollable) -->
        <div class="px-6 py-5 overflow-y-auto flex-1 space-y-6">

          <!-- Error banner -->
          <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
            {{ error }}
          </div>

          <!-- Identitas -->
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Identitas</p>
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-1">
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Kode Subdist <span class="text-[#F03131]">*</span>
                </label>
                <input v-model="form.kode_subdist" type="number" placeholder="cth. 103742"
                  :disabled="mode === 'edit'"
                  class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-red-300 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400"/>
              </div>
              <div class="col-span-1">
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Nama Distributor <span class="text-[#F03131]">*</span>
                </label>
                <input v-model="form.nama_distributor" type="text" placeholder="cth. PT. CIPTA NIAGA SEMESTA"
                  class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-red-300"/>
              </div>
              <div class="col-span-1">
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Area</label>
                <input v-model="form.area" type="text" placeholder="cth. BANDA ACEH"
                  class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-red-300"/>
              </div>
              <div class="col-span-1">
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Email</label>
                <input v-model="form.email" type="text" placeholder="cth. nama@ptcns.co.id"
                  class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-red-300"/>
              </div>
            </div>
          </div>

          <!-- Wilayah -->
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Wilayah</p>
            <div class="grid grid-cols-2 gap-4">
              <div v-for="col in wilayahColumns" :key="col.key">
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ col.label }}</label>
                <input v-model="(form as any)[col.key]" type="text"
                  class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-red-300"/>
              </div>
            </div>
          </div>

          <!-- Produk -->
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Kode Area Harga Produk
              <span class="font-normal normal-case text-gray-400">(kosongkan jika produk tidak tersedia)</span>
            </p>
            <div class="grid grid-cols-3 gap-3">
              <div v-for="col in produkColumns" :key="col.key">
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ col.label }}</label>
                <input v-model="(form as any)[col.key]" type="text" placeholder="—"
                  class="w-full px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-red-300"/>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2.5">
          <button @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            Batal
          </button>
          <button @click="handleSubmit" :disabled="saving || !isValid"
            class="px-5 py-2 text-sm font-medium bg-[#F03131] hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { SUBDIST_COLUMNS } from '~/types/subdist'
import type { Subdist } from '~/types/subdist'

const props = defineProps<{
  mode: 'create' | 'edit'
  initialData: Partial<Subdist> | null
  saving: boolean
  error: string
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: Partial<Subdist>]
}>()

const wilayahColumns = SUBDIST_COLUMNS.filter(c => c.group === 'wilayah')
const produkColumns  = SUBDIST_COLUMNS.filter(c => c.group === 'produk')

const emptyForm = (): Record<string, any> => {
  const base: Record<string, any> = { kode_subdist: '', nama_distributor: '', area: '', email: '' }
  for (const col of wilayahColumns) base[col.key] = ''
  for (const col of produkColumns) base[col.key] = ''
  return base
}

const form = ref<Record<string, any>>(emptyForm())

watch(() => props.initialData, (val) => {
  const fresh = emptyForm()
  if (val) {
    for (const key of Object.keys(fresh)) {
      const v = (val as any)[key]
      fresh[key] = v === null || v === undefined ? '' : v
    }
  }
  form.value = fresh
}, { immediate: true })

const isValid = computed(() =>
  String(form.value.kode_subdist).trim().length > 0 &&
  String(form.value.nama_distributor).trim().length > 0
)

const handleSubmit = () => {
  if (!isValid.value) return
  const payload: Record<string, any> = {}
  for (const [key, value] of Object.entries(form.value)) {
    if (key === 'kode_subdist') {
      payload[key] = Number(value)
    } else {
      const trimmed = typeof value === 'string' ? value.trim() : value
      payload[key] = trimmed === '' ? null : trimmed
    }
  }
  emit('submit', payload as Partial<Subdist>)
}
</script>
