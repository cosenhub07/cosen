-- ============================================================
-- SQL Migration for Playground Category & Dual-Payment System
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add the 'Playground' category to the service_category enum
ALTER TYPE service_category ADD VALUE IF NOT EXISTS 'Playground';

-- 2. Add custom columns to the orders table for double-sided payments and voting results
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_result VARCHAR(10) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_result VARCHAR(10) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES users(id) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS winner_earnings INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_razorpay_order_id TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_razorpay_payment_id TEXT DEFAULT '';
