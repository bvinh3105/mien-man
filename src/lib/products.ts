// ============================================================
// Products Service Layer (Step 2 — Data từ Supabase)
// ============================================================
// Chiến lược: Hybrid Static + Runtime Refresh
// - Build-time (SSG): dùng data.ts static để không cần Supabase online
// - Runtime (client): thử fetch Supabase → nếu OK thì refresh UI, offline thì im lặng
// - Admin CRUD: thao tác trực tiếp Supabase (báo lỗi nếu offline)
// ============================================================

import { products as staticProducts, categories as staticCategories, type Product, type Category } from "./data";
import { getSupabase } from "./supabase";

export type { Product, Category } from "./data";

// Input shape khi tạo/sửa sản phẩm
export interface ProductInput {
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  stock: number;
  images: string[];
  categoryId: string;
}

// Kiểu nội bộ để check Supabase có sẵn không
let _supabaseAvailable: boolean | null = null;

export async function checkSupabaseAvailable(): Promise<boolean> {
  if (_supabaseAvailable !== null) return _supabaseAvailable;
  try {
    const client = getSupabase();
    const { error } = await client.from("products").select("id").limit(1);
    _supabaseAvailable = !error;
    return _supabaseAvailable;
  } catch {
    _supabaseAvailable = false;
    return false;
  }
}

// ============================================================
// STATIC (đồng bộ, dùng cho SSG / SEO)
// ============================================================

export function listProductsStatic(): Product[] {
  return staticProducts;
}

export function listCategoriesStatic(): Category[] {
  return staticCategories;
}

export function getProductBySlugStatic(slug: string): Product | undefined {
  return staticProducts.find((p) => p.slug === slug);
}

export function getProductsByCategoryStatic(categorySlug: string): Product[] {
  const cat = staticCategories.find((c) => c.slug === categorySlug);
  if (!cat) return staticProducts;
  return staticProducts.filter((p) => p.categoryId === cat.id);
}

// ============================================================
// LIVE (async, dùng cho runtime refresh + Admin)
// ============================================================

// Map DB row → UI Product shape
type DbProduct = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  sale_price: number | null;
  images: string[];
  is_active: boolean;
};
type DbCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

function dbToProduct(db: DbProduct, cat?: DbCategory | Category): Product {
  const category: Category = cat
    ? { id: cat.id, name: cat.name, slug: cat.slug, description: cat.description ?? "" }
    : { id: "unknown", name: "—", slug: "unknown", description: "" };
  return {
    id: db.id,
    name: db.name,
    slug: db.slug,
    description: db.description ?? "",
    price: db.base_price,
    salePrice: db.sale_price,
    stock: 0, // stock nằm ở product_variants — MVP dùng 0, sẽ query sum sau
    images: db.images ?? [],
    categoryId: db.category_id ?? "",
    category,
  };
}

export async function listProductsLive(): Promise<Product[]> {
  const client = getSupabase();
  const [{ data: prods, error: pErr }, { data: cats, error: cErr }] = await Promise.all([
    client.from("products").select("id, category_id, name, slug, description, base_price, sale_price, images, is_active").eq("is_active", true).order("created_at", { ascending: false }),
    client.from("categories").select("id, name, slug, description"),
  ]);
  if (pErr) throw pErr;
  if (cErr) throw cErr;

  const catList = (cats ?? []) as unknown as DbCategory[];
  const prodList = (prods ?? []) as unknown as DbProduct[];
  const catMap = new Map(catList.map((c) => [c.id, c]));
  return prodList.map((p) => dbToProduct(p, catMap.get(p.category_id ?? "")));
}

export async function listCategoriesLive(): Promise<Category[]> {
  const client = getSupabase();
  const { data, error } = await client.from("categories").select("id, name, slug, description").order("sort_order");
  if (error) throw error;
  const list = (data ?? []) as unknown as DbCategory[];
  return list.map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description ?? "" }));
}

export async function getProductBySlugLive(slug: string): Promise<Product | null> {
  const client = getSupabase();
  const { data, error } = await client.from("products").select("id, category_id, name, slug, description, base_price, sale_price, images, is_active").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as unknown as DbProduct;
  let cat: DbCategory | undefined;
  if (row.category_id) {
    const { data: catRow } = await client.from("categories").select("id, name, slug, description").eq("id", row.category_id).maybeSingle();
    cat = (catRow as unknown as DbCategory) ?? undefined;
  }
  return dbToProduct(row, cat);
}

// ============================================================
// ADMIN CRUD (yêu cầu Supabase online + role=admin)
// ============================================================

export async function createProduct(input: ProductInput): Promise<Product> {
  const client = getSupabase() as unknown as { from: (t: string) => any };
  const { data, error } = await client
    .from("products")
    .insert({
      category_id: input.categoryId || null,
      name: input.name,
      slug: input.slug,
      description: input.description,
      base_price: input.price,
      sale_price: input.salePrice,
      images: input.images,
      is_active: true,
    })
    .select()
    .single();
  if (error) throw error;
  return dbToProduct(data as unknown as DbProduct);
}

export async function updateProduct(id: string, patch: Partial<ProductInput>): Promise<Product> {
  const client = getSupabase() as unknown as { from: (t: string) => any };
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.slug !== undefined) update.slug = patch.slug;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.price !== undefined) update.base_price = patch.price;
  if (patch.salePrice !== undefined) update.sale_price = patch.salePrice;
  if (patch.images !== undefined) update.images = patch.images;
  if (patch.categoryId !== undefined) update.category_id = patch.categoryId || null;

  const { data, error } = await client.from("products").update(update).eq("id", id).select().single();
  if (error) throw error;
  return dbToProduct(data as unknown as DbProduct);
}

export async function deleteProduct(id: string): Promise<void> {
  const client = getSupabase() as unknown as { from: (t: string) => any };
  // Soft delete: set is_active = false thay vì DELETE để giữ historical order_items
  const { error } = await client.from("products").update({ is_active: false }).eq("id", id);
  if (error) throw error;
}

// ============================================================
// HYBRID HOOK — dùng trong client component
// ============================================================
// Trả về: { products, categories, loading, error, source: 'static' | 'live', refresh }
// Chiến lược:
//   1. render ngay với static (không blocking)
//   2. background fetch Supabase → nếu OK, replace state
//   3. offline: giữ static, error = null (im lặng)

import { useEffect, useState, useCallback } from "react";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(staticProducts);
  const [categories, setCategories] = useState<Category[]>(staticCategories);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"static" | "live">("static");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([listProductsLive(), listCategoriesLive()]);
      if (prods.length > 0) {
        setProducts(prods);
        setCategories(cats);
        setSource("live");
        setError(null);
      }
    } catch (e) {
      // Silent fallback — giữ static
      setError(e instanceof Error ? e.message : "Không kết nối được Supabase");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { products, categories, loading, error, source, refresh };
}
