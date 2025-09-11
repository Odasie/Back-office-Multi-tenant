import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthCallbackProps {
  onVerificationComplete?: () => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onVerificationComplete }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'processing' | 'success' | 'error' | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Parse hash parameters from URL
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');
      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');

      // Handle errors first
      if (error) {
        setStatus('error');
        toast({
          title: 'Confirmation failed',
          description: errorDescription || 'An error occurred during confirmation',
          variant: 'destructive',
        });
        
        // Clean URL and redirect to auth page
        setTimeout(() => {
          window.history.replaceState({}, document.title, '/auth');
          navigate('/auth', { replace: true });
        }, 3000);
        return;
      }

      // If no tokens or type, nothing to process
      if (!accessToken || !type) {
        return;
      }

      setLoading(true);
      setStatus('processing');

      try {
        // Handle different confirmation types
        switch (type) {
          case 'signup':
            await handleSignupConfirmation(accessToken, refreshToken);
            break;
          case 'recovery':
            await handlePasswordRecovery(accessToken, refreshToken);
            break;
          case 'email_change':
            await handleEmailChange(accessToken, refreshToken);
            break;
          default:
            throw new Error(`Unknown confirmation type: ${type}`);
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        toast({
          title: 'Confirmation failed',
          description: error.message || 'Failed to process confirmation',
          variant: 'destructive',
        });
        
        // Clean URL and redirect to auth page after error
        setTimeout(() => {
          window.history.replaceState({}, document.title, '/auth');
          navigate('/auth', { replace: true });
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [location.hash, navigate, toast, onVerificationComplete]);

  const handleSignupConfirmation = async (accessToken: string, refreshToken: string | null) => {
    // Set the session with the tokens
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      setStatus('success');
      toast({
        title: 'Email confirmed!',
        description: 'Your account has been successfully verified. Redirecting to dashboard...',
      });

      // Clean the URL hash
      window.history.replaceState({}, document.title, '/auth');

      // Redirect to appropriate dashboard based on user profile
      setTimeout(async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('department, role')
            .eq('user_id', data.user.id)
            .single();

          if (profile?.department) {
            navigate(`/dashboard/${profile.department}`, { replace: true });
          } else {
            navigate('/dashboard/sales', { replace: true });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          navigate('/dashboard/sales', { replace: true });
        }

        onVerificationComplete?.();
      }, 2000);
    }
  };

  const handlePasswordRecovery = async (accessToken: string, refreshToken: string | null) => {
    // Set the session for password recovery
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    });

    if (error) {
      throw error;
    }

    setStatus('success');
    toast({
      title: 'Password reset confirmed',
      description: 'You can now set a new password.',
    });

    // Redirect to password reset page (implement as needed)
    setTimeout(() => {
      window.history.replaceState({}, document.title, '/auth');
      navigate('/auth', { replace: true });
    }, 2000);
  };

  const handleEmailChange = async (accessToken: string, refreshToken: string | null) => {
    // Handle email change confirmation
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    });

    if (error) {
      throw error;
    }

    setStatus('success');
    toast({
      title: 'Email change confirmed',
      description: 'Your email address has been updated successfully.',
    });

    setTimeout(() => {
      window.history.replaceState({}, document.title, '/auth');
      navigate('/dashboard/sales', { replace: true });
    }, 2000);
  };

  // Don't render anything if we're not processing
  if (!loading && !status) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {status === 'processing' && 'Confirming your account...'}
            {status === 'success' && 'Confirmation successful!'}
            {status === 'error' && 'Confirmation failed'}
          </CardTitle>
          <CardDescription>
            {status === 'processing' && 'Please wait while we verify your email confirmation.'}
            {status === 'success' && 'Your account has been verified successfully.'}
            {status === 'error' && 'There was an issue confirming your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {(loading || status === 'processing') && (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          )}
          {status === 'success' && (
            <div className="flex items-center text-primary">
              <svg className="h-8 w-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Verified!
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center text-destructive">
              <svg className="h-8 w-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Failed
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};