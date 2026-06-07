-- Fix profile creation: ensure trigger is attached to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_notif_prefs ON auth.users;
CREATE TRIGGER on_auth_user_created_notif_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_notification_prefs();

-- Grant required privileges so RLS-allowed inserts actually work
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;

-- Remove the conflicting/no-op INSERT-deny policy that adds noise
DROP POLICY IF EXISTS users_no_direct_insert ON public.users;