export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  stock: number;
  images: string[];
  categoryId: string;
  category: Category;
}

export const categories: Category[] = [
  { id: "cat-ao", name: "Áo", slug: "ao", description: "Các loại áo thời trang" },
  { id: "cat-quan", name: "Quần", slug: "quan", description: "Các loại quần thời trang" },
  { id: "cat-pk", name: "Phụ kiện", slug: "phu-kien", description: "Phụ kiện thời trang" },
  { id: "cat-gd", name: "Giày dép", slug: "giay-dep", description: "Giày dép các loại" },
];

const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

export const products: Product[] = [
  { id: "p1", name: "Áo thun basic trắng", slug: "ao-thun-basic-trang", description: "Áo thun cotton 100% form regular fit", price: 199000, salePrice: 149000, stock: 50, images: ["https://placehold.co/600x800/f8f8f8/333?text=Ao+Thun+Trang"], categoryId: "cat-ao", category: catMap["cat-ao"] },
  { id: "p2", name: "Áo thun basic đen", slug: "ao-thun-basic-den", description: "Áo thun cotton 100% form regular fit", price: 199000, salePrice: null, stock: 35, images: ["https://placehold.co/600x800/333/fff?text=Ao+Thun+Den"], categoryId: "cat-ao", category: catMap["cat-ao"] },
  { id: "p3", name: "Áo sơ mi linen", slug: "ao-so-mi-linen", description: "Áo sơ mi chất liệu linen thoáng mát", price: 450000, salePrice: 389000, stock: 20, images: ["https://placehold.co/600x800/e8dcc8/333?text=So+Mi+Linen"], categoryId: "cat-ao", category: catMap["cat-ao"] },
  { id: "p4", name: "Quần jeans slim fit", slug: "quan-jeans-slim-fit", description: "Quần jeans co giãn form slim fit", price: 550000, salePrice: 459000, stock: 30, images: ["https://placehold.co/600x800/4a6fa5/fff?text=Jeans+Slim"], categoryId: "cat-quan", category: catMap["cat-quan"] },
  { id: "p5", name: "Quần kaki", slug: "quan-kaki", description: "Quần kaki form regular thoải mái", price: 399000, salePrice: null, stock: 40, images: ["https://placehold.co/600x800/c4a97d/333?text=Quan+Kaki"], categoryId: "cat-quan", category: catMap["cat-quan"] },
  { id: "p6", name: "Quần short thể thao", slug: "quan-short-the-thao", description: "Quần short thể thao chất liệu thấm hút", price: 249000, salePrice: 199000, stock: 60, images: ["https://placehold.co/600x800/2d5a27/fff?text=Short+Sport"], categoryId: "cat-quan", category: catMap["cat-quan"] },
  { id: "p7", name: "Nón bucket", slug: "non-bucket", description: "Nón bucket vải canvas phong cách", price: 159000, salePrice: null, stock: 100, images: ["https://placehold.co/600x800/8b6914/fff?text=Non+Bucket"], categoryId: "cat-pk", category: catMap["cat-pk"] },
  { id: "p8", name: "Túi tote canvas", slug: "tui-tote-canvas", description: "Túi tote canvas dày dặn tiện lợi", price: 189000, salePrice: 149000, stock: 45, images: ["https://placehold.co/600x800/556b2f/fff?text=Tui+Tote"], categoryId: "cat-pk", category: catMap["cat-pk"] },
  { id: "p9", name: "Giày sneaker trắng", slug: "giay-sneaker-trang", description: "Giày sneaker da trắng đế cao su", price: 750000, salePrice: 599000, stock: 25, images: ["https://placehold.co/600x800/f0f0f0/333?text=Sneaker+Trang"], categoryId: "cat-gd", category: catMap["cat-gd"] },
  { id: "p10", name: "Dép quai ngang", slug: "dep-quai-ngang", description: "Dép quai ngang êm nhẹ phù hợp mọi lúc", price: 199000, salePrice: null, stock: 80, images: ["https://placehold.co/600x800/2f4f4f/fff?text=Dep+Quai+Ngang"], categoryId: "cat-gd", category: catMap["cat-gd"] },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  const cat = categories.find((c) => c.slug === categorySlug);
  if (!cat) return products;
  return products.filter((p) => p.categoryId === cat.id);
}
