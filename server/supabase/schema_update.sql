-- Upgrading users table for Google Auth and Multi-step Onboarding

ALTER TABLE users
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS id_card_image_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS instagram_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS facebook_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS youtube_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS x_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS platform_agreement_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_onboarding_complete BOOLEAN DEFAULT FALSE;

-- Add cover image support for service cards
ALTER TABLE services
ADD COLUMN IF NOT EXISTS cover_image_url TEXT DEFAULT '';
