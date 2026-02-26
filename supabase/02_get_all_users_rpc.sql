-- Script para ver perfiles ignorando el RLS si es admin
CREATE OR REPLACE FUNCTION public.get_all_profiles()
RETURNS SETOF public.profiles AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN QUERY SELECT * FROM public.profiles ORDER BY email ASC;
  ELSE
    RAISE EXCEPTION 'Not authorized to view all profiles';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
