-- ============================================================
-- MIGRATION 003 — Thêm RLS policy cho khách vãng lai trên order_items
-- ============================================================
-- Lỗi gốc: schema.sql có policy "Guest insert order" / "Guest track own
-- order" cho bảng orders, nhưng KHÔNG có policy tương ứng cho order_items.
-- Kết quả: INSERT order_items báo lỗi 42501 "new row violates row-level
-- security policy" mỗi khi khách vãng lai đặt hàng — đơn vẫn tạo được
-- (orders insert OK) nhưng chi tiết sản phẩm trong đơn bị mất.
--
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

create policy "Guest insert order items"
  on public.order_items for insert
  to anon
  with check (
    exists (
      select 1 from public.orders
      where id = order_id and user_id is null
    )
  );

create policy "Guest read own order items"
  on public.order_items for select
  to anon
  using (
    exists (
      select 1 from public.orders
      where id = order_id and user_id is null
    )
  );
