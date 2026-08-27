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
    <main className="min-h-screen bg-cream">
      <header className="bg-white/80 backdrop-blur-sm border-b border-sage-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-display font-semibold text-charcoal tracking-wide">
            Miên Man
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link href="/" className="text-sm text-sage-600 hover:text-sage-800 hover:underline transition">
          &larr; Quay lại
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-lg border border-sage-100 overflow-hidden md:flex">
          <div className="md:w-1/2 aspect-[3/4] bg-sage-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:w-1/2 p-6 md:p-8">
            <p className="text-sm text-sage-400 mb-2">{product.category.name}</p>
            <h1 className="text-2xl font-display font-semibold text-charcoal mb-4">{product.name}</h1>
            <p className="text-sage-600 mb-6 leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-sage-700">
                {formatVND(product.salePrice || product.price)}
              </span>
              {product.salePrice && (
                <>
                  <span className="text-lg text-sage-300 line-through">
                    {formatVND(product.price)}
                  </span>
                  <span className="bg-sage-100 text-sage-700 text-sm px-2 py-1 rounded">
                    -{Math.round((1 - product.salePrice / product.price) * 100)}%
                  </span>
                </>
              )}
            </div>

            <p className="text-sm text-sage-400 mb-6">
              Còn {product.stock} sản phẩm
            </p>

            <button className="w-full py-3 px-6 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition font-medium">
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
