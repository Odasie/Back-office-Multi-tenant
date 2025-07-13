import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthCallbackProps {
  onComplete?: () => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [processed, setProcessed] = useState(false);

  const redirectUserToDashboard = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('department, role')
        .eq('user_id', userId)
        .single();

      if (profile?.department) {
        navigate(`/dashboard/${profile.department}`);
      } else {
        navigate('/dashboard/sales'); // Default department
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      navigate('/dashboard/sales');
    }
  };

  const parseHashParams = (hash: string) => {
    const params = new URLSearchParams(hash.substring(1)); // Remove the '#' at the beginning
    return {
      access_token: params.get('access_token'),
      refresh_token: params.get('refresh_token'),
      expires_in: params.get('expires_in'),
      token_type: params.get('token_type'),
      type: params.get('type'),
      error: params.get('error'),
      error_description: params.get('error_description'),
    };
  };

  const handleEmailConfirmation = async () => {
    if (loading || processed) return;

    const hash = window.location.hash;
    if (!hash) return;

    const params = parseHashParams(hash);
    
    // Check for errors in the URL
    if (params.error) {
      toast({
        title: 'Confirmation Failed',
        description: params.error_description || 'An error occurred during confirmation.',
        variant: 'destructive',
      });
      navigate('/auth', { replace: true });
      return;
    }

    // Check if this is a signup confirmation
    if (params.type === 'signup' && params.access_token) {
      setLoading(true);
      setProcessed(true);
      
      try {
        // Verify the email confirmation
        const { data, error } = await supabase.auth.verifyOtp({
          type: 'signup',
          token_hash: params.access_token,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          toast({
            title: 'Email Confirmed!',
            description: 'Your account has been confirmed. Redirecting to dashboard...',
          });

          // Small delay to show the success message
          setTimeout(() => {
            redirectUserToDashboard(data.user.id);
          }, 1500);
        }
      } catch (error: any) {
        console.error('Email confirmation error:', error);
        toast({
          title: 'Confirmation Failed',
          description: error.message || 'Failed to confirm your email. Please try again.',
          variant: 'destructive',
        });
        navigate('/auth', { replace: true });
      } finally {
        setLoading(false);
      }
    } else if (params.type === 'recovery' && params.access_token) {
      // Handle password recovery (future enhancement)
      toast({
        title: 'Password Reset',
        description: 'Please set your new password.',
      });
      // Could redirect to password reset form
    } else if (params.access_token && !params.type) {
      // Handle other OAuth flows or session restoration
      setLoading(true);
      setProcessed(true);

      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token || '',
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          toast({
            title: 'Welcome back!',
            description: 'Successfully signed in. Redirecting...',
          });

          setTimeout(() => {
            redirectUserToDashboard(data.user.id);
          }, 1500);
        }
      } catch (error: any) {
        console.error('Session restoration error:', error);
        toast({
          title: 'Sign In Failed',
          description: error.message || 'Failed to sign in. Please try again.',
          variant: 'destructive',
        });
        navigate('/auth', { replace: true });
      } finally {
        setLoading(false);
      }
    }

    // Clean up the URL hash after processing
    if (params.access_token || params.error) {
      window.history.replaceState(null, '', window.location.pathname);
      if (onComplete) {
        onComplete();
      }
    }
  };

  useEffect(() => {
    // Only process if we're not already processing and user is not logged in
    if (!processed && !user) {
      handleEmailConfirmation();
    }
  }, [processed, user]);

  useEffect(() => {
    // If user becomes available and we were processing, redirect them
    if (user && processed) {
      redirectUserToDashboard(user.id);
    }
  }, [user, processed]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Confirming Email
            </CardTitle>
            <CardDescription>
              Please wait while we confirm your email address...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing confirmation...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};