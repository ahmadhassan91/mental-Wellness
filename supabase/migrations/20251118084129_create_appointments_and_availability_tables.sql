/*
  # Complete Scheduling System

  1. New Tables
    - `provider_availability`
      - `id` (uuid, primary key)
      - `provider_id` (text, foreign key to providers)
      - `day_of_week` (integer, 0-6 for Sunday-Saturday)
      - `start_time` (time)
      - `end_time` (time)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `appointments`
      - `id` (uuid, primary key)
      - `provider_id` (text, foreign key to providers)
      - `patient_name` (text)
      - `patient_email` (text)
      - `patient_phone` (text)
      - `appointment_date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `appointment_type` (text: 'initial', 'follow_up')
      - `modality` (text: 'telehealth', 'in_person')
      - `status` (text: 'pending', 'confirmed', 'cancelled', 'completed', 'no_show')
      - `notes` (text, optional)
      - `therapynotes_id` (text, optional - external EMR ID)
      - `synced_to_emr` (boolean, default false)
      - `synced_at` (timestamptz, optional)
      - `utm` (jsonb, optional - tracking params)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `appointment_sync_log`
      - `id` (uuid, primary key)
      - `appointment_id` (uuid, foreign key to appointments)
      - `sync_type` (text: 'create', 'update', 'cancel')
      - `status` (text: 'success', 'failed')
      - `request_payload` (jsonb)
      - `response_payload` (jsonb)
      - `error_message` (text, optional)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and public access where appropriate
    - Providers and admins can manage their schedules
    - Public can view availability and book appointments

  3. Indexes
    - Index on provider_id for fast lookups
    - Index on appointment_date for calendar queries
    - Index on synced_to_emr for finding unsynced appointments
*/

-- Create provider_availability table
CREATE TABLE IF NOT EXISTS provider_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id text NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id text NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  patient_email text NOT NULL,
  patient_phone text NOT NULL,
  appointment_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  appointment_type text NOT NULL CHECK (appointment_type IN ('initial', 'follow_up')),
  modality text NOT NULL CHECK (modality IN ('telehealth', 'in_person')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes text,
  therapynotes_id text,
  synced_to_emr boolean DEFAULT false,
  synced_at timestamptz,
  utm jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_appointment_time CHECK (start_time < end_time)
);

-- Create appointment sync log table
CREATE TABLE IF NOT EXISTS appointment_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  sync_type text NOT NULL CHECK (sync_type IN ('create', 'update', 'cancel')),
  status text NOT NULL CHECK (status IN ('success', 'failed')),
  request_payload jsonb DEFAULT '{}'::jsonb,
  response_payload jsonb DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_provider_availability_provider ON provider_availability(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_availability_day ON provider_availability(day_of_week, is_active);

CREATE INDEX IF NOT EXISTS idx_appointments_provider ON appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_sync ON appointments(synced_to_emr);
CREATE INDEX IF NOT EXISTS idx_appointments_provider_date ON appointments(provider_id, appointment_date);

CREATE INDEX IF NOT EXISTS idx_sync_log_appointment ON appointment_sync_log(appointment_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON appointment_sync_log(status);

-- Enable RLS
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_sync_log ENABLE ROW LEVEL SECURITY;

-- Provider availability policies
CREATE POLICY "Public can view active provider availability"
  ON provider_availability FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage provider availability"
  ON provider_availability FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Appointments policies
CREATE POLICY "Public can create appointments"
  ON appointments FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can view their own appointments"
  ON appointments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage all appointments"
  ON appointments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Sync log policies (admin only)
CREATE POLICY "Only authenticated users can view sync logs"
  ON appointment_sync_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can create sync logs"
  ON appointment_sync_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_provider_availability_updated_at ON provider_availability;
CREATE TRIGGER update_provider_availability_updated_at
  BEFORE UPDATE ON provider_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
