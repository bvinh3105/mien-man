-- ============================================================
-- MIGRATION 005 — Thêm tài khoản admin: mienman.stu@gmail.com
-- ============================================================
-- Chạy SAU KHI đã tạo user trong:
-- Supabase Dashboard → Authentication → Users → Add user
-- Email: mienman.stu@gmail.com
--
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

update public.profiles
set role = 'admin'
where id in (
  select id from auth.users
  where lower(email) = 'mienman.stu@gmail.com'
);

-- Kiểm tra kết quả — nên có 3 dòng (kèm 2 tài khoản admin trước đó)
select p.id, p.full_name, p.role, u.email
from public.profiles p
join auth.users u on u.id = p.id
where lower(u.email) in ('bachvinhtran@gmail.com', 'hthaoan0108@gmail.com', 'mienman.stu@gmail.com');
