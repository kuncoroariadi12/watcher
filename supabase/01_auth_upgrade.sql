-- =====================================================================
-- WATCHER · Upgrade keamanan login  —  BAGIAN 1 dari 2
-- Aman dijalankan SEKARANG: tidak mengubah apa pun yang dipakai
-- website Watcher yang sedang live (login lama tetap jalan).
--
-- Cara pakai: Supabase Dashboard → SQL Editor → New query →
-- paste seluruh isi file ini → Run.  Aman dijalankan ulang.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- 1. Kolom baru di tabel users
--    password_hash : password disimpan sebagai hash bcrypt (bukan teks asli)
--    failed_attempts / locked_until : pembatas percobaan login (anti tebak password)
-- ---------------------------------------------------------------------
alter table public.users
  add column if not exists password_hash   text,
  add column if not exists failed_attempts int not null default 0,
  add column if not exists locked_until    timestamptz;

-- Hash semua password lama. Kolom "password" (teks asli) SENGAJA belum
-- dihapus supaya website lama tetap bisa login sampai frontend baru live.
-- Kolom itu dibersihkan di BAGIAN 2.
update public.users
   set password_hash = extensions.crypt(password, extensions.gen_salt('bf', 10))
 where password_hash is null
   and password is not null;

-- ---------------------------------------------------------------------
-- 2. Tabel sesi login (token disimpan dalam bentuk hash, bukan token asli)
-- ---------------------------------------------------------------------
create table if not exists public.user_sessions (
  id           uuid primary key default gen_random_uuid(),
  employee_id  text        not null,
  token_hash   text        not null unique,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null,
  last_seen_at timestamptz
);

create index if not exists user_sessions_employee_idx on public.user_sessions (employee_id);
create index if not exists user_sessions_expires_idx  on public.user_sessions (expires_at);

alter table public.user_sessions enable row level security;   -- tanpa policy = tertutup untuk anon
revoke all on table public.user_sessions from anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. Batas sesi: setiap sesi berakhir pukul 03:00 WIB berikutnya.
--    Mau ganti jam? Ubah dua kali '03:00' / '3 hours' di bawah ini.
--    (Login pukul 08:00 → berakhir besok 03:00. Login pukul 01:00 → berakhir 03:00 hari itu juga.)
-- ---------------------------------------------------------------------
create or replace function public.watcher_session_expiry()
returns timestamptz
language sql
stable
as $$
  select (
    case
      when (now() at time zone 'Asia/Jakarta')::time >= time '03:00'
        then date_trunc('day', now() at time zone 'Asia/Jakarta') + interval '1 day 3 hours'
      else date_trunc('day', now() at time zone 'Asia/Jakarta') + interval '3 hours'
    end
  ) at time zone 'Asia/Jakarta';
$$;

-- Profil user yang aman dikirim ke browser (tanpa password / hash)
create or replace function public.watcher_profile(p_employee_id text)
returns jsonb
language sql
stable
security definer
set search_path = public, extensions
as $$
  select jsonb_build_object(
    'id',          u.id,
    'employee_id', u.employee_id,
    'name',        u.name,
    'role',        u.role,
    'title',       u.title,
    'divisi',      coalesce(to_jsonb(u.divisi), '[]'::jsonb),
    'initial',     u.initial,
    'color',       u.color,
    'pic_name',    u.pic_name
  )
  from public.users u
  where u.employee_id = p_employee_id
  limit 1;
$$;

