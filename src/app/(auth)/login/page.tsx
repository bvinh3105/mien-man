"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/lib/auth";

// ─── Mã nội bộ admin ───────────────────────────
// Hash đơn giản để không lưu plaintext trong bundle
async function hashCode(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// SHA-256 hashes (không lưu plaintext)
const ADMIN_CODE_HASH = "9cdf7c32a063fca110dd74e11b8fd61d0b549d8efc35034f89b21119f7f2bb8b";
const ADMIN_PASS_HASH = "4c07e3d54c8512a4492504ade13f214c4faaf18f10e4f5f2fee178559fa9eabe";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { signIn, user, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Sau khi đăng nhập Supabase thành công, chờ profile → redirect
  useEffect(() => {
    if (!loginSuccess || !user) return;
    if (!profile) return;
    if (profile.role === "admin") {
      router.push("/admin");
    } else {
      router.push(redirectTo);
    }
  }, [loginSuccess, user, profile, router, redirectTo]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ── Check mã nội bộ admin trước ──
    const [inputHash, passHash] = await Promise.all([
      hashCode(email.trim()),
      hashCode(password),
    ]);

    if (inputHash === ADMIN_CODE_HASH && passHash === ADMIN_PASS_HASH) {
      // Mã nội bộ đúng → lưu session flag + vào admin
      sessionStorage.setItem("mm_admin", "1");
      setLoading(false);
      router.push("/admin");
      return;
    }

    // ── Nếu không phải mã nội bộ → thử Supabase auth ──
    const { error: err } = await signIn(email, password);
    setLoading(false);

    if (err) {
      setError(err);
    } else {
      setLoginSuccess(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sage-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg border border-sage-100 shadow-sm">
        <Link href="/" className="text-sm text-sage-600 hover:text-sage-800 hover:underline transition">&larr; Trang chủ</Link>
        <h1 className="text-2xl font-display font-semibold text-center my-6 text-charcoal">Đăng nhập</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-sage-700">Tài khoản</label>
            <input id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="Email hoặc tên đăng nhập"
              className="mt-1 w-full px-3 py-2 border border-sage-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-sage-700">Mật khẩu</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="mt-1 w-full px-3 py-2 border border-sage-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-sage-500 text-white rounded-md hover:bg-sage-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xác thực..." : "Đăng nhập"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-sage-500">
          Chưa có tài khoản? <Link href="/register" className="text-sage-700 hover:underline font-medium">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
