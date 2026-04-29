-- Migration: Add comment likes, pinning, and moderation
-- Created at: 2026-04-29

-- 1. Create comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES public.content_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- 2. Add is_pinned column to content_comments
ALTER TABLE public.content_comments ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- 3. Function to handle comment like counts
CREATE OR REPLACE FUNCTION public.handle_comment_like() 
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.content_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.content_comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_comment_like
AFTER INSERT OR DELETE ON public.comment_likes
FOR EACH ROW EXECUTE FUNCTION public.handle_comment_like();

-- 4. Function to validate pinning logic
-- Rule: Max 3 pins per content, only top-level comments
CREATE OR REPLACE FUNCTION public.validate_comment_pin() 
RETURNS TRIGGER AS $$
DECLARE
    pin_count INTEGER;
BEGIN
    IF NEW.is_pinned = true THEN
        -- Check if it's a reply
        IF NEW.parent_id IS NOT NULL THEN
            RAISE EXCEPTION 'Replies cannot be pinned.';
        END IF;

        -- Check total pins for this content
        SELECT COUNT(*) INTO pin_count 
        FROM public.content_comments 
        WHERE content_id = NEW.content_id AND is_pinned = true AND id != NEW.id;

        IF pin_count >= 3 THEN
            RAISE EXCEPTION 'Maximum 3 pinned comments allowed per video.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_comment_pin_validate
BEFORE INSERT OR UPDATE OF is_pinned ON public.content_comments
FOR EACH ROW EXECUTE FUNCTION public.validate_comment_pin();

-- 5. Enable RLS for likes
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view comment likes" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like comments" ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike their own" ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);

-- 6. Moderation Policies for content_comments
-- Authors can update/delete their own
-- Video owners can delete any comment on their content
DROP POLICY IF EXISTS "Users can update their own comments" ON public.content_comments;
CREATE POLICY "Users can update their own comments" ON public.content_comments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.content_comments;
CREATE POLICY "Users or video owners can delete" ON public.content_comments
    FOR DELETE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.content 
            WHERE id = content_comments.content_id AND creator_id = auth.uid()
        )
    );
