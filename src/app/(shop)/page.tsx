import Link from "next/link";
import React from "react";

export default function ShopHomePage() {
  return (
    <>
      {/* Clean, Functional Navbar */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-3xl font-extrabold tracking-tight text-brand flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center text-xl">M</span>
              MiênMan
            </Link>
            <nav className="hidden lg:flex gap-6 font-semibold text-gray-700">
              <Link href="/product" className="hover:text-brand transition-colors flex items-center gap-1">
                Sản phẩm <span className="text-xs">▼</span>
              </Link>
              <Link href="#" className="hover:text-brand transition-colors flex items-center gap-1">
                Dịch vụ thêu <span className="text-xs">▼</span>
              </Link>
              <Link href="#" className="hover:text-brand transition-colors">Bảng giá</Link>
              <Link href="#" className="hover:text-brand transition-colors">Cách hoạt động</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hidden md:flex items-center gap-1.5 font-semibold text-gray-500 hover:text-gray-800 transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Admin
            </Link>
            <Link href="/login" className="hidden md:block font-semibold text-gray-700 hover:text-brand">
              Đăng nhập
            </Link>
            <button className="bg-brand hover:bg-brand-dark text-white px-6 py-2.5 rounded-md font-bold transition-all shadow-lg shadow-brand/30 transform hover:-translate-y-0.5">
              Tạo thiết kế ngay
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* High-Impact Hero Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 pr-0 lg:pr-12">
            <h1 className="text-5xl md:text-[64px] font-extrabold leading-[1.1] text-dark tracking-tight">
              Sáng tạo để thêu. <br />
              <span className="text-brand">Chúng tôi sản xuất.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted font-medium max-w-lg leading-relaxed">
              Nền tảng thêu theo yêu cầu (Embroidery on Demand) hàng đầu. Tạo và đặt hàng các sản phẩm thêu tay cao cấp. Không yêu cầu số lượng tối thiểu.
            </p>
            <ul className="check-list">
              <li>Thêu mọi thiết kế lên Túi, Áo, Mũ, Phụ kiện.</li>
              <li>Miễn phí sử dụng công cụ thiết kế Online (Mockup 3D).</li>
              <li>Chất lượng thủ công 100%, bảo hành đường kim mũi chỉ.</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="bg-brand text-white px-8 py-4 rounded-md font-bold text-lg hover:bg-brand-dark transition-all shadow-xl shadow-brand/30 transform hover:-translate-y-1 text-center w-full sm:w-auto">
                Bắt đầu miễn phí
              </button>
              <button className="bg-white text-dark border-2 border-gray-200 px-8 py-4 rounded-md font-bold text-lg hover:border-brand hover:text-brand transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Xem cách hoạt động
              </button>
            </div>
          </div>
          
          {/* Main visual: Tote bag being embroidered */}
          <div className="flex-1 relative flex items-center justify-center bg-gray-50/50 min-h-[400px]">
            <img src="https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80" alt="Blank Tote" className="w-80 h-80 object-cover rounded-xl shadow-lg float" />
            
            {/* Animated overlay elements */}
            <div className="absolute top-1/4 right-4 md:right-10 bg-white p-4 rounded-xl shadow-xl animate-pulse">
              <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Tiến trình</p>
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="w-2/3 h-full bg-brand"></div></div>
              <p className="text-sm font-bold mt-2 text-brand">Đang thêu...</p>
            </div>
            
            <div className="absolute bottom-10 left-4 md:left-10 bg-white p-3 rounded-xl shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand font-bold text-xl">✓</div>
              <div>
                <p className="text-sm font-bold text-dark">Chất lượng cao</p>
                <p className="text-xs text-gray-500">Kiểm định AI</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Marquee */}
        <div className="marquee-container">
          <div className="marquee-content">
            <span className="marquee-item">✓ KHÔNG SỐ LƯỢNG TỐI THIỂU</span>
            <span className="marquee-item">✓ 200+ SẢN PHẨM CƠ BẢN</span>
            <span className="marquee-item">✓ TÍCH HỢP SHOPEE & TIKTOK</span>
            <span className="marquee-item">✓ GIAO HÀNG TOÀN QUỐC</span>
            <span className="marquee-item">✓ KHÔNG RỦI RO TỒN KHO</span>
            {/* Repeat for seamless scroll */}
            <span className="marquee-item">✓ KHÔNG SỐ LƯỢNG TỐI THIỂU</span>
            <span className="marquee-item">✓ 200+ SẢN PHẨM CƠ BẢN</span>
            <span className="marquee-item">✓ TÍCH HỢP SHOPEE & TIKTOK</span>
            <span className="marquee-item">✓ GIAO HÀNG TOÀN QUỐC</span>
            <span className="marquee-item">✓ KHÔNG RỦI RO TỒN KHO</span>
          </div>
        </div>

        {/* How it works (Clean Grid) */}
        <section className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-extrabold text-dark mb-4">Cách thức hoạt động cực kỳ đơn giản</h2>
              <p className="text-lg text-muted">Bạn tập trung vào ý tưởng và bán hàng. Chúng tôi lo khâu sản xuất và đóng gói.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand text-2xl font-bold flex items-center justify-center mb-6">1</div>
                <h3 className="text-2xl font-bold text-dark mb-3">Tạo thiết kế (Mockup)</h3>
                <p className="text-muted leading-relaxed">Sử dụng công cụ thiết kế miễn phí của chúng tôi để tải lên logo hoặc hình ảnh và áp dụng lên hơn 100+ mẫu sản phẩm (túi, mũ, áo).</p>
              </div>
              {/* Step 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand text-2xl font-bold flex items-center justify-center mb-6">2</div>
                <h3 className="text-2xl font-bold text-dark mb-3">Kết nối cửa hàng</h3>
                <p className="text-muted leading-relaxed">Đồng bộ sản phẩm tự động với cửa hàng Shopee, TikTok Shop hoặc Website cá nhân của bạn chỉ với vài click.</p>
              </div>
              {/* Step 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand text-2xl font-bold flex items-center justify-center mb-6">3</div>
                <h3 className="text-2xl font-bold text-dark mb-3">Chúng tôi sản xuất</h3>
                <p className="text-muted leading-relaxed">Khi có đơn hàng, hệ thống tự động ghi nhận, tiến hành thêu và gửi trực tiếp đến tay khách hàng dưới tên thương hiệu của bạn.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Product Showcase */}
        <section className="py-24 max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-extrabold text-dark mb-4">Sản phẩm nổi bật</h2>
              <p className="text-lg text-muted">Phôi chất lượng cao, sẵn sàng để thêu thiết kế của bạn.</p>
            </div>
            <Link href="/product" className="text-brand font-bold hover:text-brand-dark hidden md:block">
              Xem tất cả Catalog &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Catalog Item 1 */}
            <Link href="/product/tote-canvas" className="group block border border-gray-200 rounded-xl overflow-hidden hover:border-brand hover:shadow-xl transition-all">
              <div className="bg-surface p-8 relative">
                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-brand shadow-sm border border-gray-100">Bestseller</div>
                <img src="https://images.unsplash.com/photo-1596765103631-f187063be84b?auto=format&fit=crop&w=400&q=80" alt="Blank Tote" className="w-full h-48 object-contain group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-5 bg-white">
                <h3 className="font-bold text-dark text-lg mb-1 group-hover:text-brand transition-colors">Túi Tote Vải Canvas</h3>
                <p className="text-sm text-gray-500 mb-3">Premium Cotton 100%</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 block">Giá sản xuất từ</span>
                    <span className="font-bold text-brand text-lg">85.000đ</span>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-brand group-hover:text-white transition-colors">→</span>
                </div>
              </div>
            </Link>
            
            {/* Catalog Item 2 */}
            <Link href="/product/goi-linen" className="group block border border-gray-200 rounded-xl overflow-hidden hover:border-brand hover:shadow-xl transition-all">
              <div className="bg-surface p-8">
                <img src="https://images.unsplash.com/photo-1620138546344-7b2c38516bef?auto=format&fit=crop&w=400&q=80" alt="Hat" className="w-full h-48 object-contain group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-5 bg-white">
                <h3 className="font-bold text-dark text-lg mb-1 group-hover:text-brand transition-colors">Vỏ gối Linen Trơn</h3>
                <p className="text-sm text-gray-500 mb-3">Linen tự nhiên</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 block">Giá sản xuất từ</span>
                    <span className="font-bold text-brand text-lg">95.000đ</span>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-brand group-hover:text-white transition-colors">→</span>
                </div>
              </div>
            </Link>

            {/* Catalog Item 3 */}
            <Link href="/product/mu-bucket" className="group block border border-gray-200 rounded-xl overflow-hidden hover:border-brand hover:shadow-xl transition-all">
              <div className="bg-surface p-8">
                <img src="https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=400&q=80" alt="Bucket Hat" className="w-full h-48 object-contain group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-5 bg-white">
                <h3 className="font-bold text-dark text-lg mb-1 group-hover:text-brand transition-colors">Mũ Bucket</h3>
                <p className="text-sm text-gray-500 mb-3">100% Khaki</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 block">Giá sản xuất từ</span>
                    <span className="font-bold text-brand text-lg">110.000đ</span>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-brand group-hover:text-white transition-colors">→</span>
                </div>
              </div>
            </Link>

            {/* Catalog Item 4 */}
            <Link href="/product/ao-phong" className="group block border border-gray-200 rounded-xl overflow-hidden hover:border-brand hover:shadow-xl transition-all">
              <div className="bg-surface p-8">
                <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80" alt="T-Shirt" className="w-full h-48 object-contain group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-5 bg-white">
                <h3 className="font-bold text-dark text-lg mb-1 group-hover:text-brand transition-colors">Áo Phông Unisex</h3>
                <p className="text-sm text-gray-500 mb-3">Cotton Compact 250gsm</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 block">Giá sản xuất từ</span>
                    <span className="font-bold text-brand text-lg">150.000đ</span>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-brand group-hover:text-white transition-colors">→</span>
                </div>
              </div>
            </Link>
          </div>
        </section>

      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-brand font-extrabold text-2xl flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-brand text-white flex items-center justify-center text-sm">M</span>
            MiênMan
          </div>
          <p className="text-sm text-gray-500">&copy; 2026 Miên Man. Nền tảng thêu theo yêu cầu.</p>
        </div>
      </footer>
    </>
  );
}
