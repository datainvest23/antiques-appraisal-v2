-- Create deep_valuations table for storing AI-generated professional valuation reports
-- Note: Foreign key to valuations is optional (added later if that table exists)
CREATE TABLE IF NOT EXISTS deep_valuations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    valuation_id TEXT NOT NULL,          -- references the valuation by its ID (text, no FK constraint)
    user_id UUID,                        -- Supabase auth user ID
    report_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(valuation_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_deep_valuations_user_id ON deep_valuations(user_id);
CREATE INDEX IF NOT EXISTS idx_deep_valuations_valuation_id ON deep_valuations(valuation_id);

-- Row Level Security
ALTER TABLE deep_valuations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own deep valuations
CREATE POLICY "Users can view their own deep valuations"
    ON deep_valuations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deep valuations"
    ON deep_valuations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deep valuations"
    ON deep_valuations FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow service role full access (used by API routes)
CREATE POLICY "Service role full access"
    ON deep_valuations FOR ALL
    USING (auth.role() = 'service_role');

-- Trigger to update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_deep_valuations_updated_at
    BEFORE UPDATE ON deep_valuations
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
