"use client";

// ============================================================
// CartBar — hiển thị trên navbar: icon giỏ + số lượng
// ============================================================

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartBar() {
  const { totalItems } = useCart();
  return (
    <Link href="/checkout" className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-sage-50 transition">
      <svg className="w-6 h-6 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-sage-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </Link>
  );
}
