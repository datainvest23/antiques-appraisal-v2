-- Add token usage and cost tracking columns to deep_valuations
-- These are populated by the /api/valuation route after each deep valuation run

-- Sonar (Perplexity sonar-reasoning-pro) usage
ALTER TABLE deep_valuations ADD COLUMN IF NOT EXISTS sonar_input_tokens  INTEGER DEFAULT 0;
ALTER TABLE deep_valuations ADD COLUMN IF NOT EXISTS sonar_output_tokens INTEGER DEFAULT 0;
ALTER TABLE deep_valuations ADD COLUMN IF NOT EXISTS sonar_total_tokens  INTEGER DEFAULT 0;
ALTER TABLE deep_valuations ADD COLUMN IF NOT EXISTS sonar_cost_usd      NUMERIC(10, 6) DEFAULT 0;

-- Gemini Flash (google/gemini-2.5-flash) usage
ALTER TABLE deep_valuations ADD COLUMN IF NOT EXISTS gemini_input_tokens  INTEGER DEFAULT 0;
ALTER TABLE deep_valuations ADD COLUMN IF NOT EXISTS gemini_output_tokens INTEGER DEFAULT 0;
ALTER TABLE deep_valuations ADD COLUMN IF NOT EXISTS gemini_total_tokens  INTEGER DEFAULT 0;
ALTER TABLE deep_valuations ADD COLUMN IF NOT EXISTS gemini_cost_usd      NUMERIC(10, 6) DEFAULT 0;

-- Combined totals
ALTER TABLE deep_valuations ADD COLUMN IF NOT EXISTS total_tokens   INTEGER        DEFAULT 0;
ALTER TABLE deep_valuations ADD COLUMN IF NOT EXISTS total_cost_usd NUMERIC(10, 6) DEFAULT 0;

-- Useful index for cost reporting / analytics
CREATE INDEX IF NOT EXISTS idx_deep_valuations_total_cost ON deep_valuations(total_cost_usd);

COMMENT ON COLUMN deep_valuations.sonar_input_tokens  IS 'Input tokens consumed by Perplexity sonar-reasoning-pro';
COMMENT ON COLUMN deep_valuations.sonar_output_tokens IS 'Output tokens produced by Perplexity sonar-reasoning-pro';
COMMENT ON COLUMN deep_valuations.sonar_total_tokens  IS 'Total tokens (in+out) for Sonar step';
COMMENT ON COLUMN deep_valuations.sonar_cost_usd      IS 'Estimated USD cost for the Sonar step (pricing: $5/M in, $25/M out)';
COMMENT ON COLUMN deep_valuations.gemini_input_tokens  IS 'Input tokens consumed by google/gemini-2.5-flash';
COMMENT ON COLUMN deep_valuations.gemini_output_tokens IS 'Output tokens produced by google/gemini-2.5-flash';
COMMENT ON COLUMN deep_valuations.gemini_total_tokens  IS 'Total tokens (in+out) for Gemini step';
COMMENT ON COLUMN deep_valuations.gemini_cost_usd      IS 'Estimated USD cost for the Gemini step (pricing: $0.075/M in, $0.30/M out)';
COMMENT ON COLUMN deep_valuations.total_tokens         IS 'Combined token count across both models';
COMMENT ON COLUMN deep_valuations.total_cost_usd       IS 'Combined estimated USD cost for the full deep valuation pipeline';
