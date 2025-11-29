import { Link, redirect } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { userServiceApiClient } from "@/lib/services/user-service-api-client";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    redirect({ href: '/login', locale: 'en' });
    return null;
  }

  let isVerified = false;
  let errorMessage = '';
  let successMessage = '';

  try {
    const result = await userServiceApiClient.verifyEmail(token);
    isVerified = result.success;
    successMessage = result.message || 'Your email has been verified successfully!';
  } catch (error) {
    console.error('Email verification error:', error);
    isVerified = false;
    errorMessage = error instanceof Error ? error.message : 'An error occurred while verifying your email. Please try again.';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
            isVerified 
              ? 'bg-green-500/10' 
              : errorMessage 
                ? 'bg-destructive/10' 
                : 'bg-primary/10'
          }`}>
            {isVerified ? (
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className={`w-8 h-8 ${errorMessage ? 'text-destructive' : 'text-primary'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isVerified ? 'Email Verified' : 'Verify Email'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isVerified 
              ? 'Your email address has been successfully verified' 
              : 'Verifying your email address...'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-lg p-8">
          {isVerified ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4">
                <p className="text-sm text-green-600 dark:text-green-400">
                  {successMessage}
                </p>
              </div>
              <Link href="/login">
                <Button className="w-full" size="lg">
                  Continue to Login
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm text-destructive">
                  {errorMessage}
                </p>
              </div>
              <Link href="/register">
                <Button className="w-full" size="lg" variant="outline">
                  Back to Registration
                </Button>
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isVerified ? (
            <>
              Need help?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Contact Support
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Back to login
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

