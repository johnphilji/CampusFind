-- ==============================================================================
-- CampusFind — Migration 001: Data Retention Support
-- Safe to run multiple times (uses IF NOT EXISTS / DO blocks throughout)
-- ==============================================================================
-- Apply against your RDS instance:
--   psql "$DATABASE_URL" -f server/src/db/migration_001_retention.sql
-- ==============================================================================

-- Add returned_at to claims:
--   Records the exact moment an admin confirms item handover.
--   The 7-day deletion countdown (Rule A) starts from this timestamp.
ALTER TABLE claims ADD COLUMN IF NOT EXISTS returned_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_claims_returned_at
  ON claims(returned_at)
  WHERE returned_at IS NOT NULL;

-- Verify
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'claims' AND column_name = 'returned_at'
  ) THEN
    RAISE NOTICE 'Migration 001 applied successfully: claims.returned_at column exists.';
  ELSE
    RAISE EXCEPTION 'Migration 001 FAILED: claims.returned_at column was not created.';
  END IF;
END $$;
