-- Create saved_stylists table for clients to bookmark stylists
CREATE TABLE IF NOT EXISTS saved_stylists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stylist_id UUID NOT NULL REFERENCES stylist_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, stylist_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_stylists_client_id ON saved_stylists(client_id);
CREATE INDEX IF NOT EXISTS idx_saved_stylists_stylist_id ON saved_stylists(stylist_id);

-- Enable Row Level Security
ALTER TABLE saved_stylists ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own saved stylists
CREATE POLICY "Users can view own saved stylists"
  ON saved_stylists
  FOR SELECT
  USING (auth.uid() = client_id);

-- Policy: Users can insert their own saved stylists
CREATE POLICY "Users can save stylists"
  ON saved_stylists
  FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- Policy: Users can delete their own saved stylists
CREATE POLICY "Users can unsave stylists"
  ON saved_stylists
  FOR DELETE
  USING (auth.uid() = client_id);
