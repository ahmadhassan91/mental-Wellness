/*
  # Create Therapy Practice Database Schema

  1. New Tables
    - `providers`
      - `id` (text, primary key) - Unique provider identifier
      - `name` (text) - Provider full name
      - `photo_url` (text, nullable) - URL to provider photo
      - `specialties` (text array) - List of specialties (e.g., "Anxiety", "CBT", "PTSD")
      - `modalities` (text array) - Service delivery methods ("telehealth", "in_person")
      - `portal_link` (text) - TherapyNotes TherapyPortal URL for this provider
      - `accepting_new` (boolean, default true) - Whether accepting new patients
      - `show` (boolean, default true) - Whether to display in directory
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `booking_events`
      - `id` (text, primary key) - Unique event identifier
      - `provider_id` (text, foreign key) - Reference to provider
      - `event_type` (text) - Type of event: "click" or "landed_portal"
      - `utm` (jsonb, nullable) - UTM tracking parameters (non-PHI)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on both tables
    - Public read access to providers table (no auth required for browsing)
    - No public write access to providers (admin only via API)
    - No public access to booking_events (admin only via API with basic auth)

  3. Indexes
    - Index on booking_events.provider_id for fast joins
    - Index on booking_events.event_type for analytics filtering
    - Index on booking_events.created_at for time-based queries

  4. Important Notes
    - No PHI (personally identifiable health information) is stored
    - booking_events only tracks anonymous click analytics
    - All writes happen through API routes with proper validation
    - TherapyPortal links are placeholders and must be updated with real URLs
*/

CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  photo_url TEXT,
  specialties TEXT[] DEFAULT '{}',
  modalities TEXT[] DEFAULT '{}',
  portal_link TEXT NOT NULL,
  accepting_new BOOLEAN DEFAULT true,
  show BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS booking_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  utm JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_events_provider_id ON booking_events(provider_id);
CREATE INDEX IF NOT EXISTS idx_booking_events_event_type ON booking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_booking_events_created_at ON booking_events(created_at);

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access to visible providers" ON providers;
CREATE POLICY "Public read access to visible providers"
  ON providers FOR SELECT
  USING (show = true);

DROP POLICY IF EXISTS "No public access to booking events" ON booking_events;
CREATE POLICY "No public access to booking events"
  ON booking_events FOR ALL
  USING (false);
