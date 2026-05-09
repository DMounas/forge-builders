-- ==========================================
-- RJS HOMES - SUPABASE SETUP SCRIPT
-- ==========================================
-- Instructions: Copy this entire file and paste it into the "SQL Editor" in your Supabase dashboard, then click "Run".

-- 1. Create the homepage_projects table
CREATE TABLE IF NOT EXISTS homepage_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    units TEXT NOT NULL,
    price_range TEXT NOT NULL,
    status TEXT NOT NULL,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE homepage_projects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read homepage projects
CREATE POLICY "Anyone can view homepage projects" 
ON homepage_projects FOR SELECT 
USING (true);

-- Policy: Only admins can insert/update/delete homepage projects
CREATE POLICY "Admins can insert homepage projects" 
ON homepage_projects FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update homepage projects" 
ON homepage_projects FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete homepage projects" 
ON homepage_projects FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 2. Create the admin_users tracking table (optional, to manage who has admin access)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    added_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage admin_users" 
ON admin_users FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 3. Insert some default placeholder projects into the homepage_projects table so it's not empty
INSERT INTO homepage_projects (name, location, type, units, price_range, status, sort_order)
VALUES 
('Villa Areca', 'Jubilee Hills, Hyderabad', 'Villa', '24 Units', '₹85L - ₹1.2 Cr', 'ACTIVE', 1),
('Skyline Block A', 'Gachibowli, Hyderabad', 'Apartment', '120 Units', '₹45L - ₹75L', 'ACTIVE', 2),
('Duplex Row Ph.1', 'Kompally, Hyderabad', 'Duplex', '36 Units', '₹65L - ₹90L', 'ONGOING', 3),
('Green Meadows', 'Shamirpet, Hyderabad', 'Villa', '48 Units', '₹1.1 Cr - ₹1.8 Cr', 'NEW LAUNCH', 4),
('Commercial Hub', 'HITEC City, Hyderabad', 'Commercial', '18 Units', '₹1.5 Cr - ₹3 Cr', 'COMPLETED', 5)
ON CONFLICT DO NOTHING;
