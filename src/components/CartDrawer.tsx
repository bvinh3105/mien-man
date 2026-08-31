"use client";

// ============================================================
// CartDrawer — slide-in panel quản lý giỏ hàng
// ============================================================

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";

function fmtVnd(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, totalItems, totalPrice, updateQty, removeItem, clearCart } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  const shippingFee = totalPrice >= 500000 ? 0 : 30000;
  const grandTotal = totalPrice + shippingFee;

  // Đóng khi nhấn Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Ngăn scroll body khi drawer mở
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sage-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
            <h2 className="font-semibold text-charcoal">Giỏ hàng</h2>
            {totalItems > 0 && (
              <span className="text-xs bg-sage-500 text-white rounded-full px-2 py-0.5 font-medium">{totalItems}</span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-sage-50 transition text-sage-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5 text-center">
            <div className="w-20 h-20 rounded-full bg-sage-50 flex items-center justify-center text-4xl">🧵</div>
            <p className="text-charcoal font-medium">Giỏ hàng đang trống</p>
            <p className="text-sm text-sage-500">Thêm sản phẩm để bắt đầu đặt hàng</p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 bg-sage-500 text-white rounded-full text-sm font-medium hover:bg-sage-600 transition"
            >
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <>
            {/* Danh sách sản phẩm */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 group">
                  {/* Ảnh */}
                  <Link href={`/product/${item.slug}`} onClick={onClose} className="shrink-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-sage-50 border border-sage-100">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">🧵</div>
                      }
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.slug}`} onClick={onClose}>
                      <p className="text-sm font-medium text-charcoal leading-snug truncate hover:text-sage-700 transition">{item.name}</p>
                    </Link>
                    {item.originalPrice > item.price && (
                      <p className="text-xs text-sage-400 line-through">{fmtVnd(item.originalPrice)}</p>
                    )}
                    <p className="text-sm font-semibold text-sage-700 mt-0.5">{fmtVnd(item.price)}</p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-sage-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-sage-600 hover:bg-sage-50 transition text-base font-medium"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-charcoal tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-sage-600 hover:bg-sage-50 transition text-base font-medium"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-charcoal">{fmtVnd(item.price * item.quantity)}</span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    title="Xóa"
                    className="self-start mt-1 w-6 h-6 flex items-center justify-center text-sage-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-sage-100 px-5 py-4 space-y-3 bg-white">
              {/* Tóm tắt giá */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-sage-600">
                  <span>Tạm tính ({totalItems} sản phẩm)</span>
                  <span>{fmtVnd(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sage-600">
                  <span>Vận chuyển</span>
                  <span className={shippingFee === 0 ? "text-emerald-600 font-medium" : ""}>
                    {shippingFee === 0 ? "Miễn phí 🎉" : fmtVnd(shippingFee)}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-xs text-sage-400">Mua thêm {fmtVnd(500000 - totalPrice)} để được miễn phí ship</p>
                )}
                <div className="flex justify-between font-bold text-charcoal pt-2 border-t border-sage-100 text-base">
                  <span>Tổng cộng</span>
                  <span className="text-sage-700">{fmtVnd(grandTotal)}</span>
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full py-3.5 bg-sage-500 text-white rounded-xl font-semibold text-center hover:bg-sage-600 transition text-sm"
              >
                Đặt hàng ngay →
              </Link>

              <div className="flex items-center justify-between text-xs text-sage-400">
                <button onClick={onClose} className="hover:text-sage-600 transition">← Tiếp tục mua sắm</button>
                <button onClick={() => { clearCart(); }} className="hover:text-red-400 transition">Xóa giỏ</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
