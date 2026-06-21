export interface Subdist {
  id                : string
  divisi            : string

  wil_grsm          : string | null
  region            : string | null
  sub_region_1      : string | null
  sub_region_2      : string | null
  kode_subdist      : number
  nama_distributor  : string
  area              : string | null
  email             : string | null

  lm                : string | null
  lm_galon_15l      : string | null
  lm_galon_5l       : string | null
  lm_galon_3l       : string | null
  lm_glass          : string | null
  tph               : string | null
  tph_tetra         : string | null
  kopikap           : string | null
  kopiko_78         : string | null
  kld               : string | null
  toracafe          : string | null
  cooltime          : string | null
  s7k               : string | null
  blue_bell         : string | null
  nipis_madu        : string | null
  collagena         : string | null
  moncelo           : string | null

  created_at        : string
  updated_at         : string
  updated_by        : string | null
}

// Definisi kolom untuk keperluan kolom-picker, tabel, dan form
export interface SubdistColumnDef {
  key      : keyof Subdist
  label    : string
  group    : 'identitas' | 'wilayah' | 'produk'
  required?: boolean   // wajib diisi saat create
  lockableDefault?: boolean
}

export const SUBDIST_COLUMNS: SubdistColumnDef[] = [
  { key: 'kode_subdist',     label: 'Kode Subdist',      group: 'identitas', required: true, lockableDefault: true },
  { key: 'nama_distributor', label: 'Nama Distributor',  group: 'identitas', required: true, lockableDefault: true },
  { key: 'area',             label: 'Area',              group: 'identitas' },
  { key: 'email',            label: 'Email',             group: 'identitas' },

  { key: 'wil_grsm',         label: 'GRSM',              group: 'wilayah' },
  { key: 'region',           label: 'Region',            group: 'wilayah' },
  { key: 'sub_region_1',     label: 'Sub-Region 1',      group: 'wilayah' },
  { key: 'sub_region_2',     label: 'Sub-Region 2',      group: 'wilayah' },

  { key: 'lm',               label: 'LM',                group: 'produk' },
  { key: 'lm_galon_15l',     label: 'LM Galon 15L',      group: 'produk' },
  { key: 'lm_galon_5l',      label: 'LM Galon 5L',       group: 'produk' },
  { key: 'lm_galon_3l',      label: 'LM Galon 3L',       group: 'produk' },
  { key: 'lm_glass',         label: 'LM Glass',          group: 'produk' },
  { key: 'tph',              label: 'TPH',               group: 'produk' },
  { key: 'tph_tetra',        label: 'TPH Tetra',         group: 'produk' },
  { key: 'kopikap',          label: 'Kopikap',           group: 'produk' },
  { key: 'kopiko_78',        label: 'Kopiko 78',         group: 'produk' },
  { key: 'kld',              label: 'KLD',               group: 'produk' },
  { key: 'toracafe',         label: 'Toracafe',          group: 'produk' },
  { key: 'cooltime',         label: 'Cooltime',          group: 'produk' },
  { key: 's7k',              label: 'S7K',               group: 'produk' },
  { key: 'blue_bell',        label: 'Blue Bell',         group: 'produk' },
  { key: 'nipis_madu',       label: 'Nipis Madu',        group: 'produk' },
  { key: 'collagena',        label: 'Collagena',         group: 'produk' },
  { key: 'moncelo',          label: 'Moncelo',           group: 'produk' },
]

// Default kolom yang tampil pertama kali (biar tabel tidak terlalu padat)
export const DEFAULT_VISIBLE_COLUMNS: (keyof Subdist)[] = [
  'kode_subdist', 'nama_distributor', 'area', 'wil_grsm', 'region',
  'lm', 'lm_galon_15l', 'tph', 'kopiko_78',
]

// Default kolom yang di-lock (selalu terlihat saat scroll horizontal)
export const DEFAULT_LOCKED_COLUMNS: (keyof Subdist)[] = ['kode_subdist']
