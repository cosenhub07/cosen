-- ============================================================
-- Cosen Marketplace — Supabase PostgreSQL Schema
-- Run this entire file in your Supabase SQL Editor once.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- ENUM TYPES
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role        AS ENUM ('student', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE year_of_study    AS ENUM ('1st Year','2nd Year','3rd Year','4th Year','Postgraduate','');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE service_category AS ENUM ('Study Helper','Tech & Coding','Art & Design','Writing & CV','Research & Data','Other Talents');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE order_status     AS ENUM ('pending','inProgress','delivered','completed','disputed','cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                        VARCHAR(80)  NOT NULL,
  email                       VARCHAR(255) NOT NULL UNIQUE,
  password                    TEXT         NOT NULL,
  avatar_public_id            TEXT         NOT NULL DEFAULT '',
  avatar_url                  TEXT         NOT NULL DEFAULT '',
  department                  VARCHAR(100) NOT NULL DEFAULT '',
  year_of_study               TEXT         NOT NULL DEFAULT '',
  bio                         VARCHAR(500) NOT NULL DEFAULT '',
  skills                      TEXT[]       NOT NULL DEFAULT '{}',
  role                        user_role    NOT NULL DEFAULT 'student',
  rating                      NUMERIC(3,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count                INTEGER      NOT NULL DEFAULT 0,
  is_email_verified           BOOLEAN      NOT NULL DEFAULT FALSE,
  email_verification_token    TEXT,
  email_verification_expire   TIMESTAMPTZ,
  reset_password_token        TEXT,
  reset_password_expire       TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- SERVICES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(120) NOT NULL,
  description     TEXT         NOT NULL,
  category        service_category NOT NULL,
  price           INTEGER      NOT NULL CHECK (price >= 50),
  delivery_days   INTEGER      NOT NULL CHECK (delivery_days BETWEEN 1 AND 30),
  images          JSONB        NOT NULL DEFAULT '[]',   -- [{public_id, url}]
  tags            TEXT[]       NOT NULL DEFAULT '{}',
  rating          NUMERIC(3,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count    INTEGER      NOT NULL DEFAULT 0,
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  fts             TSVECTOR,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS services_fts_idx ON services USING GIN (fts);
CREATE INDEX IF NOT EXISTS services_seller_idx ON services (seller_id);

-- ─────────────────────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id              UUID         NOT NULL REFERENCES services(id),
  buyer_id                UUID         NOT NULL REFERENCES users(id),
  seller_id               UUID         NOT NULL REFERENCES users(id),
  price                   INTEGER      NOT NULL,
  platform_fee            INTEGER      NOT NULL,
  seller_earnings         INTEGER      NOT NULL,
  status                  order_status NOT NULL DEFAULT 'pending',
  razorpay_order_id       TEXT         NOT NULL DEFAULT '',
  razorpay_payment_id     TEXT         NOT NULL DEFAULT '',
  stripe_payment_intent_id TEXT        NOT NULL DEFAULT '',
  stripe_transfer_id      TEXT        NOT NULL DEFAULT '',
  requirements            TEXT         NOT NULL DEFAULT '',
  delivery_note           TEXT         NOT NULL DEFAULT '',
  dispute_reason          TEXT         NOT NULL DEFAULT '',
  is_reviewed             BOOLEAN      NOT NULL DEFAULT FALSE,
  delivered_at            TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_buyer_idx  ON orders (buyer_id);
CREATE INDEX IF NOT EXISTS orders_seller_idx ON orders (seller_id);

-- ─────────────────────────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID        NOT NULL UNIQUE REFERENCES orders(id),
  service_id  UUID        NOT NULL REFERENCES services(id),
  reviewer_id UUID        NOT NULL REFERENCES users(id),
  seller_id   UUID        NOT NULL REFERENCES users(id),
  rating      INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     VARCHAR(1000) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reviews_service_idx ON reviews (service_id);
CREATE INDEX IF NOT EXISTS reviews_seller_idx  ON reviews (seller_id);

-- ─────────────────────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sender_id  UUID        NOT NULL REFERENCES users(id),
  content    VARCHAR(2000) NOT NULL,
  read       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_order_idx ON messages (order_id);

-- ─────────────────────────────────────────────────────────────
-- TRIGGER: updated_at auto-update
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','services','orders','reviews','messages'] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I;
       CREATE TRIGGER set_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();', t, t
    );
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────
-- TRIGGER: maintain full-text search vector on services
-- Replaces the GENERATED ALWAYS AS approach (which requires IMMUTABLE fns)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_services_fts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts := to_tsvector(
    'english',
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS services_fts_update ON services;
CREATE TRIGGER services_fts_update
BEFORE INSERT OR UPDATE OF title, description, tags ON services
FOR EACH ROW EXECUTE FUNCTION trigger_services_fts();

-- ─────────────────────────────────────────────────────────────
-- TRIGGER: auto-recalculate ratings after a review is inserted
-- Replaces the Mongoose reviewSchema.post('save') hook
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_ratings_after_review()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_rating  NUMERIC(3,1);
  v_count       INTEGER;
BEGIN
  -- Update service rating
  SELECT ROUND(AVG(rating)::NUMERIC, 1), COUNT(*)
  INTO v_avg_rating, v_count
  FROM reviews
  WHERE service_id = NEW.service_id;

  UPDATE services
  SET rating = v_avg_rating, review_count = v_count
  WHERE id = NEW.service_id;

  -- Update seller (user) rating
  SELECT ROUND(AVG(rating)::NUMERIC, 1), COUNT(*)
  INTO v_avg_rating, v_count
  FROM reviews
  WHERE seller_id = NEW.seller_id;

  UPDATE users
  SET rating = v_avg_rating, review_count = v_count
  WHERE id = NEW.seller_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_review_insert ON reviews;
CREATE TRIGGER after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION update_ratings_after_review();
