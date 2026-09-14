-- Contact Settings table
CREATE TABLE IF NOT EXISTS contact_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  whatsapp_phone TEXT NOT NULL,
  whatsapp_message TEXT NOT NULL,
  instagram_url TEXT NOT NULL,
  address TEXT NOT NULL,
  working_hours TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;

-- Only admin can manage contact settings
CREATE POLICY "Admin can manage contact settings" ON contact_settings FOR ALL USING (true);
CREATE POLICY "Public can view contact settings" ON contact_settings FOR SELECT USING (true);

-- Insert default contact settings
INSERT INTO contact_settings (phone, whatsapp_phone, whatsapp_message, instagram_url, address, working_hours)
VALUES (
  '0932501411',
  '84932501411',
  'Xin chào, tôi muốn tư vấn về...',
  'https://www.instagram.com/hieuthien.1802/',
  '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
  '09:00 — 19:00 (Thứ 2 - Chủ Nhật)'
)
ON CONFLICT DO NOTHING;
