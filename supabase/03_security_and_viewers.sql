-- 1. Add `updated_at` column to `credentials`
ALTER TABLE public.credentials ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 2. Trigger for auto-updating `updated_at`
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_credentials_modtime ON public.credentials;
CREATE TRIGGER update_credentials_modtime
    BEFORE UPDATE ON public.credentials
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_modified_column();

-- 3. Trigger for Viewer Password Limit (100)
CREATE OR REPLACE FUNCTION public.enforce_viewer_credential_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    credential_count INT;
BEGIN
    -- Get the role of the user inserting the credential
    SELECT role INTO user_role FROM public.profiles WHERE id = NEW.owner_id;
    
    -- If they are a viewer, check their count
    IF user_role = 'viewer' THEN
        SELECT COUNT(*) INTO credential_count FROM public.credentials WHERE owner_id = NEW.owner_id;
        
        IF credential_count >= 100 THEN
            RAISE EXCEPTION 'Has alcanzado el límite máximo de 100 contraseñas para tu cuenta.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS enforce_viewer_limit ON public.credentials;
CREATE TRIGGER enforce_viewer_limit
    BEFORE INSERT ON public.credentials
    FOR EACH ROW
    EXECUTE PROCEDURE public.enforce_viewer_credential_limit();

-- 4. Update RLS Policies for Viewers to allow inserting/updating/deleting their OWN credentials
-- Drop any conflicting policies if they exist (though 'Admins have full access...' stays)
DROP POLICY IF EXISTS "Viewers can manage their own credentials" ON public.credentials;
CREATE POLICY "Viewers can manage their own credentials" ON public.credentials
    FOR ALL
    USING (
        auth.uid() = owner_id
        OR
        EXISTS (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
    );
    
-- Note: "Viewers can read shared credentials" policy remains unchanged so they can still see shared ones.
