"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    alert("Chức năng đăng nhập sẽ được kích hoạt sau khi kết nối cơ sở dữ liệu.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sage-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg border border-sage-100 shadow-sm">
        <Link href="/" className="text-sm text-sage-600 hover:text-sage-800 hover:underline transition">&larr; Trang chủ</Link>
        <h1 className="text-2xl font-display font-semibold text-center my-6 text-charcoal">Đăng nhập</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-sage-700">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="mt-1 w-full px-3 py-2 border border-sage-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-sage-700">Mật khẩu</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="mt-1 w-full px-3 py-2 border border-sage-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white" />
          </div>
          <button type="submit" className="w-full py-2 px-4 bg-sage-500 text-white rounded-md hover:bg-sage-600 transition font-medium">
            Đăng nhập
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-sage-500">
          Chưa có tài khoản? <Link href="/register" className="text-sage-700 hover:underline font-medium">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
}
