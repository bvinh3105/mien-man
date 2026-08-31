"use client";

// Client component: quantity selector + add to cart button
import { useState } from "react";
import { useCart, type CartItem } from "@/lib/cart";
import CartDrawer from "@/components/CartDrawer";

interface Props {
  product: Omit<CartItem, "quantity">;
}

export default function ProductActions({ product }: Props) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleAdd() {
    for (let i = 0; i < qty; i++) {
      addItem(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setDrawerOpen(true);
  }

  return (
    <>
      <div className="space-y-4">
        {/* Chọn số lượng */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-sage-700">Số lượng:</span>
          <div className="flex items-center border border-sage-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-sage-600 hover:bg-sage-50 transition text-lg font-medium"
            >
              −
            </button>
            <span className="w-12 text-center text-base font-semibold text-charcoal tabular-nums">{qty}</span>
            <button
              onClick={() => setQty(q => q + 1)}
              className="w-10 h-10 flex items-center justify-center text-sage-600 hover:bg-sage-50 transition text-lg font-medium"
            >
              +
            </button>
          </div>
        </div>

        {/* Nút thêm vào giỏ */}
        <button
          onClick={handleAdd}
          className={`w-full py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            added
              ? "bg-emerald-500 text-white"
              : "bg-sage-500 text-white hover:bg-sage-600 active:scale-[0.98]"
          }`}
        >
          {added ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Đã thêm vào giỏ!
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
              Thêm vào giỏ hàng
            </>
          )}
        </button>
      </div>

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
