-- ============================================================
-- Migration 007 — Fix guest checkout khi user đang đăng nhập
-- ============================================================
-- Ngày tạo: 2026-09-08
-- Vấn đề gốc:
--   Policy "Guest insert order" cũ chỉ áp dụng cho role `anon`.
--   Nếu user đã đăng nhập (kể cả admin đang test) rồi đặt guest order
--   (user_id: null) → INSERT bị RLS chặn với lỗi 42501 →
--   frontend fallback localStorage → đơn KHÔNG vào Supabase.
--   Bug này gây ra hiện tượng: user thấy "Đặt hàng thành công MM-003"
--   nhưng admin Kanban không thấy đơn (vì đơn không tồn tại trong DB).
--
-- Cách sửa:
--   Cho phép CẢ anon lẫn authenticated đều được insert guest order,
--   miễn là user_id NULL và có guest_phone.
-- ============================================================

-- 1. ORDERS — bỏ giới hạn "to anon" cho guest insert
drop policy if exists "Guest insert order" on public.orders;
create policy "Guest insert order"
  on public.orders for insert to public
  with check (user_id is null and guest_phone is not null);

-- 2. ORDERS — cho phép đọc guest order cả khi authenticated (để admin có
-- thể track/xem đơn của người khác vẫn hoạt động nếu is_admin() lỗi)
drop policy if exists "Guest track own order" on public.orders;
create policy "Guest track own order"
  on public.orders for select to public
  using (user_id is null);

-- 3. ORDER_ITEMS — tương tự cho insert
drop policy if exists "Guest insert order items" on public.order_items;
create policy "Guest insert order items"
  on public.order_items for insert to public
  with check (
    exists (select 1 from public.orders where id = order_id and user_id is null)
  );

-- 4. ORDER_ITEMS — cho phép đọc guest order items
drop policy if exists "Guest read own order items" on public.order_items;
create policy "Guest read own order items"
  on public.order_items for select to public
  using (
    exists (select 1 from public.orders where id = order_id and user_id is null)
  );

-- ============================================================
-- Cách chạy migration này:
-- 1. Vào https://supabase.com/dashboard → project "miên man" → SQL Editor
-- 2. Bấm "New query"
-- 3. Copy toàn bộ file này paste vào rồi bấm "Run"
-- 4. Kiểm tra output không có ERROR
-- ============================================================
