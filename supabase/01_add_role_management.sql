-- SQL script to add role management function
CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_id uuid, new_role text)
RETURNS void AS $$
BEGIN
  -- Check if the user executing this function is an admin
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    -- Update the target user's role
    UPDATE public.profiles 
    SET role = new_role 
    WHERE id = target_id;
  ELSE
    RAISE EXCEPTION 'Not authorized to change roles';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
