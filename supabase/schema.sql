-- ================================================================
-- Nakshathra Property Management Platform — Supabase Schema
-- Run this in your Supabase SQL editor
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- 1. PROPERTIES
-- ----------------------------------------------------------------
CREATE TABLE properties (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  slug                  text UNIQUE NOT NULL,
  address               text,
  type                  text CHECK (type IN ('apartment','house_pg','mixed')) DEFAULT 'apartment',
  description           text,
  tagline               text,
  google_maps_url       text,
  google_maps_embed_url text,
  whatsapp_number       text,
  cover_image           text,
  photos                text[] DEFAULT '{}',
  amenities             text[] DEFAULT '{}',
  rules                 text[] DEFAULT '{}',
  is_published          boolean DEFAULT false,
  display_order         int DEFAULT 0,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- ----------------------------------------------------------------
-- 2. ROOMS
-- ----------------------------------------------------------------
CREATE TABLE rooms (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id       uuid REFERENCES properties(id) ON DELETE CASCADE,
  room_number       text,
  label             text,
  type              text CHECK (type IN ('pg_bed','pg_room','studio','1bhk','2bhk','3bhk')) DEFAULT 'pg_room',
  floor             int DEFAULT 0,
  capacity          int DEFAULT 1,
  current_occupants int DEFAULT 0,
  rent_amount       numeric(10,2),
  deposit_amount    numeric(10,2),
  amenities         text[] DEFAULT '{}',
  status            text CHECK (status IN ('vacant','occupied','notice_period','maintenance')) DEFAULT 'vacant',
  available_from    date,
  photos            text[] DEFAULT '{}',
  notes             text,
  display_order     int DEFAULT 0,
  is_visible        boolean DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- ----------------------------------------------------------------
-- 3. TENANTS
-- ----------------------------------------------------------------
CREATE TABLE tenants (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id            uuid REFERENCES rooms(id) ON DELETE SET NULL,
  name               text NOT NULL,
  phone              text,
  email              text,
  move_in_date       date,
  move_out_date      date,
  id_proof_type      text CHECK (id_proof_type IN ('aadhaar','passport','driving_license','voter_id','other')),
  id_proof_url       text,
  emergency_contact  text,
  notes              text,
  is_active          boolean DEFAULT true,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

-- ----------------------------------------------------------------
-- 4. LEADS (Enquiries)
-- ----------------------------------------------------------------
CREATE TABLE leads (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  phone             text NOT NULL,
  email             text,
  message           text,
  property_id       uuid REFERENCES properties(id) ON DELETE SET NULL,
  room_type         text,
  budget            numeric(10,2),
  source            text CHECK (source IN ('website','whatsapp','google','referral','other')) DEFAULT 'website',
  status            text CHECK (status IN ('new','contacted','converted','not_interested')) DEFAULT 'new',
  assigned_to       uuid,
  admin_notes       text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- ----------------------------------------------------------------
-- 5. ADMIN PROFILES
-- ----------------------------------------------------------------
CREATE TABLE admin_profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  phone       text,
  avatar_url  text,
  role        text DEFAULT 'admin',
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- ----------------------------------------------------------------
-- 6. TESTIMONIALS
-- ----------------------------------------------------------------
CREATE TABLE testimonials (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  tenant_name text NOT NULL,
  content     text NOT NULL,
  rating      int CHECK (rating BETWEEN 1 AND 5) DEFAULT 5,
  is_visible  boolean DEFAULT true,
  display_order int DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- ----------------------------------------------------------------
-- UPDATED_AT TRIGGER
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------

ALTER TABLE properties   ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants      ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads        ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is an active admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- PROPERTIES: public can read published, admins can do everything
CREATE POLICY "Public can view published properties" ON properties
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins full access to properties" ON properties
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ROOMS: public can read visible rooms in published properties
CREATE POLICY "Public can view visible rooms" ON rooms
  FOR SELECT USING (
    is_visible = true AND
    EXISTS (SELECT 1 FROM properties p WHERE p.id = rooms.property_id AND p.is_published = true)
  );

CREATE POLICY "Admins full access to rooms" ON rooms
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- TENANTS: admins only
CREATE POLICY "Admins full access to tenants" ON tenants
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- LEADS: public can insert, admins can read/update/delete
CREATE POLICY "Public can submit leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage leads" ON leads
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ADMIN PROFILES: admins can read all, manage their own or others (all equal)
CREATE POLICY "Admins can read all profiles" ON admin_profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage profiles" ON admin_profiles
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Own profile insert (for first-time setup)
CREATE POLICY "User can insert own profile" ON admin_profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- TESTIMONIALS: public can view visible ones, admins manage all
CREATE POLICY "Public can view visible testimonials" ON testimonials
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Admins full access to testimonials" ON testimonials
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ----------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------
CREATE INDEX idx_rooms_property_id ON rooms(property_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_tenants_room_id ON tenants(room_id);
CREATE INDEX idx_tenants_active ON tenants(is_active);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_testimonials_property_id ON testimonials(property_id);
