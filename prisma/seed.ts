import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user (password: admin123)
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@mienman.vn" },
    update: {},
    create: {
      email: "admin@mienman.vn",
      hashedPassword: adminPassword,
      fullName: "Admin",
      role: "admin",
    },
  });

  // Create test customer (password: test123)
  const customerPassword = await hash("test123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "khach@mienman.vn" },
    update: {},
    create: {
      email: "khach@mienman.vn",
      hashedPassword: customerPassword,
      fullName: "Khách Test",
      role: "customer",
      phone: "0901234567",
    },
  });

  // Categories
  const ao = await prisma.category.upsert({
    where: { slug: "ao" },
    update: {},
    create: { name: "Áo", slug: "ao", description: "Các loại áo thời trang" },
  });

  const quan = await prisma.category.upsert({
    where: { slug: "quan" },
    update: {},
    create: { name: "Quần", slug: "quan", description: "Các loại quần thời trang" },
  });

  const phukien = await prisma.category.upsert({
    where: { slug: "phu-kien" },
    update: {},
    create: { name: "Phụ kiện", slug: "phu-kien", description: "Phụ kiện thời trang" },
  });

  const giaydep = await prisma.category.upsert({
    where: { slug: "giay-dep" },
    update: {},
    create: { name: "Giày dép", slug: "giay-dep", description: "Giày dép các loại" },
  });

  // Products
  const products = [
    { name: "Áo thun basic trắng", slug: "ao-thun-basic-trang", description: "Áo thun cotton 100% form regular fit", price: 199000, salePrice: 149000, stock: 50, categoryId: ao.id, images: JSON.stringify(["https://placehold.co/600x800/f8f8f8/333?text=Ao+Thun+Trang"]) },
    { name: "Áo thun basic đen", slug: "ao-thun-basic-den", description: "Áo thun cotton 100% form regular fit", price: 199000, salePrice: null, stock: 35, categoryId: ao.id, images: JSON.stringify(["https://placehold.co/600x800/333/fff?text=Ao+Thun+Den"]) },
    { name: "Áo sơ mi linen", slug: "ao-so-mi-linen", description: "Áo sơ mi chất liệu linen thoáng mát", price: 450000, salePrice: 389000, stock: 20, categoryId: ao.id, images: JSON.stringify(["https://placehold.co/600x800/e8dcc8/333?text=So+Mi+Linen"]) },
    { name: "Quần jeans slim fit", slug: "quan-jeans-slim-fit", description: "Quần jeans co giãn form slim fit", price: 550000, salePrice: 459000, stock: 30, categoryId: quan.id, images: JSON.stringify(["https://placehold.co/600x800/4a6fa5/fff?text=Jeans+Slim"]) },
    { name: "Quần kaki", slug: "quan-kaki", description: "Quần kaki form regular thoải mái", price: 399000, salePrice: null, stock: 40, categoryId: quan.id, images: JSON.stringify(["https://placehold.co/600x800/c4a97d/333?text=Quan+Kaki"]) },
    { name: "Quần short thể thao", slug: "quan-short-the-thao", description: "Quần short thể thao chất liệu thấm hút", price: 249000, salePrice: 199000, stock: 60, categoryId: quan.id, images: JSON.stringify(["https://placehold.co/600x800/2d5a27/fff?text=Short+Sport"]) },
    { name: "Nón bucket", slug: "non-bucket", description: "Nón bucket vải canvas phong cách", price: 159000, salePrice: null, stock: 100, categoryId: phukien.id, images: JSON.stringify(["https://placehold.co/600x800/8b6914/fff?text=Non+Bucket"]) },
    { name: "Túi tote canvas", slug: "tui-tote-canvas", description: "Túi tote canvas dày dặn tiện lợi", price: 189000, salePrice: 149000, stock: 45, categoryId: phukien.id, images: JSON.stringify(["https://placehold.co/600x800/556b2f/fff?text=Tui+Tote"]) },
    { name: "Giày sneaker trắng", slug: "giay-sneaker-trang", description: "Giày sneaker da trắng đế cao su", price: 750000, salePrice: 599000, stock: 25, categoryId: giaydep.id, images: JSON.stringify(["https://placehold.co/600x800/f0f0f0/333?text=Sneaker+Trang"]) },
    { name: "Dép quai ngang", slug: "dep-quai-ngang", description: "Dép quai ngang êm nhẹ phù hợp mọi lúc", price: 199000, salePrice: null, stock: 80, categoryId: giaydep.id, images: JSON.stringify(["https://placehold.co/600x800/2f4f4f/fff?text=Dep+Quai+Ngang"]) },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  console.log("Seed complete!");
  console.log("Admin: admin@mienman.vn / admin123");
  console.log("Customer: khach@mienman.vn / test123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
