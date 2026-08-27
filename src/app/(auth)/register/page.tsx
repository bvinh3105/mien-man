"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await signUp(email, password, fullName);
    setLoading(false);

    if (err) {
      setError(err);
    } else {
      setSuccess(true);
      // Supabase gửi email xác nhận — hiển thị thông báo
      // Nếu tắt email confirm trong Supabase, redirect luôn:
      // router.push("/");
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg border border-sage-100 shadow-sm text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-semibold text-charcoal mb-2">Đăng ký thành công!</h1>
          <p className="text-sage-600 mb-6">Vui lòng kiểm tra email để xác nhận tài khoản.</p>
          <Link href="/login" className="inline-block py-2 px-6 bg-sage-500 text-white rounded-md hover:bg-sage-600 transition font-medium">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sage-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg border border-sage-100 shadow-sm">
        <Link href="/" className="text-sm text-sage-600 hover:text-sage-800 hover:underline transition">&larr; Trang chủ</Link>
        <h1 className="text-2xl font-display font-semibold text-center my-6 text-charcoal">Đăng ký</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-sage-700">Họ tên</label>
            <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
              className="mt-1 w-full px-3 py-2 border border-sage-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-sage-700">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="mt-1 w-full px-3 py-2 border border-sage-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-sage-700">Mật khẩu</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="mt-1 w-full px-3 py-2 border border-sage-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-sage-500 text-white rounded-md hover:bg-sage-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-sage-500">
          Đã có tài khoản? <Link href="/login" className="text-sage-700 hover:underline font-medium">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
