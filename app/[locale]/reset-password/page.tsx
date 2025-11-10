import { Link, redirect } from "@/i18n/navigation";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { userServiceApiClient } from "@/lib/services/user-service-api-client";
import { Button } from "@/components/ui/button";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    redirect({ href: '/forgot-password', locale: 'en' });
    return null;
  }

  let isValidToken = false;
  let errorMessage = '';

  try {
    const result = await userServiceApiClient.passwordResetVerify(token);
    isValidToken = result.success;
    if (!result.success) {
      errorMessage = result.message;
    }
  } catch (error) {
    console.error('Token verification error:', error);
    isValidToken = false;
    errorMessage = 'An error occurred while verifying the reset token. Please try again.';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Reset password</h1>
          <p className="text-muted-foreground mt-2">
            Enter your new password below
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-lg p-8">
          {isValidToken ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm text-destructive">
                  {errorMessage}
                </p>
              </div>
              <Link href="/forgot-password">
                <Button className="w-full" size="lg">
                  Request new reset link
                </Button>
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

