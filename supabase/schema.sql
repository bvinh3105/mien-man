-- ============================================
-- Miên Man - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. PROFILES (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  phone text,
  avatar_url text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. CATEGORIES
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references public.categories(id),
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 3. PRODUCTS
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  price bigint not null check (price >= 0),
  sale_price bigint check (sale_price >= 0),
  images text[] default '{}',
  category_id uuid references public.categories(id),
  stock int default 0 check (stock >= 0),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Price stored as VND integer (no decimals needed)

-- 4. CART
create table public.cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- 5. ORDERS
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'paid', 'shipping', 'delivered', 'cancelled')),
  total bigint not null check (total >= 0),
  shipping_name text not null,
  shipping_phone text not null,
  shipping_address text not null,
  shipping_note text,
  payment_method text default 'cod' check (payment_method in ('cod', 'bank_transfer', 'vnpay', 'momo')),
  payment_status text default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. ORDER ITEMS
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  product_name text not null,
  product_price bigint not null,
  quantity int not null check (quantity > 0),
  subtotal bigint not null check (subtotal >= 0)
);

-- 7. ADDRESSES (saved shipping addresses)
create table public.addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  full_name text not null,
  phone text not null,
  address text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_products_category on public.products(category_id);
create index idx_products_slug on public.products(slug);
create index idx_products_active on public.products(is_active) where is_active = true;
create index idx_categories_slug on public.categories(slug);
create index idx_cart_user on public.cart_items(user_id);
create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_order_items_order on public.order_items(order_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Categories: public read
alter table public.categories enable row level security;

create policy "Anyone can view active categories"
  on public.categories for select
  using (is_active = true);

create policy "Admins can manage categories"
  on public.categories for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Products: public read
alter table public.products enable row level security;

create policy "Anyone can view active products"
  on public.products for select
  using (is_active = true);

create policy "Admins can manage products"
  on public.products for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Cart: user owns their cart
alter table public.cart_items enable row level security;

create policy "Users manage own cart"
  on public.cart_items for all
  using (auth.uid() = user_id);

-- Orders: user sees own orders
alter table public.orders enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can create orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage all orders"
  on public.orders for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Order items: follow order access
alter table public.order_items enable row level security;

create policy "Users can view own order items"
  on public.order_items for select
  using (
    exists (select 1 from public.orders where orders.id = order_id and orders.user_id = auth.uid())
  );

create policy "Users can insert order items for own orders"
  on public.order_items for insert
  with check (
    exists (select 1 from public.orders where orders.id = order_id and orders.user_id = auth.uid())
  );

create policy "Admins can manage all order items"
  on public.order_items for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Addresses: user owns their addresses
alter table public.addresses enable row level security;

create policy "Users manage own addresses"
  on public.addresses for all
  using (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================
-- SAMPLE DATA
-- ============================================
insert into public.categories (name, slug, description) values
  ('Áo', 'ao', 'Các loại áo thời trang'),
  ('Quần', 'quan', 'Các loại quần thời trang'),
  ('Phụ kiện', 'phu-kien', 'Phụ kiện thời trang'),
  ('Giày dép', 'giay-dep', 'Giày dép các loại');

insert into public.products (name, slug, description, price, sale_price, stock, category_id, images) values
  ('Áo thun basic trắng', 'ao-thun-basic-trang', 'Áo thun cotton 100% form regular fit', 199000, 149000, 50,
    (select id from public.categories where slug = 'ao'),
    array['https://placehold.co/600x800/f8f8f8/333?text=Ao+Thun+Trang']),
  ('Áo thun basic đen', 'ao-thun-basic-den', 'Áo thun cotton 100% form regular fit', 199000, null, 35,
    (select id from public.categories where slug = 'ao'),
    array['https://placehold.co/600x800/333/fff?text=Ao+Thun+Den']),
  ('Áo sơ mi linen', 'ao-so-mi-linen', 'Áo sơ mi chất liệu linen thoáng mát', 450000, 389000, 20,
    (select id from public.categories where slug = 'ao'),
    array['https://placehold.co/600x800/e8dcc8/333?text=So+Mi+Linen']),
  ('Quần jeans slim fit', 'quan-jeans-slim-fit', 'Quần jeans co giãn form slim fit', 550000, 459000, 30,
    (select id from public.categories where slug = 'quan'),
    array['https://placehold.co/600x800/4a6fa5/fff?text=Jeans+Slim']),
  ('Quần kaki', 'quan-kaki', 'Quần kaki form regular thoải mái', 399000, null, 40,
    (select id from public.categories where slug = 'quan'),
    array['https://placehold.co/600x800/c4a97d/333?text=Quan+Kaki']),
  ('Quần short thể thao', 'quan-short-the-thao', 'Quần short thể thao chất liệu thấm hút', 249000, 199000, 60,
    (select id from public.categories where slug = 'quan'),
    array['https://placehold.co/600x800/2d5a27/fff?text=Short+Sport']),
  ('Nón bucket', 'non-bucket', 'Nón bucket vải canvas phong cách', 159000, null, 100,
    (select id from public.categories where slug = 'phu-kien'),
    array['https://placehold.co/600x800/8b6914/fff?text=Non+Bucket']),
  ('Túi tote canvas', 'tui-tote-canvas', 'Túi tote canvas dày dặn tiện lợi', 189000, 149000, 45,
    (select id from public.categories where slug = 'phu-kien'),
    array['https://placehold.co/600x800/556b2f/fff?text=Tui+Tote']),
  ('Giày sneaker trắng', 'giay-sneaker-trang', 'Giày sneaker da trắng đế cao su', 750000, 599000, 25,
    (select id from public.categories where slug = 'giay-dep'),
    array['https://placehold.co/600x800/f0f0f0/333?text=Sneaker+Trang']),
  ('Dép quai ngang', 'dep-quai-ngang', 'Dép quai ngang êm nhẹ phù hợp mọi lúc', 199000, null, 80,
    (select id from public.categories where slug = 'giay-dep'),
    array['https://placehold.co/600x800/2f4f4f/fff?text=Dep+Quai+Ngang']);
