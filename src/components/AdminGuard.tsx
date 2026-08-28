"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface AdminGuardProps {
  children: ReactNode;
  /** Hiển thị khi đang loading auth */
  fallback?: ReactNode;
}

/**
 * Bảo vệ trang admin — redirect về /login nếu chưa đăng nhập
 * hoặc hiển thị "Không có quyền" nếu đăng nhập nhưng không phải admin.
 *
 * Sử dụng: bọc toàn bộ nội dung trang admin
 * ```tsx
 * <AdminGuard>
 *   <AdminDashboard />
 * </AdminGuard>
 * ```
 */
function AccessDenied({ email }: { email: string }) {
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h2>
        <p className="text-sm text-gray-500 mb-6">
          Tài khoản <strong className="text-gray-700">{email}</strong> không phải Admin.
          Liên hệ quản trị viên để được cấp quyền.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Về trang chủ
          </button>
          <button
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            Đăng nhập tài khoản khác
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { user, profile, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Chưa đăng nhập → redirect về login
    if (!user) {
      router.replace("/login?redirect=/admin");
      return;
    }

    // Đã đăng nhập nhưng profile chưa load xong → chờ
    // (profile fetch là async sau khi user có)
  }, [user, loading, router]);

  // Loading state
  if (loading || (user && !profile)) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-gray-500 font-medium">Đang xác thực...</p>
          </div>
        </div>
      )
    );
  }

  // Chưa đăng nhập (đang redirect)
  if (!user) return null;

  // Đã đăng nhập nhưng không phải admin
  if (!isAdmin) {
    return <AccessDenied email={user.email ?? ""} />;
  }

  // ✅ Admin — render nội dung
  return <>{children}</>;
}
