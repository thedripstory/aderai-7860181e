-- Phase 1: Add missing triggers for user profile creation

-- Trigger to create user profile in public.users when auth.users record is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger to create notification preferences when public.users record is created
CREATE TRIGGER on_auth_user_created_notification_prefs
  AFTER INSERT ON public.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_notification_prefs();