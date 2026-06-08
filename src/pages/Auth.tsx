import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SignInCard } from "@/components/ui/sign-in-card";
import { ErrorLogger } from "@/lib/errorLogger";
import { sanitizeEmail, sanitizeString, validatePassword } from "@/lib/inputSanitization";
import { identifyUser, trackEvent, setGroup } from '@/lib/analytics';
import { trackMetaEvent } from '@/lib/metaPixel';
import { useCurrency, getCurrencySync } from '@/hooks/useCurrency';

interface AuthProps {
  onComplete?: (user: any) => void;
  initialView?: "signup" | "signin";
}

export default function Auth({ onComplete, initialView = "signup" }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(initialView === "signup");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const detectedCurrency = useCurrency();

  const handleAuth = async (email: string, password: string, firstName?: string, brandName?: string) => {
    setLoading(true);

    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeEmail(email);
      const sanitizedFirstName = firstName ? sanitizeString(firstName) : '';
      const sanitizedBrandName = brandName ? sanitizeString(brandName) : '';
      
      // Validate email format
      if (!sanitizedEmail) {
        throw new Error('Please enter a valid email address');
      }
      
      // Validate password
      if (isSignUp) {
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
          throw new Error(passwordValidation.error);
        }
      }

      if (isSignUp) {
        // Sign up
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              first_name: sanitizedFirstName || '',
              account_name: sanitizedBrandName || sanitizedEmail.split('@')[0],
            },
          },
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          // Profile and notification preferences are created automatically by
          // the on_auth_user_created triggers on auth.users. We deliberately do
          // NOT try to read/insert them from the client here: until the user
          // confirms their email, there is no authenticated session, so RLS
          // would block those calls and surface a misleading "Profile Creation
          // Error" even though the signup itself succeeded.

          // Send welcome email (idempotent: trigger-app-email flips a flag)
          try {
            await supabase.functions.invoke('trigger-app-email', {
              body: { type: 'welcome', userId: authData.user.id },
            });
          } catch (emailError) {
            await ErrorLogger.logError(emailError as Error, {
              context: 'Error sending welcome email',
              userId: authData.user.id,
            });
          }



          toast({
            title: "Account created!",
            description: "Redirecting to payment...",
          });

          // Track signup with PostHog
          identifyUser(authData.user.id, {
            email: sanitizedEmail,
            firstName: sanitizedFirstName,
            accountName: sanitizedBrandName || sanitizedEmail.split('@')[0],
            createdAt: new Date().toISOString(),
            subscriptionStatus: 'pending',
          });

          // Group by account for B2B analytics
          if (sanitizedBrandName) {
            setGroup('company', sanitizedBrandName, {
              name: sanitizedBrandName,
              createdAt: new Date().toISOString(),
            });
          }

          trackEvent('User Signed Up', {
            method: 'email',
            accountName: sanitizedBrandName,
          });

          trackMetaEvent('Lead');

          trackMetaEvent('CompleteRegistration', { content_name: 'Aderai Signup' });

          // Create Stripe checkout session and redirect
          try {
            const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
              'stripe-create-checkout',
              {
                body: { origin: window.location.origin, currency: detectedCurrency || getCurrencySync() },
              }
            );

            if (checkoutError) throw checkoutError;

            if (checkoutData?.url) {
              window.location.href = checkoutData.url;
            } else {
              throw new Error('No checkout URL returned');
            }
          } catch (stripeError: any) {
            await ErrorLogger.logError(stripeError, {
              context: 'Error creating Stripe checkout',
              userId: authData.user.id,
            });
            
            toast({
              title: "Payment Setup Error",
              description: "Please try again or contact support at hello@aderai.io",
              variant: "destructive",
            });
            
            // Still allow them to proceed to try again
            navigate('/signup?payment=error');
          }
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "Successfully signed in",
        });

        // Identify returning user with PostHog
        identifyUser(data.user.id, {
          email: sanitizedEmail,
        });

        trackEvent('User Signed In', {
          method: 'email',
        });

        navigate('/dashboard');
      }
    } catch (error: any) {
      await ErrorLogger.logAuthError(
        error, 
        isSignUp ? 'signup' : 'signin'
      );
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignInCard
      isSignUp={isSignUp}
      onToggleMode={() => setIsSignUp(!isSignUp)}
      onSubmit={handleAuth}
      isLoading={loading}
    />
  );
}
