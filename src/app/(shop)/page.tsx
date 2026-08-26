import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Miên Man</h1>
          <nav className="flex items-center gap-4">
            {user ? (
              <span className="text-sm text-gray-600">{user.email}</span>
            ) : (
              <a href="/login" className="text-sm text-blue-600 hover:underline">
                Đăng nhập
              </a>
            )}
          </nav>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Chào mừng đến Miên Man</h2>
        <p className="text-center text-gray-600">Sản phẩm sẽ được hiển thị ở đây.</p>
      </div>
    </main>
  );
}
