-- ============================================================
-- MIGRATION 001 — Guest orders (khách vãng lai)
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Cho phép user_id nullable (khách vãng lai không có account)
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- 2. Thêm các cột guest
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS guest_name    TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS guest_phone   TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS guest_email   TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS guest_address JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cod'
    CHECK (payment_method IN ('cod', 'bank_transfer', 'momo', 'vnpay'));

-- 3. Ràng buộc: phải có user_id HOẶC guest_phone (không thể cả 2 đều NULL)
ALTER TABLE public.orders
  ADD CONSTRAINT orders_identity_check
  CHECK (user_id IS NOT NULL OR guest_phone IS NOT NULL);

-- 4. RLS: cho phép khách vãng lai (anon) tạo đơn
CREATE POLICY "Guest insert order"
  ON public.orders FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL AND guest_phone IS NOT NULL);

-- 5. RLS: khách tra cứu đơn theo order_number + guest_phone
-- (dùng hàm để tránh full table scan)
CREATE POLICY "Guest track own order"
  ON public.orders FOR SELECT
  TO anon
  USING (user_id IS NULL);

-- 6. Cho phép anon insert order_items (khi đặt hàng guest)
CREATE POLICY "Guest insert order items"
  ON public.order_items FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id IS NULL
    )
  );

-- 7. Cho phép anon đọc order_items của đơn guest
CREATE POLICY "Guest read own order items"
  ON public.order_items FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id IS NULL
    )
  );

-- 8. Index cho tra cứu nhanh
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_guest_phone  ON public.orders(guest_phone);
