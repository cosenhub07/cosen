-- ============================================================
-- SQL Migration for Cosen Admin Control Panel
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Check if the enum type already exists, create only if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'id_card_status_type') THEN
    CREATE TYPE id_card_status_type AS ENUM ('unsubmitted', 'pending', 'approved', 'rejected');
  END IF;
END $$;

-- 2. Add the id_card_status column (text fallback if enum fails)
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS id_card_status TEXT DEFAULT 'unsubmitted',
  ADD COLUMN IF NOT EXISTS id_card_rejection_reason TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE NOT NULL;

-- 3. Protect existing verified users — auto-approve already-onboarded students
UPDATE users 
SET id_card_status = 'approved' 
WHERE is_onboarding_complete = TRUE 
  AND (id_card_status IS NULL OR id_card_status = 'unsubmitted');

-- 4. Anyone not onboarded → 'unsubmitted'
UPDATE users 
SET id_card_status = 'unsubmitted' 
WHERE is_onboarding_complete = FALSE 
  AND id_card_status IS NULL;

-- 5. Add dispute resolution fields to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS dispute_resolved_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS dispute_verdict TEXT DEFAULT NULL;

-- 6. Add a check constraint so only known statuses are accepted
-- (Skip if exists, wrapped in a safe DO block)
DO $$ BEGIN
  ALTER TABLE users 
    ADD CONSTRAINT chk_id_card_status 
    CHECK (id_card_status IN ('unsubmitted', 'pending', 'approved', 'rejected'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 7. Index for fast admin queries
CREATE INDEX IF NOT EXISTS idx_users_id_card_status ON users(id_card_status);
CREATE INDEX IF NOT EXISTS idx_users_is_suspended ON users(is_suspended);
CREATE INDEX IF NOT EXISTS idx_orders_dispute_verdict ON orders(dispute_verdict);
