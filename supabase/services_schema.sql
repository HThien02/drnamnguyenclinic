-- Signature Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('Facial', 'Body')),
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_order ON services(display_order ASC);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Policies (Admin can do everything, public can read active services)
CREATE POLICY "Public can view active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage services" ON services FOR ALL USING (true);

-- Insert sample seed data
INSERT INTO services (name, slug, category, description, image_url, is_active, display_order) VALUES
('Rhinoplasty', 'rhinoplasty', 'Facial', 'Reshaping the nose with precision and natural-looking results for facial harmony.', '/images/before-after-surgery.png', true, 1),
('Facelift', 'facelift', 'Facial', 'Comprehensive facial rejuvenation to restore youthful contours and reduce signs of aging.', '/images/before-after-result.png', true, 2),
('Liposuction', 'liposuction', 'Body', 'Targeted fat removal to sculpt and contour the body for a refined silhouette.', '/images/before-after-surgery.png', true, 3),
('Tummy Tuck', 'tummy-tuck', 'Body', 'Abdominoplasty to remove excess skin and tighten abdominal muscles for a flatter midsection.', '/images/before-after-result.png', true, 4)
ON CONFLICT DO NOTHING;
