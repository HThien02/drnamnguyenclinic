-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Results table (Before/After images)
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Signature Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('facial', 'body')),
  short_description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  suitable_for JSONB NOT NULL DEFAULT '[]'::jsonb,
  techniques JSONB NOT NULL DEFAULT '[]'::jsonb,
  recovery TEXT NOT NULL DEFAULT '',
  risks_and_considerations JSONB NOT NULL DEFAULT '[]'::jsonb,
  pre_consultation TEXT NOT NULL DEFAULT '',
  price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'USD',
  price_display_type TEXT NOT NULL DEFAULT 'contact' CHECK (price_display_type IN ('from', 'fixed', 'contact')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view services" ON services;
CREATE POLICY "Public can view services" ON services FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage services" ON services;
CREATE POLICY "Admin can manage services" ON services FOR ALL USING (true) WITH CHECK (true);
GRANT SELECT, INSERT, UPDATE, DELETE ON services TO anon, authenticated;

CREATE TABLE IF NOT EXISTS contact_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  phone TEXT NOT NULL,
  whatsapp_phone TEXT NOT NULL DEFAULT '',
  whatsapp_message TEXT NOT NULL DEFAULT '',
  instagram_url TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  working_hours TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view contact settings" ON contact_settings;
CREATE POLICY "Public can view contact settings" ON contact_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can update contact settings" ON contact_settings;
CREATE POLICY "Admin can update contact settings" ON contact_settings FOR UPDATE USING (id = 1) WITH CHECK (id = 1);
GRANT SELECT ON contact_settings TO anon, authenticated;
GRANT UPDATE ON contact_settings TO authenticated;
INSERT INTO contact_settings (id, phone, whatsapp_phone, whatsapp_message, instagram_url, address, working_hours)
VALUES (1, '0932501411', '84932501411', 'Xin chào, tôi muốn tư vấn về...', 'https://www.instagram.com/hieuthien.1802/', '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', '09:00 — 19:00 (Thứ 2 - Chủ Nhật)')
ON CONFLICT (id) DO NOTHING;

-- Doctor profile images
CREATE TABLE IF NOT EXISTS doctor_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_primary_doctor_image(target_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE doctor_images SET is_primary = false;
  UPDATE doctor_images SET is_primary = true WHERE id = target_id;
END;
$$;

ALTER TABLE doctor_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view doctor images" ON doctor_images;
CREATE POLICY "Public can view doctor images" ON doctor_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage doctor images" ON doctor_images;
CREATE POLICY "Admin can manage doctor images" ON doctor_images FOR ALL USING (true) WITH CHECK (true);

-- Homepage section visibility
CREATE TABLE IF NOT EXISTS section_visibility (
  section_key TEXT PRIMARY KEY,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE section_visibility ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view section visibility" ON section_visibility;
CREATE POLICY "Public can view section visibility"
  ON section_visibility FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage section visibility" ON section_visibility;
CREATE POLICY "Admin can manage section visibility"
  ON section_visibility FOR ALL USING (true) WITH CHECK (true);

INSERT INTO section_visibility (section_key, is_visible) VALUES
  ('hero', true),
  ('stats', true),
  ('services', true),
  ('results', true),
  ('reviews', true),
  ('booking', true),
  ('footer', true),
  ('social', true)
ON CONFLICT (section_key) DO NOTHING;

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin profiles table (for authentication)
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_results_created_at ON results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_services_active_order ON services(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for bookings (public can read and create, admin can do everything)
CREATE POLICY "Public can view bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Public can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update bookings" ON bookings FOR UPDATE USING (true);
CREATE POLICY "Admin can delete bookings" ON bookings FOR DELETE USING (true);

-- Policies for results (public can read, admin can do everything)
CREATE POLICY "Public can view results" ON results FOR SELECT USING (true);
CREATE POLICY "Admin can insert results" ON results FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update results" ON results FOR UPDATE USING (true);
CREATE POLICY "Admin can delete results" ON results FOR DELETE USING (true);

-- Policies for services (public can view active services, admin can do everything)
CREATE POLICY "Public can view active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can insert services" ON services FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update services" ON services FOR UPDATE USING (true);
CREATE POLICY "Admin can delete services" ON services FOR DELETE USING (true);

-- Policies for reviews (public can read, admin can do everything)
CREATE POLICY "Public can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Admin can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update reviews" ON reviews FOR UPDATE USING (true);
CREATE POLICY "Admin can delete reviews" ON reviews FOR DELETE USING (true);

-- Policies for admin_profiles: authenticated users may verify their own allow-list record.
DROP POLICY IF EXISTS "Authenticated can view admin profiles" ON admin_profiles;
CREATE POLICY "Authenticated can view own admin profile" ON admin_profiles FOR SELECT TO authenticated USING (lower(email) = lower((select auth.jwt() ->> 'email')));
DROP POLICY IF EXISTS "Service role can manage admin profiles" ON admin_profiles;
CREATE POLICY "Service role can manage admin profiles" ON admin_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Insert initial seed data
INSERT INTO bookings (name, phone, service, note, status, created_at) VALUES
  ('Nguyễn Thu Trang', '0912345678', 'Điều trị mụn & thâm sẹo', 'Da nhạy cảm, muốn khám vào sáng thứ 7', 'pending', '2026-09-09T08:30:00.000Z'),
  ('Trần Văn Hoàng', '0988765432', 'Trẻ hóa da & Nâng cơ', 'Đã từng làm liệu trình nâng cơ 1 năm trước tại nước ngoài', 'contacted', '2026-09-08T14:15:00.000Z'),
  ('Lê Hoàng Yến', '0903456789', 'Điều trị nám, tàn nhang', 'Hẹn lịch tư vấn trực tiếp cùng Bác sĩ Nam', 'confirmed', '2026-09-07T10:00:00.000Z')
ON CONFLICT DO NOTHING;

INSERT INTO results (image_url, title, detail, created_at) VALUES
  ('/images/before-after-result.png', 'Điều trị mụn & thâm sẹo', 'Kết quả sau liệu trình 12 tuần phác đồ kép', '2026-09-01T00:00:00.000Z'),
  ('/images/before-after-surgery.png', 'Thẩm mỹ đường nét tự nhiên', 'Định hình viền hàm sau 6 tháng thực hiện', '2026-09-02T00:00:00.000Z'),
  ('/images/before-after-result.png', 'Phục hồi da nhiễm corticoid', 'Hàng rào bảo vệ da hồi phục sau 8 tuần', '2026-09-03T00:00:00.000Z'),
  ('/images/before-after-surgery.png', 'Trẻ hóa tầng sâu đa lớp', 'Cải thiện nếp nhăn và săn chắc da sau 4 tháng', '2026-09-04T00:00:00.000Z')
ON CONFLICT DO NOTHING;

INSERT INTO reviews (quote, name, role, created_at) VALUES
  ('Bác sĩ Nam tư vấn rất cặn kẽ, phân tích đúng nguyên nhân da bị tái phát mụn nhiều lần. Sau liệu trình 3 tháng, da mình khỏe và sáng hẳn ra.', 'Trần Minh Anh', 'Điều trị mụn & sẹo · 28 tuổi (TP.HCM)', '2026-09-01T00:00:00.000Z'),
  ('Không gian phòng khám vô trùng, riêng tư và đội ngũ y tá cực kỳ chu đáo. Cảm nhận được sự tôn trọng và phác đồ chuyên biệt cho riêng mình.', 'Lê Thảo Nguyên', 'Trẻ hóa da tầng sâu · 35 tuổi (Hà Nội)', '2026-09-02T00:00:00.000Z'),
  ('I traveled to Vietnam for skin treatment with Dr. Nam. Truly impressed by the medical professionalism, gentle technique, and remarkable results.', 'Sarah Jenkins', 'Medical Tourism · 32 years old (Australia)', '2026-09-03T00:00:00.000Z')
ON CONFLICT DO NOTHING;
