-- 1. Add `client` column to `credentials` table
ALTER TABLE public.credentials ADD COLUMN IF NOT EXISTS client TEXT;

-- 2. Create index on `client` for faster querying when sharing
CREATE INDEX IF NOT EXISTS idx_credentials_client ON public.credentials(client);
