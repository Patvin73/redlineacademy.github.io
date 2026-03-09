-- ============================================================
-- REDLINE ACADEMY — MARKETER / STAFF SUPABASE SCHEMA
-- Run this in Supabase SQL Editor (after SUPABASE_LMS_SETUP.sql)
-- ============================================================

-- ── 1. EXTEND profiles table: add marketer_id ──
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS marketer_id TEXT UNIQUE;

-- ── 2. ADD role values (ensure 'marketer' and 'staff' are accepted) ──
-- If you have a CHECK constraint on role, alter it:
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
-- ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
--   CHECK (role IN ('student','admin','trainer','marketer','staff'));


-- ============================================================
-- TABLE: marketer_schools
-- Sekolah SMK yang difasilitasi oleh marketer
-- ============================================================
CREATE TABLE IF NOT EXISTS marketer_schools (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  city          TEXT NOT NULL,
  contact_name  TEXT,
  phone         TEXT,
  notes         TEXT,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','inactive')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_marketer_schools_updated ON marketer_schools;
CREATE TRIGGER trg_marketer_schools_updated
  BEFORE UPDATE ON marketer_schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketer_schools_marketer
  ON marketer_schools (marketer_id);


-- ============================================================
-- TABLE: marketer_claims
-- Klaim komisi presentasi + pendaftaran siswa
-- ============================================================
CREATE TABLE IF NOT EXISTS marketer_claims (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketer_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school_id          UUID NOT NULL REFERENCES marketer_schools(id) ON DELETE RESTRICT,
  ref_id             TEXT UNIQUE,                  -- e.g. RA-COM-XXXXX
  presentation_date  DATE NOT NULL,
  students_present   INTEGER NOT NULL DEFAULT 0,
  students_enrolled  INTEGER NOT NULL DEFAULT 0,
  program_fee        NUMERIC(14,2) NOT NULL DEFAULT 0,
  access_fee         NUMERIC(14,2) NOT NULL DEFAULT 0,
  enrollment_comm    NUMERIC(14,2) NOT NULL DEFAULT 0,
  bonus              NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_commission   NUMERIC(14,2) GENERATED ALWAYS AS
                       (access_fee + enrollment_comm + bonus) STORED,
  notes              TEXT,
  status             TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','verified','paid','rejected')),
  verified_by        UUID REFERENCES profiles(id),
  verified_at        TIMESTAMPTZ,
  paid_at            TIMESTAMPTZ,
  admin_notes        TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_marketer_claims_updated ON marketer_claims;
CREATE TRIGGER trg_marketer_claims_updated
  BEFORE UPDATE ON marketer_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketer_claims_marketer
  ON marketer_claims (marketer_id);
CREATE INDEX IF NOT EXISTS idx_marketer_claims_status
  ON marketer_claims (status);
CREATE INDEX IF NOT EXISTS idx_marketer_claims_school
  ON marketer_claims (school_id);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE marketer_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketer_claims  ENABLE ROW LEVEL SECURITY;

-- ── marketer_schools policies ──

-- Marketer & Staff can view only their own schools
CREATE POLICY "marketer_schools_select_own"
  ON marketer_schools FOR SELECT
  USING (
    marketer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin')
    )
  );

-- Marketer & Staff can insert their own schools
CREATE POLICY "marketer_schools_insert_own"
  ON marketer_schools FOR INSERT
  WITH CHECK (
    marketer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('marketer','staff')
    )
  );

-- Marketer & Staff can update their own schools
CREATE POLICY "marketer_schools_update_own"
  ON marketer_schools FOR UPDATE
  USING (
    marketer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('marketer','staff')
    )
  );

-- Admin can update any school
CREATE POLICY "marketer_schools_update_admin"
  ON marketer_schools FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ── marketer_claims policies ──

-- Marketer/Staff can view only their own claims
CREATE POLICY "marketer_claims_select_own"
  ON marketer_claims FOR SELECT
  USING (
    marketer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin')
    )
  );

-- Marketer/Staff can insert their own claims (pending only)
CREATE POLICY "marketer_claims_insert_own"
  ON marketer_claims FOR INSERT
  WITH CHECK (
    marketer_id = auth.uid()
    AND status = 'pending'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('marketer','staff')
    )
  );

-- Only admin can update claim status (verify/pay/reject)
CREATE POLICY "marketer_claims_update_admin"
  ON marketer_claims FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ============================================================
-- ADMIN VIEW: all marketer claims with profile info
-- ============================================================
CREATE OR REPLACE VIEW admin_marketer_claims AS
  SELECT
    mc.*,
    p.full_name     AS marketer_name,
    p.email         AS marketer_email,
    p.marketer_id   AS marketer_code,
    ms.name         AS school_name,
    ms.city         AS school_city,
    ms.contact_name AS school_contact
  FROM marketer_claims mc
  JOIN profiles       p  ON mc.marketer_id = p.id
  JOIN marketer_schools ms ON mc.school_id  = ms.id;

-- Only admin can query this view
-- (RLS on base tables handles row-level filtering)


-- ============================================================
-- SAMPLE MARKETER PROFILE (untuk testing)
-- Ganti UUID sesuai user yang dibuat via Supabase Auth
-- ============================================================
-- INSERT INTO profiles (id, full_name, role, email, marketer_id)
-- VALUES (
--   'YOUR-USER-UUID-HERE',
--   'Nama Marketer',
--   'marketer',
--   'marketer@example.com',
--   'MKT-001'
-- );
