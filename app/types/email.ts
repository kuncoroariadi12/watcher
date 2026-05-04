export interface Email {
  message_id     : string
  subject        : string
  sender_name    : string
  sender_email   : string
  body           : string
  received_at    : string

  kategori       : 'AP' | 'MB' | 'LB' | 'INC' | 'SPT' | 'ANO'
  divisi         : 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'MT' | 'AMBIGU' | null
  channel        : 'GT' | 'MT' | null
  kode_ap        : string | null
  semua_kode_ap  : string

  score          : number
  score_detail   : string
  status_email   : 'VALID' | 'REVIEW' | 'ANOMALI'
  priority       : 'HIGH' | 'MEDIUM' | 'LOW'
  setting_status : 'PENDING' | 'DONE' | 'IN_PROGRESS'
  pic            : string | null
}

export interface User {
  id       : string
  name     : string
  email    : string
  role     : 'section_head' | 'setter'
  divisi   : string[]
  title    : string
}