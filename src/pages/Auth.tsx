import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SignInCard } from "@/components/ui/sign-in-card";
import { ErrorLogger } from "@/lib/errorLogger";
import { sanitizeEmail, sanitizeString, validatePassword } from "@/lib/inputSanitization";
import { identifyUser, trackEvent, setGroup } from '@/lib/analytics';

interface AuthProps {
  onComplete?: (user: any) => void;
  initialView?: "signup" | "signin";
}

export default function Auth({ onComplete, initialView = "signup" }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(initialView === "signup");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
          // Verify profile was created by trigger, create manually if not
          let profileExists = false;
          let retries = 0;
          const maxRetries = 3;

          while (!profileExists && retries < maxRetries) {
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('id')
              .eq('id', authData.user.id)
              .maybeSingle();

            if (profile) {
              profileExists = true;
            } else {
              // Wait 500ms and retry
              await new Promise(resolve => setTimeout(resolve, 500));
              retries++;
            }
          }

          // If profile still doesn't exist after retries, create it manually
          if (!profileExists) {
            await ErrorLogger.logWarning('Profile not created by trigger, creating manually', {
              userId: authData.user.id,
              email: sanitizedEmail,
            });
            
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: authData.user.id,
                email: sanitizedEmail,
                first_name: sanitizedFirstName || '',
                account_name: sanitizedBrandName || sanitizedEmail.split('@')[0],
                password_hash: '', // Managed by auth.users
                email_verified: false,
              });

            if (createError) {
              await ErrorLogger.logError(createError, {
                context: 'Manual profile creation',
                userId: authData.user.id,
              });
              
              // Log to analytics
              await supabase.from('analytics_events').insert({
                user_id: authData.user.id,
                event_name: 'profile_creation_failed',
                event_metadata: {
                  email: sanitizedEmail,
                  error: createError.message,
                }
              });

              toast({
                title: "Profile Creation Error",
                description: "Please contact support at akshat@aderai.io",
                variant: "destructive",
              });
              return;
            }
            
            // Profile created manually, also create notification preferences
            try {
              await supabase.from('notification_preferences').insert({
                user_id: authData.user.id,
              });
            } catch (notifErr) {
              await ErrorLogger.logError(notifErr as Error, {
                context: 'Failed to create notification preferences',
                userId: authData.user.id,
              });
            }
          }

          // Send welcome email
          try {
            await supabase.functions.invoke('send-welcome-email', {
              body: {
                email: sanitizedEmail,
                userName: sanitizedFirstName || sanitizedEmail.split('@')[0],
                accountType: 'brand',
                userId: authData.user.id,
              },
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

          // Create Stripe checkout session and redirect
          try {
            const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
              'stripe-create-checkout',
              {
                body: { origin: window.location.origin },
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
              description: "Please try again or contact support at akshat@aderai.io",
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
