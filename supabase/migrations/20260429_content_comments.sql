-- Migration: Add content comments system
-- Created at: 2026-04-29

-- 1. Create content_comments table
CREATE TABLE IF NOT EXISTS public.content_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.content_comments(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ensure content table has comments_count
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='content' AND column_name='comments_count') THEN
        ALTER TABLE public.content ADD COLUMN comments_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. Create Function to maintain comments_count and replies_count
CREATE OR REPLACE FUNCTION public.handle_comment_counters() 
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Update content comments_count
        UPDATE public.content SET comments_count = comments_count + 1 WHERE id = NEW.content_id;
        
        -- Update parent replies_count if it's a reply
        IF NEW.parent_id IS NOT NULL THEN
            UPDATE public.content_comments SET replies_count = replies_count + 1 WHERE id = NEW.parent_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        -- Update content comments_count
        UPDATE public.content SET comments_count = comments_count - 1 WHERE id = OLD.content_id;
        
        -- Update parent replies_count if it's a reply
        IF OLD.parent_id IS NOT NULL THEN
            UPDATE public.content_comments SET replies_count = replies_count - 1 WHERE id = OLD.parent_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Create Trigger
DROP TRIGGER IF EXISTS on_comment_change ON public.content_comments;
CREATE TRIGGER on_comment_change
AFTER INSERT OR DELETE ON public.content_comments
FOR EACH ROW EXECUTE FUNCTION public.handle_comment_counters();

-- 5. Enable RLS
ALTER TABLE public.content_comments ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "Anyone can view comments" ON public.content_comments;
CREATE POLICY "Anyone can view comments" ON public.content_comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can comment" ON public.content_comments;
CREATE POLICY "Authenticated users can comment" ON public.content_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.content_comments;
CREATE POLICY "Users can update their own comments" ON public.content_comments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.content_comments;
CREATE POLICY "Users can delete their own comments" ON public.content_comments
    FOR DELETE USING (auth.uid() = user_id);

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_content_id ON public.content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.content_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.content_comments(created_at DESC);
