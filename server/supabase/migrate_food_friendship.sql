-- ============================================================
-- SQL Migration for Food Friendship Category
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/lasgvbjdsqzfbggehpjg/sql/new)
-- ============================================================

-- 1. Add the new category to the service_category enum
ALTER TYPE service_category ADD VALUE IF NOT EXISTS 'Food Friendship';

-- 2. Update the check constraint to support minimum price of ₹10 (or lower) for food
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_price_check;
ALTER TABLE services ADD CONSTRAINT services_price_check CHECK (price >= 10);