-- ---------------------------------------------------------------------
-- 4. LOGIN
--    - password dicek di server (bcrypt), tidak pernah dikirim balik ke browser
--    - 5x salah berturut-turut → akun dikunci 15 menit
--    - pesan error sama untuk "ID tidak ada" dan "password salah"
-- ---------------------------------------------------------------------
create or replace function public.watcher_login(p_employee_id text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  u         public.users%rowtype;
  v_token   text;
  v_expires timestamptz;
begin
  select * into u
    from public.users
   where upper(employee_id) = upper(trim(coalesce(p_employee_id, '')))
     and is_active = true
   limit 1;

  if not found then
    perform crypt(coalesce(p_password, ''), gen_salt('bf', 10));   -- samakan waktu respons
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;

  if u.locked_until is not null and u.locked_until > now() then
    return jsonb_build_object(
      'ok', false, 'error', 'locked',
      'retry_after_seconds', ceil(extract(epoch from (u.locked_until - now())))::int
    );
  end if;

  if u.password_hash is null
     or p_password is null
     or u.password_hash <> crypt(p_password, u.password_hash) then
    update public.users
       set failed_attempts = case when failed_attempts + 1 >= 5 then 0 else failed_attempts + 1 end,
           locked_until    = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' else locked_until end
     where id = u.id;
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;

  update public.users set failed_attempts = 0, locked_until = null where id = u.id;

  delete from public.user_sessions where expires_at < now();

  v_token   := encode(gen_random_bytes(32), 'hex');
  v_expires := public.watcher_session_expiry();

  insert into public.user_sessions (employee_id, token_hash, expires_at)
  values (u.employee_id, encode(digest(v_token, 'sha256'), 'hex'), v_expires);

  return jsonb_build_object(
    'ok', true,
    'token', v_token,
    'expires_at', v_expires,
    'user', public.watcher_profile(u.employee_id)
  );
end;
$$;

-- ---------------------------------------------------------------------
-- 5. CEK SESI (dipanggil frontend setiap halaman dibuka)
--    User yang dinonaktifkan (is_active = false) otomatis ditolak.
-- ---------------------------------------------------------------------
create or replace function public.watcher_validate_session(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  s public.user_sessions%rowtype;
begin
  if p_token is null or length(p_token) < 32 then
    return jsonb_build_object('ok', false);
  end if;

  select * into s
    from public.user_sessions
   where token_hash = encode(digest(p_token, 'sha256'), 'hex')
     and expires_at > now();

  if not found then
    return jsonb_build_object('ok', false);
  end if;

  if not exists (
    select 1 from public.users where employee_id = s.employee_id and is_active = true
  ) then
    delete from public.user_sessions where employee_id = s.employee_id;
    return jsonb_build_object('ok', false);
  end if;

  update public.user_sessions set last_seen_at = now() where id = s.id;

  return jsonb_build_object(
    'ok', true,
    'expires_at', s.expires_at,
    'user', public.watcher_profile(s.employee_id)
  );
end;
$$;

-- ---------------------------------------------------------------------
-- 6. LOGOUT (sesi dihapus di server, bukan cuma di browser)
-- ---------------------------------------------------------------------
create or replace function public.watcher_logout(p_token text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if p_token is not null then
    delete from public.user_sessions
     where token_hash = encode(digest(p_token, 'sha256'), 'hex');
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- 7. GANTI PASSWORD
--    - wajib sesi valid + password lama benar
--    - minimal 8 karakter, tidak boleh sama dengan password lama
--    - setelah berhasil, sesi di perangkat LAIN otomatis dikeluarkan
-- ---------------------------------------------------------------------
create or replace function public.watcher_change_password(
  p_token text, p_old text, p_new text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  s public.user_sessions%rowtype;
  u public.users%rowtype;
begin
  if p_token is null or length(p_token) < 32 then
    return jsonb_build_object('ok', false, 'error', 'session');
  end if;

  select * into s
    from public.user_sessions
   where token_hash = encode(digest(p_token, 'sha256'), 'hex')
     and expires_at > now();
  if not found then
    return jsonb_build_object('ok', false, 'error', 'session');
  end if;

  select * into u from public.users where employee_id = s.employee_id and is_active = true;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'session');
  end if;

  if u.locked_until is not null and u.locked_until > now() then
    return jsonb_build_object(
      'ok', false, 'error', 'locked',
      'retry_after_seconds', ceil(extract(epoch from (u.locked_until - now())))::int
    );
  end if;

  if u.password_hash is null
     or p_old is null
     or u.password_hash <> crypt(p_old, u.password_hash) then
    update public.users
       set failed_attempts = case when failed_attempts + 1 >= 5 then 0 else failed_attempts + 1 end,
           locked_until    = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' else locked_until end
     where id = u.id;
    return jsonb_build_object('ok', false, 'error', 'wrong_old');
  end if;

  if p_new is null or length(p_new) < 8 then
    return jsonb_build_object('ok', false, 'error', 'too_short');
  end if;
  if p_new = p_old then
    return jsonb_build_object('ok', false, 'error', 'same_as_old');
  end if;

  update public.users
     set password_hash   = crypt(p_new, gen_salt('bf', 10)),
         failed_attempts = 0,
         locked_until    = null
   where id = u.id;

  delete from public.user_sessions
   where employee_id = u.employee_id and id <> s.id;

  return jsonb_build_object('ok', true);
end;
$$;

-- ---------------------------------------------------------------------
-- 8. Daftar PIC aktif (nama, inisial, warna) — hanya untuk user yang sudah login
-- ---------------------------------------------------------------------
create or replace function public.watcher_list_users(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
begin
  if not exists (
    select 1 from public.user_sessions
     where token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex')
       and expires_at > now()
  ) then
    return '[]'::jsonb;
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
             'pic_name', u.pic_name, 'name', u.name, 'initial', u.initial, 'color', u.color
           ) order by u.pic_name)
      from public.users u
     where u.is_active = true
  ), '[]'::jsonb);
end;
$$;

-- ---------------------------------------------------------------------
-- 9. Hak akses fungsi: hanya 5 fungsi ini yang boleh dipanggil dari browser
-- ---------------------------------------------------------------------
revoke all on function public.watcher_session_expiry()                       from public, anon, authenticated;
revoke all on function public.watcher_profile(text)                          from public, anon, authenticated;
revoke all on function public.watcher_login(text, text)                      from public, anon, authenticated;
revoke all on function public.watcher_validate_session(text)                 from public, anon, authenticated;
revoke all on function public.watcher_logout(text)                           from public, anon, authenticated;
revoke all on function public.watcher_change_password(text, text, text)      from public, anon, authenticated;
revoke all on function public.watcher_list_users(text)                       from public, anon, authenticated;

grant execute on function public.watcher_login(text, text)                   to anon, authenticated;
grant execute on function public.watcher_validate_session(text)              to anon, authenticated;
grant execute on function public.watcher_logout(text)                        to anon, authenticated;
grant execute on function public.watcher_change_password(text, text, text)   to anon, authenticated;
grant execute on function public.watcher_list_users(text)                    to anon, authenticated;

notify pgrst, 'reload schema';

-- Cek hasil (opsional): semua user aktif harus punya hash.
-- select employee_id, password_hash is not null as sudah_di_hash from public.users order by 1;
