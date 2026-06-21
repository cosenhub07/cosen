-- =====================================================
-- COSEN: Timetable Detector Feature — DB Migration
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. timetable_slots — Stores all time slot entries
CREATE TABLE IF NOT EXISTS timetable_slots (
  id            BIGSERIAL PRIMARY KEY,
  program       TEXT,
  year          TEXT,
  class_code    TEXT,
  section       TEXT,
  day           TEXT NOT NULL,        -- 'MON','TUE','WED','THU','FRI','SAT'
  start_time    TEXT NOT NULL,        -- '08:00'
  end_time      TEXT NOT NULL,        -- '08:55'
  subject       TEXT,
  session_type  TEXT,                 -- 'Lecture','Tutorial','Lab'
  room          TEXT NOT NULL,        -- 'H801', 'BX104'
  building      TEXT,                 -- 'H', 'BX' (auto-extracted)
  teacher       TEXT,
  semester_label TEXT,
  uploaded_at   TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_timetable_slots_building ON timetable_slots (building);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_room ON timetable_slots (room);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_day ON timetable_slots (day);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_building_day ON timetable_slots (building, day);

-- 2. timetable_meta — Tracks upload history
CREATE TABLE IF NOT EXISTS timetable_meta (
  id              BIGSERIAL PRIMARY KEY,
  semester_label  TEXT NOT NULL,
  uploaded_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at     TIMESTAMPTZ DEFAULT now(),
  is_active       BOOLEAN DEFAULT true,
  row_count       INTEGER
);

-- =====================================================
-- RLS: Disable for admin-only server-side access
-- (Your server uses the service role key, so RLS is
--  not needed, but if you want extra safety:)
-- =====================================================
ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_meta ENABLE ROW LEVEL SECURITY;

-- Allow public SELECT (your API layer handles auth)
CREATE POLICY "Public read timetable_slots" ON timetable_slots
  FOR SELECT USING (true);

CREATE POLICY "Public read timetable_meta" ON timetable_meta
  FOR SELECT USING (true);
