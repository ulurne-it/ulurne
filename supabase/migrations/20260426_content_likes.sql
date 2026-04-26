-- Migration: Add content likes system
-- Created at: 2026-04-26

-- 1. Create content_likes table
CREATE TABLE IF NOT EXISTS content_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_id, user_id)
);

-- 2. Ensure content table has likes_count
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='content' AND column_name='likes_count') THEN
        ALTER TABLE content ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. Create Function to maintain likes_count
CREATE OR REPLACE FUNCTION handle_content_like() 
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE content SET likes_count = likes_count + 1 WHERE id = NEW.content_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE content SET likes_count = likes_count - 1 WHERE id = OLD.content_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Create Trigger
DROP TRIGGER IF EXISTS on_content_like ON content_likes;
CREATE TRIGGER on_content_like
AFTER INSERT OR DELETE ON content_likes
FOR EACH ROW EXECUTE FUNCTION handle_content_like();

-- 5. Enable RLS
ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "Anyone can view likes" ON content_likes;
CREATE POLICY "Anyone can view likes" ON content_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can like" ON content_likes;
CREATE POLICY "Authenticated users can like" ON content_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike their own" ON content_likes;
CREATE POLICY "Users can unlike their own" ON content_likes
    FOR DELETE USING (auth.uid() = user_id);
