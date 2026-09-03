-- ============================================================
-- MIGRATION 006 — Khôi phục sản phẩm bị xoá + Storage cho ảnh sản phẩm
-- ============================================================
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Khôi phục "Bộ tự thêu chữ nghệ thuật" (đã soft-delete lúc test Xoá sản phẩm)
update public.products
set is_active = true
where slug = 'bo-tu-theu-chu';

-- 2. Tạo Storage bucket công khai cho ảnh sản phẩm
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 3. RLS cho storage.objects — ai cũng xem được ảnh, chỉ admin upload/sửa/xoá
create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admin upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admin update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

create policy "Admin delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- Kiểm tra: nên thấy 1 dòng cho "Bộ tự thêu chữ nghệ thuật"
select name, slug, is_active from public.products where slug = 'bo-tu-theu-chu';
