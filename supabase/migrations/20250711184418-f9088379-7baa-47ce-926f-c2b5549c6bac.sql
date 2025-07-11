
-- Add new columns to the couriers table for comprehensive courier management
ALTER TABLE public.couriers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.couriers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.couriers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
ALTER TABLE public.couriers ADD COLUMN IF NOT EXISTS vehicle_type TEXT DEFAULT 'motorcycle' CHECK (vehicle_type IN ('motorcycle', 'car', 'van', 'bicycle'));
ALTER TABLE public.couriers ADD COLUMN IF NOT EXISTS assigned_zones TEXT[] DEFAULT '{}';
ALTER TABLE public.couriers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.couriers ADD COLUMN IF NOT EXISTS id_photo_url TEXT;
ALTER TABLE public.couriers ADD COLUMN IF NOT EXISTS license_photo_url TEXT;
ALTER TABLE public.couriers ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create storage bucket for courier documents and photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('courier-documents', 'courier-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for courier documents
CREATE POLICY "Allow authenticated users to upload courier documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'courier-documents' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Allow public access to courier documents" ON storage.objects
FOR SELECT USING (bucket_id = 'courier-documents');

CREATE POLICY "Allow authenticated users to update courier documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'courier-documents' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated users to delete courier documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'courier-documents' AND 
  auth.uid() IS NOT NULL
);

-- Add RLS policies for couriers table
ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins full access to couriers" ON public.couriers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

CREATE POLICY "Allow authenticated users to view couriers" ON public.couriers
FOR SELECT USING (auth.uid() IS NOT NULL);
