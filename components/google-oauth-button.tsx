'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { bffAuthClient, BffApiError } from '@/lib/clients/bff-auth-client';
import { useRouter } from '@/i18n/navigation';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, config: { theme?: string; size?: string; text?: string; width?: string; type?: string }) => void;
        };
      };
    };
  }
}

export const GoogleOAuthButton = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const hiddenButtonRef = useRef<HTMLDivElement>(null);

  const handleCredentialResponse = async (response: { credential: string }) => {
    try {
      setIsLoading(true);

      const result = await bffAuthClient.googleOAuth({
        idToken: response.credential,
      });

      if (result.accountLinked) {
        toast.success('Your Google account has been linked to your existing account!');
      } else if (result.isNewUser) {
        toast.success('Account created successfully!');
      } else {
        toast.success('Login successful!');
      }

      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error) {
      console.error('Google OAuth error:', error);
      if (error instanceof BffApiError) {
        toast.error(error.message);
      } else {
        toast.error('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (!isGoogleLoaded || !hiddenButtonRef.current) {
      toast.error('Google Sign-In is not ready. Please try again.');
      return;
    }

    // Find and click the hidden Google button
    const googleButton = hiddenButtonRef.current.querySelector('div[role="button"]') as HTMLElement;
    if (googleButton) {
      googleButton.click();
    } else {
      toast.error('Failed to start Google sign-in. Please try again.');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !hiddenButtonRef.current) return;

    const loadGoogleScript = () => {
      if (window.google && hiddenButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: handleCredentialResponse,
        });

        // Render Google button in hidden container
        window.google.accounts.id.renderButton(hiddenButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          width: '100%',
          type: 'standard',
        });

        setIsGoogleLoaded(true);
      }
    };

    if (window.google) {
      loadGoogleScript();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = loadGoogleScript;
      script.onerror = () => {
        toast.error('Failed to load Google Sign-In. Please refresh the page.');
      };
      document.head.appendChild(script);
    }
  }, []);

  return (
    <>
      {/* Hidden Google button container */}
      <div ref={hiddenButtonRef} className="hidden" aria-hidden="true" />
      
      {/* Custom button matching GitHub style */}
      <Button
        variant="outline"
        type="button"
        onClick={handleButtonClick}
        disabled={isLoading || !isGoogleLoaded}
        className="w-full"
      >
        <svg
          className="w-5 h-5 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Google
      </Button>
    </>
  );
};

