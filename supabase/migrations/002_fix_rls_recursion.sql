-- ============================================================
-- MIGRATION 002 — Fix infinite recursion trong RLS policies
-- ============================================================
-- Lỗi gốc: "Admin read all profiles" policy trên bảng profiles
-- tự query lại chính bảng profiles để check role='admin' → Postgres
-- áp RLS lại lên câu query đó → lặp vô hạn (Postgres error 42P17).
-- Vì các bảng khác (orders, products...) cũng check quyền admin bằng
-- cách join sang profiles, nên MỌI truy vấn chạm profiles đều bị 500.
--
-- Cách sửa: dùng hàm SECURITY DEFINER để check role admin — hàm này
-- chạy với quyền của người tạo (postgres, có BYPASSRLS) nên không kích
-- hoạt lại RLS của profiles → hết đệ quy.
--
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ─── Thay toàn bộ policy "Admin ..." cũ (dùng exists subquery trực tiếp)
-- bằng bản dùng is_admin() ───────────────────────────────────

drop policy if exists "Admin read all profiles" on public.profiles;
create policy "Admin read all profiles"
  on public.profiles for select using (public.is_admin());

drop policy if exists "Admin manage categories" on public.categories;
create policy "Admin manage categories"
  on public.categories for all using (public.is_admin());

drop policy if exists "Admin manage products" on public.products;
create policy "Admin manage products"
  on public.products for all using (public.is_admin());

drop policy if exists "Admin manage variants" on public.product_variants;
create policy "Admin manage variants"
  on public.product_variants for all using (public.is_admin());

drop policy if exists "Admin read all orders" on public.orders;
create policy "Admin read all orders"
  on public.orders for select using (public.is_admin());

drop policy if exists "Admin update orders" on public.orders;
create policy "Admin update orders"
  on public.orders for update using (public.is_admin());

drop policy if exists "Admin read all order items" on public.order_items;
create policy "Admin read all order items"
  on public.order_items for select using (public.is_admin());

drop policy if exists "Admin manage order history" on public.order_history;
create policy "Admin manage order history"
  on public.order_history for all using (public.is_admin());

drop policy if exists "Admin manage payments" on public.payments;
create policy "Admin manage payments"
  on public.payments for all using (public.is_admin());
