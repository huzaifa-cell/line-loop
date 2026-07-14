-- ============================================
-- EXTENSIONS
-- ============================================
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (synced from Clerk via webhook)
-- ============================================
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  clerk_user_id text unique not null,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('admin', 'staff', 'customer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- CATEGORIES / COLLECTIONS
-- ============================================
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- PRODUCTS
-- ============================================
create table products (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  base_price numeric(10,2) not null,
  compare_at_price numeric(10,2), -- for showing strikethrough "was" price
  sku_prefix text,
  category_id uuid references categories(id) on delete set null,
  is_published boolean not null default false,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  sku text unique not null,
  color text,
  size text,
  price_override numeric(10,2), -- null = use product.base_price
  stock_quantity int not null default 0,
  low_stock_threshold int not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table inventory_log (
  id uuid primary key default uuid_generate_v4(),
  variant_id uuid not null references product_variants(id) on delete cascade,
  change_amount int not null, -- positive = restock, negative = sale/adjustment
  reason text not null check (reason in ('sale', 'manual_adjustment', 'restock', 'return')),
  changed_by uuid references profiles(id),
  order_id uuid, -- nullable fk, set when reason = 'sale' or 'return'
  created_at timestamptz not null default now()
);

-- ============================================
-- CUSTOMERS & ADDRESSES
-- ============================================
create table customer_addresses (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  full_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text,
  postal_code text not null,
  country text not null,
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================
-- ORDERS
-- ============================================
create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null, -- human-readable, e.g. LL-100234
  profile_id uuid references profiles(id), -- nullable: guest checkout
  guest_email text, -- used when profile_id is null
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned')
  ),
  payment_method text not null check (payment_method in ('card', 'cod', 'bank_transfer')),
  payment_status text not null default 'pending' check (
    payment_status in (
      'pending', 'authorized', 'paid', 'failed', 'refunded',
      'cod_pending', 'cod_collected',
      'bank_transfer_under_review', 'bank_transfer_verified', 'bank_transfer_rejected'
    )
  ),
  -- card fields — NEVER store PAN or CVV, last4/expiry/brand only
  card_last4 text,
  card_expiry text,
  card_brand text,
  -- bank transfer fields
  bank_transfer_amount_due numeric(10,2),
  bank_transfer_reference text,
  bank_transfer_screenshot_path text,
  bank_transfer_screenshot_hash text,
  payment_hold_expires_at timestamptz,
  verified_by uuid references profiles(id),
  verified_at timestamptz,
  subtotal numeric(10,2) not null,
  discount_amount numeric(10,2) not null default 0,
  shipping_amount numeric(10,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  shipping_address jsonb not null,
  discount_code text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  variant_id uuid references product_variants(id),
  product_title text not null,
  variant_label text,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create table order_status_history (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  status text not null,
  changed_by uuid references profiles(id),
  note text,
  created_at timestamptz not null default now()
);

-- ============================================
-- DISCOUNTS
-- ============================================
create table discounts (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  type text not null check (type in ('percentage', 'flat')),
  value numeric(10,2) not null,
  min_order_value numeric(10,2) default 0,
  usage_limit int, -- null = unlimited
  times_used int not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================
-- REVIEWS
-- ============================================
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  profile_id uuid references profiles(id),
  guest_name text,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  moderated_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ============================================
-- BANNERS / HERO CONTENT
-- ============================================
create table banners (
  id uuid primary key default uuid_generate_v4(),
  placement text not null check (placement in ('homepage_hero', 'announcement_bar', 'category_banner')),
  headline text,
  subtext text,
  cta_label text,
  cta_url text,
  storage_path text,
  is_live boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- SHIPPING & TAX SETTINGS
-- ============================================
create table shipping_zones (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  countries text[] not null,
  flat_rate numeric(10,2) not null,
  free_shipping_threshold numeric(10,2),
  is_active boolean not null default true
);

create table tax_settings (
  id uuid primary key default uuid_generate_v4(),
  region text not null,
  rate_percent numeric(5,2) not null,
  is_active boolean not null default true
);

-- ============================================
-- ACTIVITY / AUDIT LOG
-- ============================================
create table activity_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_products_category on products(category_id);
create index idx_variants_product on product_variants(product_id);
create index idx_orders_profile on orders(profile_id);
create index idx_orders_status on orders(status);
create index idx_order_items_order on order_items(order_id);
create index idx_reviews_product on reviews(product_id);
create index idx_reviews_status on reviews(status);
create index idx_activity_log_entity on activity_log(entity_type, entity_id);
create index idx_orders_bank_transfer_hash on orders(bank_transfer_screenshot_hash) where bank_transfer_screenshot_hash is not null;
create index idx_orders_payment_hold on orders(payment_hold_expires_at) where payment_hold_expires_at is not null;

-- ============================================
-- RLS POLICIES
-- ============================================
-- Utility function for admin/staff check
create or replace function auth.is_admin_or_staff()
returns boolean as $$
  select exists (
    select 1 from profiles
    where profiles.clerk_user_id = auth.jwt() ->> 'sub'
    and profiles.role in ('admin', 'staff')
  );
$$ language sql security definer;

-- PROFILES
alter table profiles enable row level security;
create policy "Users can read own profile" on profiles for select using (clerk_user_id = auth.jwt() ->> 'sub');
create policy "Admin/staff can read all profiles" on profiles for select using (auth.is_admin_or_staff());
create policy "Admin/staff can update profiles" on profiles for update using (auth.is_admin_or_staff());
-- Note: Service role (used by Clerk webhook) bypasses RLS for inserts/updates

-- CATEGORIES
alter table categories enable row level security;
create policy "Public can read published categories" on categories for select using (is_published = true);
create policy "Admin/staff can full access categories" on categories for all using (auth.is_admin_or_staff());

-- PRODUCTS
alter table products enable row level security;
create policy "Public can read published products" on products for select using (is_published = true);
create policy "Admin/staff can full access products" on products for all using (auth.is_admin_or_staff());

-- PRODUCT IMAGES
alter table product_images enable row level security;
create policy "Public can read images of published products" on product_images for select using (
  exists (select 1 from products where products.id = product_images.product_id and products.is_published = true)
);
create policy "Admin/staff can full access product images" on product_images for all using (auth.is_admin_or_staff());

-- PRODUCT VARIANTS
alter table product_variants enable row level security;
create policy "Public can read variants of published products" on product_variants for select using (
  exists (select 1 from products where products.id = product_variants.product_id and products.is_published = true)
);
create policy "Admin/staff can full access product variants" on product_variants for all using (auth.is_admin_or_staff());

-- INVENTORY LOG
alter table inventory_log enable row level security;
create policy "Admin/staff can full access inventory log" on inventory_log for all using (auth.is_admin_or_staff());

-- CUSTOMER ADDRESSES
alter table customer_addresses enable row level security;
create policy "Users can full access own addresses" on customer_addresses for all using (
  profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
);
create policy "Admin/staff can read all addresses" on customer_addresses for select using (auth.is_admin_or_staff());

-- ORDERS & ORDER ITEMS
alter table orders enable row level security;
create policy "Users can read own orders" on orders for select using (
  profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
);
-- Allow guest tracking logic securely via a server action with service role, not RLS.
create policy "Admin/staff can full access orders" on orders for all using (auth.is_admin_or_staff());

alter table order_items enable row level security;
create policy "Users can read own order items" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub'))
);
create policy "Admin/staff can full access order items" on order_items for all using (auth.is_admin_or_staff());

alter table order_status_history enable row level security;
create policy "Users can read own order history" on order_status_history for select using (
  exists (select 1 from orders where orders.id = order_status_history.order_id and orders.profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub'))
);
create policy "Admin/staff can full access order history" on order_status_history for all using (auth.is_admin_or_staff());

-- DISCOUNTS
alter table discounts enable row level security;
create policy "Public can read active discounts" on discounts for select using (is_active = true and (starts_at is null or starts_at <= now()) and (expires_at is null or expires_at >= now()));
create policy "Admin/staff can full access discounts" on discounts for all using (auth.is_admin_or_staff());

-- REVIEWS
alter table reviews enable row level security;
create policy "Public can read approved reviews" on reviews for select using (status = 'approved');
create policy "Admin/staff can full access reviews" on reviews for all using (auth.is_admin_or_staff());
create policy "Users can read own reviews" on reviews for select using (
  profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
);

-- BANNERS
alter table banners enable row level security;
create policy "Public can read live banners" on banners for select using (is_live = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));
create policy "Admin/staff can full access banners" on banners for all using (auth.is_admin_or_staff());

-- SHIPPING & TAX SETTINGS
alter table shipping_zones enable row level security;
create policy "Public can read shipping zones" on shipping_zones for select using (true);
create policy "Admin/staff can full access shipping zones" on shipping_zones for all using (auth.is_admin_or_staff());

alter table tax_settings enable row level security;
create policy "Public can read tax settings" on tax_settings for select using (true);
create policy "Admin/staff can full access tax settings" on tax_settings for all using (auth.is_admin_or_staff());

-- ACTIVITY LOG
alter table activity_log enable row level security;
create policy "Admin/staff can read activity log" on activity_log for select using (auth.is_admin_or_staff());

-- ============================================
-- STORAGE BUCKETS (Note: Ensure supabase storage API is enabled)
-- ============================================
-- We insert into `storage.buckets` but typically you'd run these manually or via UI.
-- For script completeness:
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('payment-screenshots', 'payment-screenshots', false) on conflict do nothing;

-- Storage Policies: Product Images (Public Read)
create policy "Public can read product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "Admin/staff can insert product images" on storage.objects for insert with check (bucket_id = 'product-images' and auth.is_admin_or_staff());
create policy "Admin/staff can update product images" on storage.objects for update using (bucket_id = 'product-images' and auth.is_admin_or_staff());
create policy "Admin/staff can delete product images" on storage.objects for delete using (bucket_id = 'product-images' and auth.is_admin_or_staff());

-- Storage Policies: Payment Screenshots (Private)
create policy "Admin/staff can read payment screenshots" on storage.objects for select using (bucket_id = 'payment-screenshots' and auth.is_admin_or_staff());
-- Note: A customer can upload but mapping it exactly to their auth ID in a generic bucket policy requires path matching.
-- For simplicity, insertion can be done via a Service Role server action, or this policy:
create policy "Authenticated users can upload payment screenshots" on storage.objects for insert with check (bucket_id = 'payment-screenshots' and auth.role() = 'authenticated');
