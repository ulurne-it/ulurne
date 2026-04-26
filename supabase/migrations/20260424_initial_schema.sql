-- Master Academy Schema Migration (Current State)
-- Created: 2026-04-24

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    bio TEXT,
    occupation TEXT,
    location TEXT,
    website TEXT,
    interests TEXT[],
    social_links JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Series Table
CREATE TABLE IF NOT EXISTS public.series (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    cover_url TEXT,
    is_standalone BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Table
CREATE TABLE IF NOT EXISTS public.content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    series_id UUID REFERENCES public.series(id) ON DELETE SET NULL,
    type TEXT, -- Note: User defined as 'USER-DEFINED', usually 'video_short', 'video_long', 'image_gallery'
    title TEXT,
    description TEXT,
    thumbnail_url TEXT,
    media_url TEXT,
    duration_seconds INTEGER,
    metadata JSONB,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Gallery Table (Replaces content_images)
CREATE TABLE IF NOT EXISTS public.content_gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows Table
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- Legacy Videos Table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    view_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    two_factor_enabled BOOLEAN DEFAULT false,
    is_private BOOLEAN DEFAULT false,
    show_active_status BOOLEAN DEFAULT true,
    notification_push BOOLEAN DEFAULT true,
    notification_email BOOLEAN DEFAULT true,
    notification_sms BOOLEAN DEFAULT false,
    billing_plan TEXT,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trending Profiles (View or Table)
CREATE TABLE IF NOT EXISTS public.trending_profiles (
    id UUID PRIMARY KEY,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    occupation TEXT,
    follower_count BIGINT DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Content is viewable by everyone" ON public.content FOR SELECT USING (true);
CREATE POLICY "Public Gallery is viewable by everyone" ON public.content_gallery FOR SELECT USING (true);
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

-- STORAGE CONFIGURATION
-- Note: These run on the 'storage' schema

-- 1. Create the 'academy-media' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('academy-media', 'academy-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for 'academy-media'
-- Allow public access to read media
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'academy-media');

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'academy-media' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own media
CREATE POLICY "Owner Delete" ON storage.objects FOR DELETE USING (
    bucket_id = 'academy-media' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
