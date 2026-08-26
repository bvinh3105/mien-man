import { getDB } from "@/lib/prisma";
import Link from "next/link";

export const runtime = "edge";

function formatVND(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

export default async function HomePage() {
  const db = getDB();

  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const products = await db.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Miên Man
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600">
              Đăng nhập
            </Link>
          </nav>
        </div>
      </header>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Chào mừng đến Miên Man</h1>
          <p className="text-lg text-gray-600">Thời trang đơn giản, phong cách riêng</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-4">Danh mục</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.slug}`}
              className="px-4 py-2 bg-white rounded-full border border-gray-200 text-sm whitespace-nowrap hover:bg-blue-50 hover:border-blue-300 transition"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-semibold mb-4">Sản phẩm ({products.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => {
            const images: string[] = JSON.parse(product.images);
            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group"
              >
                <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                  {images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  )}
                  {product.salePrice && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      -{Math.round((1 - product.salePrice / product.price) * 100)}%
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 mb-1">{product.category?.name}</p>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-red-600">
                      {formatVND(product.salePrice || product.price)}
                    </span>
                    {product.salePrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatVND(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
          &copy; 2026 Miên Man.
        </div>
      </footer>
    </main>
  );
}
