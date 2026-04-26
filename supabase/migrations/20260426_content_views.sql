-- Migration: Add content views and analytics support
-- Created at: 2026-04-26

-- 1. Create content_views table
CREATE TABLE IF NOT EXISTS content_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Optional: Allow anonymous views if user_id is NULL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- For "One user views counts only once", we can use a unique constraint or handle it in logic.
    -- If we want to count unique users only:
    UNIQUE(content_id, user_id)
);

-- 2. Add views_count to content
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='content' AND column_name='views_count') THEN
        ALTER TABLE content ADD COLUMN views_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. Create Function to maintain views_count
CREATE OR REPLACE FUNCTION handle_content_view() 
RETURNS TRIGGER AS $$
BEGIN
    UPDATE content SET views_count = views_count + 1 WHERE id = NEW.content_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create Trigger
DROP TRIGGER IF EXISTS on_content_view ON content_views;
CREATE TRIGGER on_content_view
AFTER INSERT ON content_views
FOR EACH ROW EXECUTE FUNCTION handle_content_view();

-- 5. Enable RLS
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
CREATE POLICY "Anyone can view view counts" ON content_views
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can record views" ON content_views
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 7. Create follow_logs to track unfollows for analytics
CREATE TABLE IF NOT EXISTS follow_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT CHECK (event_type IN ('follow', 'unfollow')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to log follow events
CREATE OR REPLACE FUNCTION log_follow_event() 
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO follow_logs (following_id, follower_id, event_type)
        VALUES (NEW.following_id, NEW.follower_id, 'follow');
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO follow_logs (following_id, follower_id, event_type)
        VALUES (OLD.following_id, OLD.follower_id, 'unfollow');
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for follow logs
DROP TRIGGER IF EXISTS on_follow_event ON follows;
CREATE TRIGGER on_follow_event
AFTER INSERT OR DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION log_follow_event();

-- 8. Add created_at to follows if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='follows' AND column_name='created_at') THEN
        ALTER TABLE follows ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 9. Enable Realtime for content table (updated)
ALTER PUBLICATION supabase_realtime ADD TABLE content;
