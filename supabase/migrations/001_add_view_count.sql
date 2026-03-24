-- Add view_count column to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;

-- Create RPC function for atomic increment
CREATE OR REPLACE FUNCTION increment_view_count(agent_slug text)
RETURNS void AS $$
BEGIN
  UPDATE agents SET view_count = COALESCE(view_count, 0) + 1 WHERE slug = agent_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
