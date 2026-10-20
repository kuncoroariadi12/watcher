-- =====================================================================
-- WATCHER · Upgrade keamanan login  —  BAGIAN 2 dari 2  (PENGUNCI)
--
-- ⚠️  JANGAN dijalankan sebelum:
--     1) BAGIAN 1 sudah dijalankan, dan
--     2) frontend Watcher yang baru sudah ter-deploy di Netlify, dan
--     3) Anda sudah berhasil login + ganti password lewat versi baru.
--
-- Kalau dijalankan lebih awal, website versi lama akan gagal login
-- karena tabel users sudah tidak boleh dibaca langsung dari browser.
-- =====================================================================

-- 1. Hapus password teks asli. Yang tersisa hanya hash bcrypt (tidak bisa dibalik).
alter table public.users alter column password drop not null;
update public.users set password = null;

-- 2. Tabel users tidak boleh lagi dibaca / ditulis langsung dari browser.
--    Semua akses lewat 5 fungsi watcher_* di BAGIAN 1.
alter table public.users enable row level security;
revoke all on table public.users from anon, authenticated;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- LAMPIRAN A — Reset password user yang lupa (jalankan manual bila perlu)
-- Ganti MG138690 dan PasswordSementara123, lalu jalankan dua baris ini.
-- User akan login dengan password sementara itu, lalu ganti di menu Settings.
-- ---------------------------------------------------------------------
-- update public.users
--    set password_hash = extensions.crypt('PasswordSementara123', extensions.gen_salt('bf', 10)),
--        failed_attempts = 0, locked_until = null
--  where upper(employee_id) = 'MG138690';
-- delete from public.user_sessions where upper(employee_id) = 'MG138690';

-- ---------------------------------------------------------------------
-- LAMPIRAN B — Menambah user baru (kolom "password" tidak dipakai lagi)
-- ---------------------------------------------------------------------
-- insert into public.users (employee_id, name, role, title, divisi, initial, color, pic_name, is_active, password_hash)
-- values ('MG139999', 'Nama Lengkap', 'setter', 'MDM Setter', '{M3}', 'NL', 'bg-blue-500', 'NAMA', true,
--         extensions.crypt('PasswordSementara123', extensions.gen_salt('bf', 10)));

-- ---------------------------------------------------------------------
-- LAMPIRAN C — Paksa semua orang login ulang (misal ada dugaan kebocoran)
-- ---------------------------------------------------------------------
-- delete from public.user_sessions;

-- LAMPIRAN D — Membuka kunci akun yang terkunci karena salah password
-- update public.users set failed_attempts = 0, locked_until = null where upper(employee_id) = 'MG138690';
