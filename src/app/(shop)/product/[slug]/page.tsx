import { products, getProductBySlug } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";

function formatVND(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Miên Man
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          &larr; Quay lại
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden md:flex">
          <div className="md:w-1/2 aspect-[3/4] bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:w-1/2 p-6 md:p-8">
            <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-gray-600 mb-6">{product.description}</p>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-red-600">
                {formatVND(product.salePrice || product.price)}
              </span>
              {product.salePrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatVND(product.price)}
                  </span>
                  <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded">
                    -{Math.round((1 - product.salePrice / product.price) * 100)}%
                  </span>
                </>
              )}
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Còn {product.stock} sản phẩm
            </p>

            <button className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
