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
  { id: "cat-tranh", name: "Thêu trên tranh", slug: "theu-tranh", description: "Tranh thêu tay tinh xảo" },
  { id: "cat-ao", name: "Thêu trên quần áo", slug: "theu-quan-ao", description: "Thêu logo, tên, họa tiết" },
  { id: "cat-tui", name: "Thêu trên túi", slug: "theu-tui", description: "Túi vải, túi canvas, túi da" },
  { id: "cat-diy", name: "Tranh thêu tự làm", slug: "tu-lam", description: "Bộ nguyên liệu tự thêu tại nhà" },
];

const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

export const products: Product[] = [
  { id: "p1", name: "Tranh thêu hoa sen", slug: "tranh-theu-hoa-sen", description: "Tranh thêu tay hoa sen truyền thống, kích thước 30x40cm, khung gỗ tự nhiên", price: 850000, salePrice: 720000, stock: 15, images: ["https://placehold.co/600x800/EEF1EA/556b2f?text=Hoa+Sen"], categoryId: "cat-tranh", category: catMap["cat-tranh"] },
  { id: "p2", name: "Tranh thêu phong cảnh làng quê", slug: "tranh-theu-lang-que", description: "Tranh thêu phong cảnh đồng lúa, kích thước 40x60cm", price: 1200000, salePrice: null, stock: 8, images: ["https://placehold.co/600x800/D4DCCA/2f4f4f?text=Phong+Canh"], categoryId: "cat-tranh", category: catMap["cat-tranh"] },
  { id: "p3", name: "Thêu tên lên áo phông", slug: "theu-ten-ao-phong", description: "Thêu tên, chữ ký hoặc logo nhỏ lên áo phông, font chữ đa dạng", price: 120000, salePrice: 99000, stock: 100, images: ["https://placehold.co/600x800/f8f8f8/556b2f?text=Ao+Phong"], categoryId: "cat-ao", category: catMap["cat-ao"] },
  { id: "p4", name: "Thêu logo lên áo đồng phục", slug: "theu-logo-dong-phuc", description: "Thêu logo công ty, trường học lên áo đồng phục, đặt số lượng", price: 80000, salePrice: null, stock: 200, images: ["https://placehold.co/600x800/A8B496/fff?text=Dong+Phuc"], categoryId: "cat-ao", category: catMap["cat-ao"] },
  { id: "p5", name: "Thêu họa tiết áo khoác", slug: "theu-hoa-tiet-ao-khoac", description: "Thêu hoa, chim, hình thú lên vai hoặc ngực áo khoác", price: 250000, salePrice: 199000, stock: 30, images: ["https://placehold.co/600x800/7D8B6A/fff?text=Ao+Khoac"], categoryId: "cat-ao", category: catMap["cat-ao"] },
  { id: "p6", name: "Thêu tên lên túi tote", slug: "theu-tui-tote", description: "Thêu tên hoặc họa tiết theo yêu cầu lên túi tote canvas", price: 180000, salePrice: 149000, stock: 50, images: ["https://placehold.co/600x800/556b2f/fff?text=Tui+Tote"], categoryId: "cat-tui", category: catMap["cat-tui"] },
  { id: "p7", name: "Thêu trên túi da nhỏ", slug: "theu-tui-da", description: "Thêu hoa nhỏ hoặc chữ tắt lên túi da, tinh tế và sang trọng", price: 320000, salePrice: null, stock: 20, images: ["https://placehold.co/600x800/8b6914/fff?text=Tui+Da"], categoryId: "cat-tui", category: catMap["cat-tui"] },
  { id: "p8", name: "Bộ tự thêu hoa cúc", slug: "bo-tu-theu-hoa-cuc", description: "Bộ tự thêu hoa cúc dại tại nhà, bao gồm khung, chỉ, kim và hướng dẫn chi tiết", price: 199000, salePrice: 169000, stock: 60, images: ["https://placehold.co/600x800/EEF1EA/7D8B6A?text=Hoa+Cuc"], categoryId: "cat-diy", category: catMap["cat-diy"] },
  { id: "p9", name: "Bộ tự thêu hình mèo", slug: "bo-tu-theu-meo", description: "Bộ tự thêu hình mèo dễ thương cho người mới bắt đầu", price: 150000, salePrice: null, stock: 80, images: ["https://placehold.co/600x800/D4DCCA/2C2C2C?text=Hinh+Meo"], categoryId: "cat-diy", category: catMap["cat-diy"] },
  { id: "p10", name: "Bộ tự thêu chữ nghệ thuật", slug: "bo-tu-theu-chu", description: "Bộ tự thêu câu trích dẫn hoặc tên yêu thích, kích thước 20x20cm", price: 175000, salePrice: 145000, stock: 45, images: ["https://placehold.co/600x800/A8B496/fff?text=Chu+Nghe+Thuat"], categoryId: "cat-diy", category: catMap["cat-diy"] },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  const cat = categories.find((c) => c.slug === categorySlug);
  if (!cat) return products;
  return products.filter((p) => p.categoryId === cat.id);
}
