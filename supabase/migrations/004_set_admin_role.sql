-- ============================================================
-- MIGRATION 004 — Gán quyền admin cho các tài khoản thật
-- ============================================================
-- Chạy SAU KHI đã tạo user trong:
-- Supabase Dashboard → Authentication → Users → Add user
-- Emails:
--   - bachvinhtran@gmail.com
--   - Hthaoan0108@gmail.com
--
-- Trigger handle_new_user() tự tạo profile khi user được tạo,
-- nên chỉ cần update role = 'admin' cho các profile đó.
--
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

update public.profiles
set role = 'admin'
where id in (
  select id from auth.users
  where lower(email) in ('bachvinhtran@gmail.com', 'hthaoan0108@gmail.com')
);

-- Kiểm tra kết quả
select p.id, p.full_name, p.role, u.email
from public.profiles p
join auth.users u on u.id = p.id
where lower(u.email) in ('bachvinhtran@gmail.com', 'hthaoan0108@gmail.com');
