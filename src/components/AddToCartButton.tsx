"use client";

// ============================================================
// AddToCartButton — dùng trong product card / product page
// ============================================================

import { useState } from "react";
import { useCart, type CartItem } from "@/lib/cart";

interface Props {
  product: Omit<CartItem, "quantity">;
  className?: string;
  compact?: boolean; // compact = icon only
}

export default function AddToCartButton({ product, className = "", compact = false }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault(); // tránh navigate khi trong Link
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (compact) {
    return (
      <button
        onClick={handleClick}
        title="Thêm vào giỏ"
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${added ? "bg-emerald-500 text-white" : "bg-white text-sage-700 border border-sage-200 hover:bg-sage-500 hover:text-white hover:border-sage-500"} ${className}`}
      >
        {added ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${added ? "bg-emerald-500 text-white" : "bg-sage-500 text-white hover:bg-sage-600"} ${className}`}
    >
      {added ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
          Đã thêm!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" /></svg>
          Thêm vào giỏ
        </>
      )}
    </button>
  );
}
