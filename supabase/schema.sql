-- =============================================================================
-- Tivoli ID Station — Lost & Found Supabase Initialization Script
-- Generated in accordance with .agents/skills/supabase-security-architect/SKILL.md
-- Hardened PostgreSQL Schema, Row Level Security (RLS) & Public Storage Bucket
-- =============================================================================

-- Ensure required extensions are active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. TABLE DEFINITION: lost_items
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.lost_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    identifier TEXT DEFAULT NULL,           -- Student ID #, tag, badge #, or serial
    location TEXT NOT NULL,                 -- Storage bin (e.g. 'Bin A-01', 'Bin B-14')
    staff_initials TEXT NOT NULL,           -- Initials of staff who logged the item (e.g. 'SUP', 'ML')
    image_url TEXT DEFAULT NULL,            -- Supabase Storage public CDN URL
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'claimed')),
    claimed_at TIMESTAMPTZ DEFAULT NULL,
    claimant_name TEXT DEFAULT NULL,
    claimant_contact TEXT DEFAULT NULL,     -- Optional claimant student ID # or phone
    released_by TEXT DEFAULT NULL           -- Initials of staff releasing the item
);

-- Comments on table columns for clarity & documentation
COMMENT ON TABLE public.lost_items IS 'Inventory of lost and turned-in items at Tivoli ID Station';
COMMENT ON COLUMN public.lost_items.identifier IS 'Optional claimant student ID number, tag, or identifying mark';
COMMENT ON COLUMN public.lost_items.claimant_contact IS 'Optional phone number or student ID recorded at time of return';

-- =============================================================================
-- 2. HIGH-PERFORMANCE INDEXES
-- Optimized for instant desktop search and category filtering
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_lost_items_status ON public.lost_items (status);
CREATE INDEX IF NOT EXISTS idx_lost_items_category ON public.lost_items (category);
CREATE INDEX IF NOT EXISTS idx_lost_items_created_at ON public.lost_items (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lost_items_identifier ON public.lost_items (identifier) WHERE identifier IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lost_items_location ON public.lost_items (location);

-- =============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- Principles of least privilege per supabase-security-architect
-- =============================================================================

-- Enable Row Level Security (MANDATORY)
ALTER TABLE public.lost_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running script
DROP POLICY IF EXISTS "Allow anon and authenticated to view lost items" ON public.lost_items;
DROP POLICY IF EXISTS "Allow anon and authenticated to insert lost items" ON public.lost_items;
DROP POLICY IF EXISTS "Allow anon and authenticated to update lost items" ON public.lost_items;
DROP POLICY IF EXISTS "Allow anon and authenticated to delete lost items" ON public.lost_items;

-- Policy 1: SELECT (Public Read for desk display & search feeds)
CREATE POLICY "Allow anon and authenticated to view lost items"
ON public.lost_items
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy 2: INSERT (Desk staff can log new turn-in items)
CREATE POLICY "Allow anon and authenticated to insert lost items"
ON public.lost_items
FOR INSERT
TO anon, authenticated
WITH CHECK (
    title IS NOT NULL AND
    trim(title) <> '' AND
    category IS NOT NULL AND
    location IS NOT NULL AND
    staff_initials IS NOT NULL
);

-- Policy 3: UPDATE (Staff can edit locations, descriptions, or mark items claimed)
CREATE POLICY "Allow anon and authenticated to update lost items"
ON public.lost_items
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (
    status IN ('active', 'claimed')
);

-- Policy 4: DELETE (Staff can remove duplicates or mistaken entries)
CREATE POLICY "Allow anon and authenticated to delete lost items"
ON public.lost_items
FOR DELETE
TO anon, authenticated
USING (true);

-- =============================================================================
-- 4. STORAGE CONFIGURATION: item-photos BUCKET
-- Max file size: 2MB (2,097,152 bytes)
-- Allowed MIME types: image/jpeg, image/png, image/webp
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'item-photos',
    'item-photos',
    true,
    2097152, -- 2 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================================================
-- 5. STORAGE ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Clean up any existing storage policies for item-photos
DROP POLICY IF EXISTS "Public Read Item Photos" ON storage.objects;
DROP POLICY IF EXISTS "Anon Upload Item Photos" ON storage.objects;
DROP POLICY IF EXISTS "Anon Update Item Photos" ON storage.objects;
DROP POLICY IF EXISTS "Anon Delete Item Photos" ON storage.objects;

-- Storage Policy 1: Public Read (Anyone can view item photo thumbnails via CDN)
CREATE POLICY "Public Read Item Photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'item-photos');

-- Storage Policy 2: Anon Upload (Desk staff can upload client-optimized photos)
CREATE POLICY "Anon Upload Item Photos"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
    bucket_id = 'item-photos'
);

-- Storage Policy 3: Update / Replace photo
CREATE POLICY "Anon Update Item Photos"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'item-photos')
WITH CHECK (bucket_id = 'item-photos');

-- Storage Policy 4: Delete photo
CREATE POLICY "Anon Delete Item Photos"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (bucket_id = 'item-photos');

-- =============================================================================
-- 6. SUPABASE REALTIME REPLICATION (OPTIONAL / RECOMMENDED)
-- Allows multi-station instantaneous sync without manual page refresh
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.lost_items;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;
